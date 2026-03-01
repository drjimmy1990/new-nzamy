import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { usePoolRequests, useProviderRequests, useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import OrderInboxWidget from '../../../components/widgets/OrderInboxWidget';
import { supabase } from '../../../services/supabaseClient';
import { MapPin, Inbox, FileText, BookOpen, DollarSign, Clock, CheckCircle } from 'lucide-react';

type Tab = '' | 'radar' | 'queue' | 'templates' | 'archive' | 'wallet';

const NOTARY_TEMPLATES = [
    { ar: 'وكالة عامة', en: 'General Power of Attorney' },
    { ar: 'وكالة خاصة', en: 'Special Power of Attorney' },
    { ar: 'فسخ وكالة', en: 'Revocation of Power' },
    { ar: 'إقرار مالي', en: 'Financial Acknowledgment' },
    { ar: 'توثيق عقد تأسيس', en: 'Incorporation Agreement' },
    { ar: 'مبايعة', en: 'Sale Agreement' },
    { ar: 'تنازل', en: 'Waiver / Transfer' },
];

const NotaryDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || '') as Tab;

    const { requests: poolRequests, loading: poolLoading } = usePoolRequests(profile?.country_id || undefined);
    const { requests: myRequests, loading: myLoading, refetch } = useProviderRequests(profile?.id);

    const completedCount = myRequests.filter(r => r.status === 'completed').length;

    const handleAccept = async (id: string) => {
        if (!profile?.id) return;
        await supabase.from('service_requests').update({ provider_id: profile.id, status: 'in_progress' }).eq('id', id);
        refetch();
    };

    return (
        <div className="space-y-6">
            {activeTab === '' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة الموثّق', 'Notary Dashboard')}</h1>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'طلبات قريبة', label_en: 'Nearby Requests', value: poolRequests.length, color: 'text-blue-600' },
                        { label_ar: 'قيد التنفيذ', label_en: 'In Progress', value: myRequests.filter(r => r.status === 'in_progress').length, color: 'text-amber-600' },
                        { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                        { label_ar: 'القوالب', label_en: 'Templates', value: NOTARY_TEMPLATES.length, color: 'text-purple-600' },
                    ]} />
                    <OrderInboxWidget requests={poolRequests.slice(0, 5)} loading={poolLoading} onAccept={handleAccept} />
                </div>
            )}

            {activeTab === 'radar' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('رادار الطلبات', 'Live Radar')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <MapPin className="mx-auto text-[#C8A762] mb-3" size={48} />
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('خريطة الطلبات التفاعلية', 'Interactive Request Map')}</h3>
                        <p className="text-gray-500 text-sm mt-1">{t('قريباً — عرض طلبات التوثيق القريبة منك جغرافياً', 'Coming soon — Shows nearby notarization requests on a map')}</p>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{t('الطلبات المتاحة', 'Available Requests')}</h3>
                    <OrderInboxWidget requests={poolRequests} loading={poolLoading} onAccept={handleAccept} />
                </div>
            )}

            {activeTab === 'queue' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('طابور المواعيد', 'Appointment Queue')}</h2>
                    {myRequests.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                            <Clock className="mx-auto mb-3 text-gray-300" size={40} />
                            {t('لا توجد مواعيد حالياً', 'No appointments currently')}
                        </div>
                    ) : (
                        <OrderInboxWidget requests={myRequests} loading={myLoading} />
                    )}
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('قوالب التوثيق', 'Notarization Templates')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {NOTARY_TEMPLATES.map((tmpl, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3 hover:border-[#C8A762] transition cursor-pointer">
                                <FileText className="text-[#C8A762] flex-shrink-0" size={20} />
                                <span className="font-semibold text-sm text-gray-800 dark:text-white">{isRTL ? tmpl.ar : tmpl.en}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'archive' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('الأرشيف', 'Archive')}</h2>
                    {completedCount === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                            <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
                            {t('لا توجد وثائق مكتملة', 'No completed documents')}
                        </div>
                    ) : (
                        <OrderInboxWidget requests={myRequests.filter(r => r.status === 'completed')} loading={myLoading} />
                    )}
                </div>
            )}

            {activeTab === 'wallet' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <DollarSign className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('المحفظة', 'Wallet')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — الأتعاب ورسوم الانتقال', 'Coming soon — Fees & travel charges')}</p>
                </div>
            )}
        </div>
    );
};

export default NotaryDashboard;
