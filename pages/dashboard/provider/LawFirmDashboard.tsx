import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProviderRequests, usePoolRequests, useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import { supabase } from '../../../services/supabaseClient';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import OrderInboxWidget from '../../../components/widgets/OrderInboxWidget';
import KanbanBoardWidget from '../../../components/widgets/KanbanBoardWidget';
import ProfileCardWidget from '../../../components/widgets/ProfileCardWidget';
import { Inbox, Kanban, Users, BarChart3, MessageSquare, DollarSign } from 'lucide-react';

type Tab = 'overview' | 'inbox' | 'workflow' | 'team' | 'analytics' | 'community' | 'wallet';

const LawFirmDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || 'overview') as Tab;

    const { requests: myRequests, loading: myLoading, refetch: refetchMy } = useProviderRequests(profile?.id);
    const { requests: poolRequests, loading: poolLoading, refetch: refetchPool } = usePoolRequests(profile?.country_id || undefined);
    const { update: updateStatus } = useUpdateRequestStatus();

    const inProgressCount = myRequests.filter(r => r.status === 'in_progress').length;
    const completedCount = myRequests.filter(r => r.status === 'completed').length;
    const pendingApproval = myRequests.filter(r => r.status === 'pending_approval').length;

    const handleAccept = async (requestId: string) => {
        if (!profile?.id) return;
        await supabase
            .from('service_requests')
            .update({ provider_id: profile.id, status: 'in_progress' })
            .eq('id', requestId);
        refetchPool();
        refetchMy();
    };

    const tabs: { key: Tab; icon: React.ElementType; label_ar: string; label_en: string }[] = [
        { key: 'overview', icon: BarChart3, label_ar: 'الرئيسية', label_en: 'Overview' },
        { key: 'inbox', icon: Inbox, label_ar: 'الطلبات', label_en: 'Inbox' },
        { key: 'workflow', icon: Kanban, label_ar: 'سير العمل', label_en: 'Workflow' },
        { key: 'team', icon: Users, label_ar: 'الفريق', label_en: 'Team' },
    ];

    return (
        <div className="space-y-6">
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {t('لوحة تحكم شركة المحاماة', 'Law Firm Dashboard')}
                            </h1>
                            <StatsOverviewWidget stats={[
                                { label_ar: 'طلبات متاحة', label_en: 'Pool Requests', value: poolRequests.length, color: 'text-blue-600' },
                                { label_ar: 'قيد التنفيذ', label_en: 'In Progress', value: inProgressCount, color: 'text-amber-600' },
                                { label_ar: 'بانتظار الموافقة', label_en: 'Pending Approval', value: pendingApproval, color: 'text-purple-600' },
                                { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                            ]} />
                            <OrderInboxWidget requests={poolRequests.slice(0, 5)} loading={poolLoading} onAccept={handleAccept} />
                        </div>
                        <div>
                            <ProfileCardWidget />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inbox' && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('الطلبات المتاحة', 'Available Requests')}</h2>
                    <OrderInboxWidget requests={poolRequests} loading={poolLoading} onAccept={handleAccept} />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('طلباتنا', 'Our Requests')}</h2>
                    <OrderInboxWidget requests={myRequests} loading={myLoading} />
                </div>
            )}

            {activeTab === 'workflow' && (
                <KanbanBoardWidget
                    requests={myRequests}
                    onStatusChange={(id, status) => { updateStatus(id, status).then(() => refetchMy()); }}
                />
            )}

            {activeTab === 'team' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Users className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('إدارة الفريق', 'Team Management')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — إضافة محامين ومتدربين', 'Coming soon — Add lawyers and trainees')}</p>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <BarChart3 className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('التحليلات', 'Analytics')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — تحليل أداء الشركة', 'Coming soon — Firm performance analytics')}</p>
                </div>
            )}

            {activeTab === 'community' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <MessageSquare className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('المجتمع القانوني', 'Legal Community')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — أسئلة وأجوبة المجتمع', 'Coming soon — Community Q&A')}</p>
                </div>
            )}

            {activeTab === 'wallet' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <DollarSign className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('المحفظة', 'Wallet')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — الأرباح والمدفوعات', 'Coming soon — Earnings & payments')}</p>
                </div>
            )}
        </div>
    );
};

export default LawFirmDashboard;
