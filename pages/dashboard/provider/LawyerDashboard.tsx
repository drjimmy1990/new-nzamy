import * as React from 'react';
import { useState } from 'react';
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
import { Inbox, Kanban, MessageSquare } from 'lucide-react';

type Tab = 'overview' | 'inbox' | 'board' | 'community';

const LawyerDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [activeTab, setActiveTab] = useState<Tab>('overview');

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

    const tabs: { key: Tab; icon: React.ElementType; label_ar: string; label_en: string }[] = [
        { key: 'overview', icon: Inbox, label_ar: 'نظرة عامة', label_en: 'Overview' },
        { key: 'inbox', icon: Inbox, label_ar: 'الطلبات', label_en: 'Inbox' },
        { key: 'board', icon: Kanban, label_ar: 'المهام', label_en: 'Board' },
        { key: 'community', icon: MessageSquare, label_ar: 'المجتمع', label_en: 'Community' },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${active
                                ? 'bg-[#0B3D2E] text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <Icon size={16} />
                            {isRTL ? tab.label_ar : tab.label_en}
                        </button>
                    );
                })}
            </div>

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
        </div>
    );
};

export default LawyerDashboard;
