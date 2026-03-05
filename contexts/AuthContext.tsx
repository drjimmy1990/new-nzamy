import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, supabasePublic } from '../services/supabaseClient';
import { Profile, AccountCategory, SeekerType, ProviderType } from '../types/database';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    // Legacy
    isAdmin: boolean;
    // RBAC helpers
    isSeeker: boolean;
    isProvider: boolean;
    accountType: AccountCategory | null;
    seekerType: SeekerType | null;
    providerType: ProviderType | null;
    isVerified: boolean;
    // Auth actions
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (
        email: string,
        password: string,
        fullName: string,
        countryId: string,
        accountCat: AccountCategory,
        subType: SeekerType | ProviderType
    ) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    // Helper to get dashboard path
    getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string, retryCount = 0): Promise<void> => {
        try {
            // Try authenticated client first
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data as Profile);
                return;
            }

            // Fallback to public client if RLS blocks authenticated reads
            if (error) {
                console.warn('Auth profile fetch failed, trying public client:', error.message);
                const { data: pubData } = await supabasePublic
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (pubData) {
                    setProfile(pubData as Profile);
                    return;
                }
            }

            // If both failed and we haven't retried yet, wait and try once more
            // (handles race condition where trigger hasn't created the profile yet)
            if (retryCount < 2) {
                console.warn(`[AuthContext] Profile not found, retrying in 500ms (attempt ${retryCount + 1})...`);
                await new Promise(resolve => setTimeout(resolve, 500));
                return fetchProfile(userId, retryCount + 1);
            }

            console.warn('[AuthContext] Profile not found after retries, setting null');
            setProfile(null);
        } catch (err) {
            console.error('Unhandled error in fetchProfile:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            if (error || !session) {
                // Stale/invalid session — clear everything
                setSession(null);
                setUser(null);
                setProfile(null);
                setIsLoading(false);
                return;
            }
            setSession(session);
            setUser(session.user);
            await fetchProfile(session.user.id);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // Handle token refresh failure or explicit sign out
                if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    return;
                }

                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    };

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        countryId: string,
        accountCat: AccountCategory,
        subType: SeekerType | ProviderType
    ) => {
        // Step 1: Create auth user with just full_name (trigger only sets basic profile)
        const { data: signUpData, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });

        if (error) return { error: error.message };

        // Step 2: Use RPC to set RBAC fields (bypasses RLS via SECURITY DEFINER)
        if (signUpData.user) {
            const { error: rpcError } = await (supabase.rpc as any)('setup_user_role', {
                user_id: signUpData.user.id,
                p_country_id: countryId,
                p_account_cat: accountCat,
                p_s_type: accountCat === 'seeker' ? subType : null,
                p_p_type: accountCat === 'provider' ? subType : null,
            });

            if (rpcError) {
                console.error('RPC setup_user_role error:', rpcError);
                return { error: rpcError.message };
            }

            // Step 3: Auto-create workspace for Company or Law Firm
            const needsWorkspace =
                (accountCat === 'seeker' && subType === 'company') ||
                (accountCat === 'provider' && subType === 'law_firm');

            if (needsWorkspace) {
                const wsType = subType === 'company' ? 'company' : 'law_firm';
                const { data: ws } = await supabase
                    .from('workspaces')
                    .insert({
                        name: `${fullName} Workspace`,
                        country_id: countryId,
                        owner_id: signUpData.user.id,
                        type: wsType,
                    })
                    .select('id')
                    .single();

                // Add the owner as a workspace member
                if (ws) {
                    await supabase
                        .from('workspace_members')
                        .insert({
                            workspace_id: ws.id,
                            user_id: signUpData.user.id,
                            role: 'owner',
                        });
                }
            }
        }

        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    const getDashboardPath = (): string => {
        if (!profile) return '/login';
        if (profile.role === 'admin') return '/admin';
        if (profile.account_cat === 'provider' && profile.p_type) {
            return `/dashboard/provider/${profile.p_type}`;
        }
        if (profile.account_cat === 'seeker' && profile.s_type) {
            return `/dashboard/seeker/${profile.s_type}`;
        }
        return '/';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                isAdmin: profile?.role === 'admin',
                isSeeker: profile?.account_cat === 'seeker',
                isProvider: profile?.account_cat === 'provider',
                accountType: profile?.account_cat ?? null,
                seekerType: profile?.s_type ?? null,
                providerType: profile?.p_type ?? null,
                isVerified: profile?.is_verified ?? false,
                signIn,
                signUp,
                signOut,
                getDashboardPath,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
