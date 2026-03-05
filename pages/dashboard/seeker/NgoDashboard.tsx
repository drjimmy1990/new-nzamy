import * as React from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMyRequests } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import CaseTimelineWidget from '../../../components/widgets/CaseTimelineWidget';
import CreateRequestModal from '../../../components/widgets/CreateRequestModal';
import { Shield, Users, DollarSign, BookOpen, FileText, Calendar, CheckCircle, Loader, Plus } from 'lucide-react';

type Tab = '' | 'compliance' | 'board' | 'grants';

const NgoDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || '') as Tab;

    const { requests, loading, refetch } = useMyRequests(profile?.id);
    const [showModal, setShowModal] = useState(false);
    const activeCount = requests.filter(r => !['completed', 'cancelled'].includes(r.status)).length;
    const completedCount = requests.filter(r => r.status === 'completed').length;

    return (
        <div className="space-y-6">
            {activeTab === '' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة الجمعية', 'NGO Dashboard')}</h1>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'طلبات نشطة', label_en: 'Active Requests', value: activeCount, color: 'text-blue-600' },
                        { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                        { label_ar: 'مستوى الامتثال', label_en: 'Compliance', value: '✓', color: 'text-green-600' },
                    ]} />
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-4 border-2 border-dashed border-[#C8A762] rounded-xl text-[#C8A762] font-bold hover:bg-[#C8A762]/10 transition flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> {t('إنشاء طلب جديد', 'Create New Request')}
                    </button>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader className="animate-spin text-[#C8A762]" size={28} /></div>
                    ) : requests.slice(0, 5).map(r => (
                        <CaseTimelineWidget key={r.id} request={r} />
                    ))}
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('مدقق الامتثال الخيري', 'NGO Compliance Checker')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <Shield className="text-[#C8A762] mb-3" size={24} />
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('فحص النشاط', 'Activity Check')}</h3>
                        <div className="space-y-3">
                            {[
                                { label: t('ترخيص الجمعية ساري', 'Association License Valid'), ok: true },
                                { label: t('التقرير المالي السنوي', 'Annual Financial Report'), ok: false },
                                { label: t('الجمعية العمومية', 'General Assembly'), ok: true },
                                { label: t('حملات التبرع مرخصة', 'Donation Campaigns Licensed'), ok: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    {item.ok ? (
                                        <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm ${item.ok ? 'text-green-600' : 'text-amber-600'}`}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <Calendar className="text-[#C8A762] mb-3" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white mb-2">{t('تقويم الامتثال', 'Compliance Calendar')}</h3>
                        <p className="text-gray-500 text-sm">{t('قريباً — تذكيرات تلقائية بالمواعيد النظامية', 'Coming soon — Auto reminders for regulatory deadlines')}</p>
                    </div>
                </div>
            )}

            {activeTab === 'board' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('بوابة مجلس الإدارة', 'Board Portal')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <Users className="text-[#C8A762] mb-3" size={24} />
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('محاضر الاجتماعات', 'Meeting Minutes')}</h3>
                        <div className="text-center py-8 text-gray-400">
                            <BookOpen className="mx-auto mb-3" size={40} />
                            <p className="text-sm">{t('قريباً — مساحة آمنة لمحاضر الاجتماعات والتصويت', 'Coming soon — Secure space for minutes & voting')}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'grants' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('إدارة المنح والتمويل', 'Grants & Funding')}</h2>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'منح نشطة', label_en: 'Active Grants', value: 0, color: 'text-blue-600' },
                        { label_ar: 'تقارير مطلوبة', label_en: 'Reports Due', value: 0, color: 'text-amber-600' },
                        { label_ar: 'إجمالي التمويل', label_en: 'Total Funding', value: '0 SAR', color: 'text-green-600' },
                    ]} />
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <DollarSign className="mx-auto text-[#C8A762] mb-3" size={40} />
                        <p className="text-gray-500 text-sm">{t('قريباً — تتبع عقود التمويل والمنح', 'Coming soon — Track funding contracts & grants')}</p>
                    </div>
                </div>
            )}

            {/* Create Request Modal */}
            <CreateRequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onCreated={() => refetch()}
            />
        </div>
    );
};

export default NgoDashboard;
