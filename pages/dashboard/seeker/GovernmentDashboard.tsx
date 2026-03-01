import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMyRequests, useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import CaseTimelineWidget from '../../../components/widgets/CaseTimelineWidget';
import { Shield, FileText, BarChart3, Search, Lock, CheckCircle, Loader } from 'lucide-react';

type Tab = '' | 'compliance' | 'cases' | 'reports';

const GovernmentDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || '') as Tab;

    const { requests, loading } = useMyRequests(profile?.id);
    const activeCount = requests.filter(r => !['completed', 'cancelled'].includes(r.status)).length;
    const completedCount = requests.filter(r => r.status === 'completed').length;

    return (
        <div className="space-y-6">
            {activeTab === '' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة الجهة الحكومية', 'Government Dashboard')}</h1>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <Lock size={16} /> {t('جميع البيانات مؤمنّة ومشفّرة — سجل تدقيق كامل', 'All data secured & encrypted — full audit trail')}
                    </div>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'قضايا نشطة', label_en: 'Active Cases', value: activeCount, color: 'text-blue-600' },
                        { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                        { label_ar: 'مستوى الامتثال', label_en: 'Compliance', value: '✓', color: 'text-green-600' },
                    ]} />
                    {loading ? (
                        <div className="flex justify-center py-4"><Loader className="animate-spin text-[#C8A762]" size={24} /></div>
                    ) : requests.slice(0, 5).map(req => (
                        <CaseTimelineWidget key={req.id} request={req} />
                    ))}
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('محرك الامتثال', 'Compliance Engine')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Search className="text-[#C8A762]" size={20} />
                            <span className="font-bold text-gray-700 dark:text-white">{t('البحث في الأنظمة', 'Regulation Search')}</span>
                        </div>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] text-sm"
                            placeholder={t('ابحث عن نظام أو لائحة أو قرار...', 'Search for a regulation, decree, or decision...')}
                        />
                        <div className="mt-4 space-y-2">
                            {[
                                t('فلتر: بالسنة', 'Filter: By Year'),
                                t('فلتر: بالوزارة', 'Filter: By Ministry'),
                                t('فلتر: نوع النظام', 'Filter: Regulation Type'),
                            ].map((f, i) => (
                                <span key={i} className="inline-block mr-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">{f}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <Shield className="mx-auto text-[#C8A762] mb-3" size={40} />
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('فحص تعارض القرارات', 'Decision Conflict Check')}</h3>
                        <p className="text-gray-500 text-sm mt-1">{t('قريباً — فحص آلي للتعارض مع الأنظمة', 'Coming soon — Automated conflict detection with regulations')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'cases' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('القضايا', 'Cases')}</h2>
                    {loading ? (
                        <div className="flex justify-center py-4"><Loader className="animate-spin text-[#C8A762]" size={24} /></div>
                    ) : requests.map(req => (
                        <CaseTimelineWidget key={req.id} request={req} />
                    ))}
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('التقارير الدورية', 'Periodic Reports')}</h2>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'إجمالي القضايا', label_en: 'Total Cases', value: requests.length, color: 'text-blue-600' },
                        { label_ar: 'معدل الحسم', label_en: 'Resolution Rate', value: requests.length > 0 ? `${Math.round((completedCount / requests.length) * 100)}%` : '0%', color: 'text-green-600' },
                        { label_ar: 'نشطة', label_en: 'Active', value: activeCount, color: 'text-amber-600' },
                    ]} />
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <BarChart3 className="mx-auto text-[#C8A762] mb-3" size={40} />
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('تقرير شامل', 'Comprehensive Report')}</h3>
                        <p className="text-gray-500 text-sm mt-1">{t('قريباً — تقارير PDF آلية جاهزة للعرض', 'Coming soon — Auto-generated PDF reports')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GovernmentDashboard;
