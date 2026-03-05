import { useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { ServiceRequest } from '../types/database';

type RealtimeCallback = (
    eventType: 'INSERT' | 'UPDATE' | 'DELETE',
    request: ServiceRequest
) => void;

/**
 * Subscribe to real-time changes on service_requests table.
 * Filters by either seeker_id or provider_id based on the user's role.
 *
 * Usage:
 * ```tsx
 * useRealtimeRequests(userId, 'seeker', (event, req) => {
 *   if (event === 'UPDATE') refetch();
 * });
 * ```
 */
export function useRealtimeRequests(
    userId: string | undefined,
    role: 'seeker' | 'provider',
    onEvent: RealtimeCallback
) {
    const stableCallback = useCallback(onEvent, []);

    useEffect(() => {
        if (!userId) return;

        const filterColumn = role === 'seeker' ? 'seeker_id' : 'provider_id';

        const channel = supabase
            .channel(`requests_${role}_${userId}`)
            .on(
                'postgres_changes' as any,
                {
                    event: '*',
                    schema: 'public',
                    table: 'service_requests',
                    filter: `${filterColumn}=eq.${userId}`,
                },
                (payload: any) => {
                    const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
                    const newRecord = (payload.new || payload.old) as ServiceRequest;
                    stableCallback(eventType, newRecord);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, role, stableCallback]);
}

/**
 * Subscribe to real-time pool requests (pending_match with no provider).
 * Used by provider dashboards to get new request notifications.
 */
export function useRealtimePool(
    countryId: string | undefined,
    onEvent: RealtimeCallback
) {
    const stableCallback = useCallback(onEvent, []);

    useEffect(() => {
        if (!countryId) return;

        const channel = supabase
            .channel(`pool_${countryId}`)
            .on(
                'postgres_changes' as any,
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'service_requests',
                    filter: `country_id=eq.${countryId}`,
                },
                (payload: any) => {
                    const newRecord = payload.new as ServiceRequest;
                    if (newRecord.status === 'pending_match' && !newRecord.provider_id) {
                        stableCallback('INSERT', newRecord);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [countryId, stableCallback]);
}
