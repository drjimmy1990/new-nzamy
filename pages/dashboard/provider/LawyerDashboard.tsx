import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProviderRequests, usePoolRequests, useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import { useQuestions } from '../../../hooks/useCommunity';
import { supabase } from '../../../services/supabaseClient';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import OrderInboxWidget from '../../../components/widgets/OrderInboxWidget';
import KanbanBoardWidget from '../../../components/widgets/KanbanBoardWidget';
import CommunityRadarWidget from '../../../components/widgets/CommunityRadarWidget';
import ProfileCardWidget from '../../../components/widgets/ProfileCardWidget';
import { Inbox, Kanban, MessageSquare, Calendar, FileText, DollarSign } from 'lucide-react';

type Tab = 'overview' | 'inbox' | 'board' | 'community' | 'calendar' | 'templates' | 'wallet';

const LawyerDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || 'overview') as Tab;

    const { requests: myRequests, loading: myLoading, refetch: refetchMy } = useProviderRequests(profile?.id);
    const { requests: poolRequests, loading: poolLoading, refetch: refetchPool } = usePoolRequests(profile?.country_id || undefined);
    const { update: updateStatus } = useUpdateRequestStatus();
    const { questions, loading: questionsLoading } = useQuestions(profile?.country_id || undefined);

    const inProgressCount = myRequests.filter(r => r.status === 'in_progress').length;
    const completedCount = myRequests.filter(r => r.status === 'completed').length;

    const handleAcceptRequest = async (requestId: string) => {
        if (!profile?.id) return;
        // Claim the request
        await supabase
            .from('service_requests')
            .update({ provider_id: profile.id, status: 'in_progress' })
            .eq('id', requestId);
        refetchPool();
        refetchMy();
    };

    const handleCompleteRequest = async (requestId: string) => {
        await updateStatus(requestId, 'completed');
        refetchMy();
    };



    return (
        <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {t('مكتبي الافتراضي', 'My Virtual Office')}
                            </h1>
                            <StatsOverviewWidget stats={[
                                { label_ar: 'طلبات جديدة', label_en: 'Pool Requests', value: poolRequests.length, color: 'text-blue-600' },
                                { label_ar: 'قيد التنفيذ', label_en: 'In Progress', value: inProgressCount, color: 'text-amber-600' },
                                { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                                { label_ar: 'نقاط الظهور', label_en: 'Visibility', value: profile?.visibility_score || 0, color: 'text-purple-600' },
                            ]} />

                            {/* Quick Pool Preview */}
                            <OrderInboxWidget
                                requests={poolRequests.slice(0, 3)}
                                loading={poolLoading}
                                onAccept={handleAcceptRequest}
                            />
                        </div>
                        <div className="space-y-4">
                            <ProfileCardWidget />
                            <CommunityRadarWidget
                                questions={questions.slice(0, 3)}
                                loading={questionsLoading}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Inbox Tab */}
            {activeTab === 'inbox' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {t('طلبات متاحة', 'Available Pool Requests')} ({poolRequests.length})
                    </h2>
                    <OrderInboxWidget
                        requests={poolRequests}
                        loading={poolLoading}
                        onAccept={handleAcceptRequest}
                    />

                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mt-6">
                        {t('طلباتي', 'My Requests')} ({myRequests.length})
                    </h2>
                    <OrderInboxWidget
                        requests={myRequests}
                        loading={myLoading}
                        onView={(id) => console.log('View', id)}
                    />
                </div>
            )}

            {/* Board Tab */}
            {activeTab === 'board' && (
                <KanbanBoardWidget
                    requests={myRequests}
                    onStatusChange={(id, status) => { updateStatus(id, status).then(() => refetchMy()); }}
                />
            )}

            {/* Community Tab */}
            {activeTab === 'community' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('المجتمع القانوني', 'Legal Community')}</h2>
                    <CommunityRadarWidget
                        questions={questions}
                        loading={questionsLoading}
                        onAnswer={(id) => console.log('Answer', id)}
                    />
                </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Calendar className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('التقويم', 'Calendar')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — مواعيد الاستشارات والجلسات', 'Coming soon — Consultation & session appointments')}</p>
                </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <FileText className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('القوالب الذكية', 'Smart Templates')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — نماذج للمذكرات والعقود', 'Coming soon — Memo & contract templates')}</p>
                </div>
            )}

            {/* Wallet Tab */}
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

export default LawyerDashboard;
