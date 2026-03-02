import { useState, useEffect, useCallback } from 'react';
import { supabasePublic as supabase } from '../services/supabaseClient';
import type {
    SiteSetting, HeroContent, Feature, Service, Stat,
    TeamMember, Testimonial, FaqItem, SocialLink, NavLink,
    ClientLogo, Page
} from '../types/database';

// =============================================
// Generic hook for fetching country-filtered data
// =============================================
function useSupabaseQuery<T>(
    table: string,
    countryId: string | null | undefined,
    options?: {
        orderBy?: string;
        filters?: Record<string, unknown>;
        single?: boolean;
        enabled?: boolean;
    }
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const enabled = options?.enabled !== false;

    const refetch = useCallback(async () => {
        if (!enabled) return;
        setLoading(true);
        setError(null);

        try {
            let query = supabase.from(table).select('*');

            // Filter by country
            if (countryId) {
                query = query.eq('country_id', countryId);
            }

            // Apply additional filters
            if (options?.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            // Order
            if (options?.orderBy) {
                query = query.order(options.orderBy);
            }

            const { data: result, error: err } = await query;

            if (err) {
                // Suppress AbortError from React StrictMode double-mount
                if (err.message?.includes('AbortError') || err.code === 'PGRST116') {
                    setLoading(false);
                    return;
                }
                setError(err.message);
                console.error(`Error fetching ${table}:`, err);
            } else {
                setData((result as T[]) || []);
            }
        } catch (err: any) {
            if (err?.name === 'AbortError') return;
            console.error(`Error fetching ${table}:`, err);
            setError(err?.message || 'Unknown error');
        }
        setLoading(false);
    }, [table, countryId, enabled, options?.orderBy, JSON.stringify(options?.filters)]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}


// =============================================
// Site Settings — returns a key-value map
// =============================================
export function useSiteSettings(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<SiteSetting>(
        'site_settings', countryId
    );

    // Convert array to key-value map
    const settings = data.reduce<Record<string, { ar: string; en: string }>>((acc, s) => {
        acc[s.setting_key] = { ar: s.value_ar || '', en: s.value_en || '' };
        return acc;
    }, {});

    // Helper to get value by language
    const get = (key: string, lang: 'ar' | 'en'): string => {
        return settings[key]?.[lang] || settings[key]?.ar || '';
    };

    return { settings, get, loading, error, refetch };
}


// =============================================
// Hero Content
// =============================================
export function useHero(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<HeroContent>(
        'hero_content', countryId, { filters: { is_active: true } }
    );
    return { hero: data[0] || null, loading, error, refetch };
}


// =============================================
// Features
// =============================================
export function useFeatures(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<Feature>(
        'features', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );
    return { features: data, loading, error, refetch };
}


// =============================================
// Services (filterable by category)
// =============================================
export function useServices(countryId: string | null | undefined, category?: 'personal' | 'company') {
    const filters: Record<string, unknown> = { is_active: true };
    if (category) filters.category = category;

    const { data, loading, error, refetch } = useSupabaseQuery<Service>(
        'services', countryId, { orderBy: 'display_order', filters }
    );
    return { services: data, loading, error, refetch };
}


// =============================================
// Stats
// =============================================
export function useStats(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<Stat>(
        'stats', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );
    return { stats: data, loading, error, refetch };
}


// =============================================
// Team Members
// =============================================
export function useTeam(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<TeamMember>(
        'team_members', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );
    return { members: data, loading, error, refetch };
}

export function useTeamMember(slug: string, countryId: string | null | undefined) {
    const [member, setMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            let query = supabase.from('team_members').select('*').eq('slug', slug);
            if (countryId) query = query.eq('country_id', countryId);
            const { data } = await query.single();
            setMember(data);
            setLoading(false);
        };
        if (slug) fetch();
    }, [slug, countryId]);

    return { member, loading };
}


// =============================================
// Testimonials
// =============================================
export function useTestimonials(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<Testimonial>(
        'testimonials', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );
    return { testimonials: data, loading, error, refetch };
}


// =============================================
// FAQ Items
// =============================================
export function useFAQ(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<FaqItem>(
        'faq_items', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );
    return { faqs: data, loading, error, refetch };
}


// =============================================
// Social Links
// =============================================
export function useSocialLinks(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<SocialLink>(
        'social_links', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );
    return { socialLinks: data, loading, error, refetch };
}


// =============================================
// Nav Links (with parent-child tree)
// =============================================
export function useNavLinks(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<NavLink>(
        'nav_links', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );

    // Build tree: top-level items with children nested
    const tree = data
        .filter(link => !link.parent_id)
        .map(parent => ({
            ...parent,
            children: data.filter(child => child.parent_id === parent.id),
        }));

    return { navLinks: tree, loading, error, refetch };
}


// =============================================
// Client Logos
// =============================================
export function useClientLogos(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<ClientLogo>(
        'client_logos', countryId, {
        orderBy: 'display_order',
        filters: { is_active: true }
    }
    );
    return { logos: data, loading, error, refetch };
}


// =============================================
// CMS Pages
// =============================================
export function usePages(countryId: string | null | undefined) {
    const { data, loading, error, refetch } = useSupabaseQuery<Page>(
        'pages', countryId, { filters: { is_published: true } }
    );
    return { pages: data, loading, error, refetch };
}

export function usePage(slug: string, countryId: string | null | undefined) {
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            let query = supabase.from('pages').select('*').eq('slug', slug).eq('is_published', true);
            if (countryId) query = query.eq('country_id', countryId);
            const { data } = await query.single();
            setPage(data);
            setLoading(false);
        };
        if (slug) fetch();
    }, [slug, countryId]);

    return { page, loading };
}


// =============================================
// Contact Form Submission
// =============================================
export function useContact() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const submitContact = async (data: {
        name: string;
        email: string;
        phone: string;
        service_type: string;
        message: string;
        country_id: string | null;
    }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: err } = await supabase
                .from('contact_submissions')
                .insert([data]);

            if (err) throw err;
            setSuccess(true);
        } catch (err: any) {
            console.error('Error submitting contact form:', err);
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    return { submitContact, loading, error, success };
}
