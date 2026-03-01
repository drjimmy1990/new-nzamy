import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProviderRequests, usePoolRequests, useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import OrderInboxWidget from '../../../components/widgets/OrderInboxWidget';
import { supabase } from '../../../services/supabaseClient';
import {
    Inbox, PenTool, GraduationCap, Award, FileText,
    Loader, Send, RotateCcw, CheckCircle
} from 'lucide-react';

type Tab = '' | 'tasks' | 'drafting' | 'academy' | 'performance';

const TraineeDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || '') as Tab;

    const { requests: myRequests, loading, refetch } = useProviderRequests(profile?.id);
    const { requests: poolRequests, loading: poolLoading } = usePoolRequests(profile?.country_id || undefined);

    const pendingCount = myRequests.filter(r => r.status === 'pending_approval').length;
    const completedCount = myRequests.filter(r => r.status === 'completed').length;
    const inProgressCount = myRequests.filter(r => r.status === 'in_progress').length;

    const handleAcceptTask = async (requestId: string) => {
        if (!profile?.id) return;
        await supabase
            .from('service_requests')
            .update({ provider_id: profile.id, status: 'in_progress' })
            .eq('id', requestId);
        refetch();
    };

    return (
        <div className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
                ⚠️ {t('كمتدرب، يجب إرسال أعمالك للموافقة قبل تسليمها للعملاء', 'As a trainee, your work must be submitted for approval before delivery to clients')}
            </div>

            {/* Overview */}
            {activeTab === '' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {t('لوحة المتدرب', 'Trainee Dashboard')}
                    </h1>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'مهام جديدة', label_en: 'Available Tasks', value: poolRequests.length, color: 'text-blue-600' },
                        { label_ar: 'قيد التنفيذ', label_en: 'In Progress', value: inProgressCount, color: 'text-amber-600' },
                        { label_ar: 'بانتظار الموافقة', label_en: 'Pending Approval', value: pendingCount, color: 'text-purple-600' },
                        { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                    ]} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { icon: Inbox, label: t('المهام', 'Tasks'), count: poolRequests.length },
                            { icon: PenTool, label: t('الصياغة', 'Drafting'), count: inProgressCount },
                            { icon: GraduationCap, label: t('الأكاديمية', 'Academy'), count: 0 },
                            { icon: Award, label: t('الأداء', 'Performance'), count: completedCount },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                                    <Icon className="mx-auto text-[#0B3D2E] dark:text-[#C8A762] mb-2" size={28} />
                                    <h3 className="font-bold text-sm text-gray-800 dark:text-white">{item.label}</h3>
                                    <span className="text-lg font-bold text-[#C8A762]">{item.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {t('المهام المتاحة', 'Available Tasks')} ({poolRequests.length})
                    </h2>
                    <OrderInboxWidget requests={poolRequests} loading={poolLoading} onAccept={handleAcceptTask} />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mt-6">
                        {t('مهامي', 'My Tasks')} ({myRequests.length})
                    </h2>
                    <OrderInboxWidget requests={myRequests} loading={loading} />
                </div>
            )}

            {/* Drafting Tab */}
            {activeTab === 'drafting' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('منطقة الصياغة', 'Drafting Zone')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <PenTool className="text-[#C8A762]" size={20} />
                            <span className="font-bold text-gray-700 dark:text-white">{t('مسودة جديدة', 'New Draft')}</span>
                        </div>
                        <textarea
                            className="w-full h-48 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] resize-none text-sm"
                            placeholder={t('اكتب مسودتك هنا...', 'Write your draft here...')}
                        />
                        <div className="flex gap-2 mt-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#C8A762] text-[#0B3D2E] rounded-lg font-bold text-sm hover:bg-[#C8A762]/90">
                                <Send size={14} /> {t('طلب اعتماد', 'Request Approval')}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200">
                                <RotateCcw size={14} /> {t('حفظ كمسودة', 'Save Draft')}
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center">{t('⚠️ لا يوجد زر "إرسال للعميل" — يجب الحصول على اعتماد المشرف أولاً', '⚠️ No "Send to Client" button — supervisor approval is required first')}</p>
                </div>
            )}

            {/* Academy Tab */}
            {activeTab === 'academy' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('أكاديمية نظامي', 'Nzamy Academy')}</h2>
                    {[
                        { title: t('أساسيات الصياغة القانونية', 'Legal Drafting Fundamentals'), lessons: 12 },
                        { title: t('تحليل العقود', 'Contract Analysis'), lessons: 8 },
                        { title: t('البحث القانوني', 'Legal Research'), lessons: 15 },
                        { title: t('السوابق القضائية', 'Case Law'), lessons: 20 },
                    ].map((course, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="text-[#C8A762]" size={24} />
                                <div>
                                    <h3 className="font-bold text-sm text-gray-800 dark:text-white">{course.title}</h3>
                                    <p className="text-xs text-gray-500">{course.lessons} {t('درس', 'lessons')}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{t('قريباً', 'Coming soon')}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('تقييم الأداء', 'Performance Review')}</h2>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'مهام منجزة', label_en: 'Tasks Done', value: completedCount, color: 'text-green-600' },
                        { label_ar: 'بانتظار المراجعة', label_en: 'Pending Review', value: pendingCount, color: 'text-amber-600' },
                        { label_ar: 'معدل القبول', label_en: 'Acceptance Rate', value: completedCount > 0 ? 85 : 0, color: 'text-blue-600' },
                        { label_ar: 'نقاط التعلم', label_en: 'Learning Points', value: completedCount * 10, color: 'text-purple-600' },
                    ]} />
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <Award className="mx-auto text-[#C8A762] mb-3" size={40} />
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('ملاحظات المشرف', 'Supervisor Notes')}</h3>
                        <p className="text-gray-500 text-sm mt-1">{t('قريباً — سجل الملاحظات التصحيحية', 'Coming soon — Corrective feedback log')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TraineeDashboard;
