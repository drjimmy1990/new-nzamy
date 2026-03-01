import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProviderRequests, usePoolRequests, useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import OrderInboxWidget from '../../../components/widgets/OrderInboxWidget';
import KanbanBoardWidget from '../../../components/widgets/KanbanBoardWidget';
import DocumentVaultWidget from '../../../components/widgets/DocumentVaultWidget';
import { supabase } from '../../../services/supabaseClient';
import { Gavel, Lock, PenTool, DollarSign, BookOpen, FileText, Shield } from 'lucide-react';

type Tab = '' | 'tribunal' | 'evidence' | 'rulings' | 'escrow' | 'archive';

const ArbitratorDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || '') as Tab;

    const { requests: poolRequests, loading: poolLoading } = usePoolRequests(profile?.country_id || undefined);
    const { requests: myRequests, loading: myLoading, refetch } = useProviderRequests(profile?.id);
    const { update: updateStatus } = useUpdateRequestStatus();

    const activeCount = myRequests.filter(r => !['completed', 'cancelled'].includes(r.status)).length;
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
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة المحكّم', 'Arbitrator Dashboard')}</h1>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'نزاعات جديدة', label_en: 'New Disputes', value: poolRequests.length, color: 'text-blue-600' },
                        { label_ar: 'قضايا نشطة', label_en: 'Active Cases', value: activeCount, color: 'text-amber-600' },
                        { label_ar: 'أحكام صادرة', label_en: 'Rulings Issued', value: completedCount, color: 'text-green-600' },
                    ]} />
                    <OrderInboxWidget requests={poolRequests.slice(0, 5)} loading={poolLoading} onAccept={handleAccept} />
                </div>
            )}

            {activeTab === 'tribunal' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('المحكمة الافتراضية', 'Virtual Tribunal')}</h2>
                    {activeCount === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                            <Gavel className="mx-auto mb-3 text-gray-300" size={40} />
                            {t('لا توجد قضايا تحكيم نشطة', 'No active arbitration cases')}
                        </div>
                    ) : (
                        <KanbanBoardWidget
                            requests={myRequests}
                            onStatusChange={(id, status) => { updateStatus(id, status).then(() => refetch()); }}
                        />
                    )}
                </div>
            )}

            {activeTab === 'evidence' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('غرفة الأدلة', 'Evidence Room')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="text-[#C8A762]" size={20} />
                            <span className="font-bold text-gray-700 dark:text-white">{t('مستندات مشفّرة', 'Encrypted Documents')}</span>
                            <span className="ml-auto text-xs text-green-500 flex items-center gap-1"><Shield size={12} /> {t('مؤمّن', 'Secured')}</span>
                        </div>
                        <DocumentVaultWidget />
                    </div>
                </div>
            )}

            {activeTab === 'rulings' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('صياغة الأحكام', 'Rulings Drafter')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="space-y-3">
                            {['الديباجة', 'عرض الوقائع', 'أسباب الحكم', 'المنطوق'].map((section, i) => (
                                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <label className="text-xs font-bold text-[#C8A762] block mb-1">
                                        {isRTL ? section : ['Preamble', 'Facts', 'Legal Reasoning', 'Ruling'][i]}
                                    </label>
                                    <textarea
                                        className="w-full h-20 bg-transparent border-none focus:outline-none text-sm text-gray-700 dark:text-gray-200 resize-none"
                                        placeholder={t('اكتب هنا...', 'Write here...')}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="px-4 py-2 bg-[#0B3D2E] text-white rounded-lg text-sm font-bold">{t('فحص ذكي', 'AI Review')}</button>
                            <button className="px-4 py-2 bg-[#C8A762] text-[#0B3D2E] rounded-lg text-sm font-bold">{t('إصدار الحكم', 'Issue Ruling')}</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'escrow' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('حساب الضمان', 'Escrow Tracker')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <DollarSign className="mx-auto text-[#C8A762] mb-3" size={40} />
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('الأتعاب المودعة', 'Deposited Fees')}</h3>
                        <p className="text-3xl font-bold text-[#C8A762] my-2">0 SAR</p>
                        <p className="text-gray-500 text-sm">{t('قريباً — تتبع إيداعات أتعاب التحكيم', 'Coming soon — Track arbitration fee deposits')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'archive' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('أرشيف الأحكام', 'Rulings Archive')}</h2>
                    {completedCount === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                            <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
                            {t('لا توجد أحكام سابقة', 'No previous rulings')}
                        </div>
                    ) : (
                        <OrderInboxWidget requests={myRequests.filter(r => r.status === 'completed')} loading={myLoading} />
                    )}
                </div>
            )}
        </div>
    );
};

export default ArbitratorDashboard;
