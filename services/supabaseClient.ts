/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Check your .env file.');
}

// Authenticated client — used for login, dashboard, user-specific queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: (url, options) => {
            // Strip AbortSignal to prevent React StrictMode double-mount from aborting requests
            const { signal, ...rest } = options || {};
            return fetch(url, rest);
        },
    },
});

// Public client — always uses anon role (no auth session)
// Used for fetching public content (hero, features, services, nav links, etc.)
// so RLS policies that only allow `anon` still work when user is logged in
// Uses custom storage to avoid conflicting with main auth client
const noopStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
};

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'sb-public-noop',
        storage: noopStorage,
    },
});
