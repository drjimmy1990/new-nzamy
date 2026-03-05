import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../services/supabaseClient';
import { Users, UserPlus, Trash2, Shield, Crown, Loader, Mail, CheckCircle, XCircle } from 'lucide-react';

interface MemberWithProfile {
    id: string;
    workspace_id: string;
    user_id: string;
    role: string;
    created_at: string;
    profile?: {
        id: string;
        full_name: string | null;
        avatar_url?: string | null;
        p_type?: string | null;
        s_type?: string | null;
    };
}

interface TeamManagementWidgetProps {
    workspaceId: string | undefined;
    members: MemberWithProfile[];
    loading: boolean;
    refetch: () => void;
}

const ROLE_LABELS: Record<string, [string, string]> = {
    owner: ['المالك', 'Owner'],
    admin: ['مدير', 'Admin'],
    member: ['عضو', 'Member'],
    trainee: ['متدرب', 'Trainee'],
};

const ROLE_ICONS: Record<string, React.ElementType> = {
    owner: Crown,
    admin: Shield,
    member: Users,
    trainee: Users,
};

const TeamManagementWidget: React.FC<TeamManagementWidgetProps> = ({ workspaceId, members, loading, refetch }) => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isOwner = members.some(m => m.user_id === profile?.id && m.role === 'owner');
    const isAdmin = members.some(m => m.user_id === profile?.id && (m.role === 'owner' || m.role === 'admin'));

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !workspaceId) return;
        setInviting(true);
        setError('');
        setSuccess('');

        // Find user by email
        const { data: foundUser } = await supabase
            .from('profiles')
            .select('id, full_name')
            .ilike('id', `%`) // We need to search by email — use auth
            .limit(1);

        // Alternative: search by looking up the email in auth (not possible from client)
        // So we'll use a simpler approach: search profiles table
        // Since profiles don't have email, we'll insert by userId if they share it
        // For now, show an informative message
        setError(t(
            'أدخل معرف المستخدم (UUID) مباشرة — البحث بالايميل قريباً',
            'Enter user ID (UUID) directly — email search coming soon'
        ));
        setInviting(false);
    };

    const handleInviteById = async () => {
        if (!inviteEmail.trim() || !workspaceId) return;
        setInviting(true);
        setError('');
        setSuccess('');

        // Check if it's a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUUID = uuidRegex.test(inviteEmail.trim());

        if (!isUUID) {
            // Try to find by name
            const { data: users } = await supabase
                .from('profiles')
                .select('id, full_name')
                .ilike('full_name', `%${inviteEmail.trim()}%`)
                .limit(1);

            if (users && users.length > 0) {
                const userId = users[0].id;
                // Check if already a member
                const existing = members.find(m => m.user_id === userId);
                if (existing) {
                    setError(t('هذا المستخدم عضو بالفعل', 'User is already a member'));
                    setInviting(false);
                    return;
                }

                const { error: addError } = await supabase
                    .from('workspace_members')
                    .insert({ workspace_id: workspaceId, user_id: userId, role: inviteRole });

                if (addError) {
                    setError(addError.message);
                } else {
                    setSuccess(t(`تمت إضافة ${users[0].full_name}`, `Added ${users[0].full_name}`));
                    setInviteEmail('');
                    refetch();
                }
            } else {
                setError(t('لم يتم العثور على المستخدم', 'User not found'));
            }
        } else {
            // Direct UUID
            const existing = members.find(m => m.user_id === inviteEmail.trim());
            if (existing) {
                setError(t('هذا المستخدم عضو بالفعل', 'User is already a member'));
                setInviting(false);
                return;
            }

            const { error: addError } = await supabase
                .from('workspace_members')
                .insert({ workspace_id: workspaceId, user_id: inviteEmail.trim(), role: inviteRole });

            if (addError) {
                setError(addError.message);
            } else {
                setSuccess(t('تمت إضافة العضو', 'Member added'));
                setInviteEmail('');
                refetch();
            }
        }
        setInviting(false);
    };

    const handleRemove = async (memberId: string) => {
        const { error } = await supabase
            .from('workspace_members')
            .delete()
            .eq('id', memberId);
        if (!error) refetch();
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        const { error } = await supabase
            .from('workspace_members')
            .update({ role: newRole })
            .eq('id', memberId);
        if (!error) refetch();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users className="text-[#C8A762]" size={20} />
                    {t('إدارة الفريق', 'Team Management')}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-bold">
                    {members.length} {t('عضو', 'members')}
                </span>
            </div>

            {/* Invite Section */}
            {isAdmin && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder={t('اسم العضو أو المعرف...', 'Member name or ID...')}
                            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A762]/50"
                        />
                        <select
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                        >
                            <option value="member">{t('عضو', 'Member')}</option>
                            <option value="admin">{t('مدير', 'Admin')}</option>
                            <option value="trainee">{t('متدرب', 'Trainee')}</option>
                        </select>
                        <button
                            onClick={handleInviteById}
                            disabled={inviting || !inviteEmail.trim()}
                            className="px-4 py-2 bg-[#0B3D2E] text-white rounded-lg text-sm font-bold hover:bg-[#0B3D2E]/90 transition disabled:opacity-50 flex items-center gap-1"
                        >
                            {inviting ? <Loader className="animate-spin" size={14} /> : <UserPlus size={14} />}
                            {t('إضافة', 'Add')}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    {success && <p className="text-green-500 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> {success}</p>}
                </div>
            )}

            {/* Members List */}
            {loading ? (
                <div className="p-6 text-center">
                    <Loader className="animate-spin mx-auto text-gray-400" size={24} />
                </div>
            ) : members.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                    <Users className="mx-auto mb-2" size={32} />
                    {t('لا يوجد أعضاء', 'No members')}
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {members.map(member => {
                        const RoleIcon = ROLE_ICONS[member.role] || Users;
                        const roleLabel = ROLE_LABELS[member.role] || ['عضو', 'Member'];
                        const isCurrentUser = member.user_id === profile?.id;
                        const canModify = isAdmin && !isCurrentUser && member.role !== 'owner';

                        return (
                            <div key={member.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <div className="w-10 h-10 bg-[#C8A762]/20 rounded-full flex items-center justify-center">
                                    <RoleIcon className="text-[#C8A762]" size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-800 dark:text-white truncate">
                                        {(member as any).profile?.full_name || member.user_id.slice(0, 8)}
                                        {isCurrentUser && <span className="text-[10px] text-gray-400 mr-2 ml-2">({t('أنت', 'You')})</span>}
                                    </p>
                                    <span className={`text-xs ${member.role === 'owner' ? 'text-[#C8A762]' : 'text-gray-500'}`}>
                                        {isRTL ? roleLabel[0] : roleLabel[1]}
                                    </span>
                                </div>
                                {canModify && (
                                    <div className="flex items-center gap-1">
                                        <select
                                            value={member.role}
                                            onChange={e => handleRoleChange(member.id, e.target.value)}
                                            className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 border-none"
                                        >
                                            <option value="member">{t('عضو', 'Member')}</option>
                                            <option value="admin">{t('مدير', 'Admin')}</option>
                                            <option value="trainee">{t('متدرب', 'Trainee')}</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemove(member.id)}
                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TeamManagementWidget;
