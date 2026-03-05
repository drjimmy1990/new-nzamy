import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMyRequests, useCreateRequest } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import KanbanBoardWidget from '../../../components/widgets/KanbanBoardWidget';
import CaseTimelineWidget from '../../../components/widgets/CaseTimelineWidget';
import CreateRequestModal from '../../../components/widgets/CreateRequestModal';
import ContractScannerWidget from '../../../components/widgets/ContractScannerWidget';
import SmartHandoffWidget from '../../../components/widgets/SmartHandoffWidget';
import TeamManagementWidget from '../../../components/widgets/TeamManagementWidget';
import { useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import { useWorkspaceMembers } from '../../../hooks/useWorkspace';
import { supabase } from '../../../services/supabaseClient';
import {
    Shield, Kanban, BarChart3, Users, DollarSign,
    Upload, FileText, AlertTriangle, CheckCircle, Loader, Plus
} from 'lucide-react';

type Tab = '' | 'scanner' | 'board' | 'risk' | 'team' | 'wallet';

const CompanyDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || '') as Tab;

    const { requests, loading, refetch } = useMyRequests(profile?.id);
    const { update: updateStatus } = useUpdateRequestStatus();

    const [showModal, setShowModal] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<string | undefined>();

    // Fetch workspace for company
    useEffect(() => {
        if (!profile?.id) return;
        supabase
            .from('workspaces')
            .select('id')
            .eq('owner_id', profile.id)
            .limit(1)
            .then(({ data, error }) => {
                if (data && data.length > 0) setWorkspaceId(data[0].id);
                if (error) console.warn('Workspace fetch skipped (run schema-part7-fix-rls.sql):', error.message);
            });
    }, [profile?.id]);

    const { members, loading: membersLoading, refetch: refetchMembers } = useWorkspaceMembers(workspaceId);

    const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
    const completedCount = requests.filter(r => r.status === 'completed').length;
    const pendingCount = requests.filter(r => r.status === 'pending_match').length;

    return (
        <div className="space-y-6">
            {activeTab === '' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة تحكم الشركة', 'Company Dashboard')}</h1>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'عقود قيد المراجعة', label_en: 'Contracts Under Review', value: inProgressCount, color: 'text-blue-600' },
                        { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                        { label_ar: 'في الانتظار', label_en: 'Pending', value: pendingCount, color: 'text-amber-600' },
                        { label_ar: 'إجمالي الطلبات', label_en: 'Total Requests', value: requests.length, color: 'text-purple-600' },
                    ]} />
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-4 border-2 border-dashed border-[#C8A762] rounded-xl text-[#C8A762] font-bold hover:bg-[#C8A762]/10 transition flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> {t('إنشاء طلب جديد', 'Create New Request')}
                    </button>
                    {loading ? (
                        <div className="flex justify-center py-4"><Loader className="animate-spin text-[#C8A762]" size={24} /></div>
                    ) : requests.slice(0, 5).map(req => (
                        <CaseTimelineWidget key={req.id} request={req} />
                    ))}
                    <SmartHandoffWidget />
                </div>
            )}

            {activeTab === 'scanner' && (
                <ContractScannerWidget />
            )}

            {activeTab === 'board' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('لوحة المهام', 'Task Board')}</h2>
                    <KanbanBoardWidget
                        requests={requests}
                        onStatusChange={(id, status) => { updateStatus(id, status).then(() => refetch()); }}
                    />
                </div>
            )}

            {activeTab === 'risk' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('لوحة المخاطر القانونية', 'Legal Risk Dashboard')}</h2>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'قضايا مفتوحة', label_en: 'Open Cases', value: inProgressCount, color: 'text-red-600' },
                        { label_ar: 'عقود منتهية قريباً', label_en: 'Expiring Contracts', value: 0, color: 'text-amber-600' },
                        { label_ar: 'عقود سارية', label_en: 'Active Contracts', value: completedCount, color: 'text-green-600' },
                        { label_ar: 'مستوى الخطر', label_en: 'Risk Level', value: inProgressCount > 3 ? 'عالٍ' : 'منخفض', color: inProgressCount > 3 ? 'text-red-600' : 'text-green-600' },
                    ]} />
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <BarChart3 className="mx-auto text-[#C8A762] mb-3" size={40} />
                        <p className="text-gray-500 text-sm">{t('قريباً — رسوم بيانية للمخاطر', 'Coming soon — Risk analytics charts')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'team' && (
                <TeamManagementWidget
                    workspaceId={workspaceId}
                    members={members}
                    loading={membersLoading}
                    refetch={refetchMembers}
                />
            )}

            {activeTab === 'wallet' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <DollarSign className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('المحفظة', 'Wallet')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — رصيد الاشتراك والمدفوعات', 'Coming soon — Subscription balance & payments')}</p>
                </div>
            )}

            {/* Create Request Modal */}
            <CreateRequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onCreated={() => refetch()}
                defaultCategory="contract_review"
            />
        </div>
    );
};

export default CompanyDashboard;
