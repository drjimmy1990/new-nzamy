import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body?: string;
    data: Record<string, unknown>;
    read: boolean;
    created_at: string;
}

export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) console.error('Error fetching notifications:', error);
        const items = (data as Notification[]) || [];
        setNotifications(items);
        setUnreadCount(items.filter(n => !n.read).length);
        setLoading(false);
    }, [userId]);

    // Real-time subscription for new notifications
    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`notifications_${userId}`)
            .on(
                'postgres_changes' as any,
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload: any) => {
                    const newNotif = payload.new as Notification;
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markAsRead = async (notificationId: string) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        if (!userId) return;
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return { notifications, loading, unreadCount, refetch: fetchNotifications, markAsRead, markAllRead };
}
