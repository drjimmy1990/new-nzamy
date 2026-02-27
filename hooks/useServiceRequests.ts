import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ServiceRequest, RequestStatus, ServiceCategoryV2 } from '../types/database';

// Fetch service requests for a seeker (their own)
export function useMyRequests(userId: string | undefined) {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .eq('seeker_id', userId)
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching my requests:', error);
        setRequests((data as ServiceRequest[]) || []);
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetch(); }, [fetch]);
    return { requests, loading, refetch: fetch };
}

// Fetch service requests assigned to a provider
export function useProviderRequests(providerId: string | undefined) {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!providerId) { setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching provider requests:', error);
        setRequests((data as ServiceRequest[]) || []);
        setLoading(false);
    }, [providerId]);

    useEffect(() => { fetch(); }, [fetch]);
    return { requests, loading, refetch: fetch };
}

// Fetch open pool requests (pending_match) for a country
export function usePoolRequests(countryId: string | undefined) {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!countryId) { setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .eq('country_id', countryId)
            .eq('status', 'pending_match')
            .is('provider_id', null)
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching pool requests:', error);
        setRequests((data as ServiceRequest[]) || []);
        setLoading(false);
    }, [countryId]);

    useEffect(() => { fetch(); }, [fetch]);
    return { requests, loading, refetch: fetch };
}

// Create a new service request
export function useCreateRequest() {
    const [loading, setLoading] = useState(false);

    const create = async (data: {
        country_id: string;
        seeker_id: string;
        category: ServiceCategoryV2;
        title: string;
        description?: string;
    }) => {
        setLoading(true);
        const { data: result, error } = await (supabase
            .from('service_requests') as any)
            .insert({ ...data, status: 'pending_match' })
            .select()
            .single();
        setLoading(false);
        return { data: result, error };
    };

    return { create, loading };
}

// Update request status
export function useUpdateRequestStatus() {
    const update = async (requestId: string, status: RequestStatus) => {
        const { error } = await (supabase
            .from('service_requests') as any)
            .update({ status })
            .eq('id', requestId);
        return { error };
    };
    return { update };
}
