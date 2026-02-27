import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { Workspace, WorkspaceMember } from '../types/database';

// Fetch workspace details
export function useWorkspace(workspaceId: string | undefined) {
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!workspaceId) { setLoading(false); return; }
        setLoading(true);
        const { data } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', workspaceId)
            .single();
        setWorkspace(data as Workspace | null);
        setLoading(false);
    }, [workspaceId]);

    useEffect(() => { fetch(); }, [fetch]);
    return { workspace, loading, refetch: fetch };
}

// Fetch workspace members with profiles
export function useWorkspaceMembers(workspaceId: string | undefined) {
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!workspaceId) { setLoading(false); return; }
        setLoading(true);
        const { data } = await supabase
            .from('workspace_members')
            .select('*, profile:profiles(*)')
            .eq('workspace_id', workspaceId)
            .order('created_at');
        setMembers((data as WorkspaceMember[]) || []);
        setLoading(false);
    }, [workspaceId]);

    useEffect(() => { fetch(); }, [fetch]);
    return { members, loading, refetch: fetch };
}

// Create a workspace
export function useCreateWorkspace() {
    const create = async (data: { name: string; country_id: string; owner_id: string; type: string; commercial_record_number?: string }) => {
        const { data: workspace, error } = await supabase
            .from('workspaces')
            .insert(data)
            .select()
            .single();
        return { workspace, error };
    };
    return { create };
}

// Add a member to workspace
export function useAddWorkspaceMember() {
    const add = async (workspaceId: string, userId: string, role: string) => {
        const { error } = await supabase
            .from('workspace_members')
            .insert({ workspace_id: workspaceId, user_id: userId, role });
        return { error };
    };
    return { add };
}
