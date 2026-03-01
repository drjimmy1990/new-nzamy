import * as React from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMyRequests, useCreateRequest } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import KanbanBoardWidget from '../../../components/widgets/KanbanBoardWidget';
import CaseTimelineWidget from '../../../components/widgets/CaseTimelineWidget';
import { useUpdateRequestStatus } from '../../../hooks/useServiceRequests';
import {
    Shield, Kanban, BarChart3, Users, DollarSign,
    Upload, FileText, AlertTriangle, CheckCircle, Loader
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

    const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
    const completedCount = requests.filter(r => r.status === 'completed').length;

    return (
        <div className="space-y-6">
            {activeTab === '' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة تحكم الشركة', 'Company Dashboard')}</h1>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'عقود قيد المراجعة', label_en: 'Contracts Under Review', value: inProgressCount, color: 'text-blue-600' },
                        { label_ar: 'مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                        { label_ar: 'إجمالي الطلبات', label_en: 'Total Requests', value: requests.length, color: 'text-purple-600' },
                    ]} />
                    {loading ? (
                        <div className="flex justify-center py-4"><Loader className="animate-spin text-[#C8A762]" size={24} /></div>
                    ) : requests.slice(0, 5).map(req => (
                        <CaseTimelineWidget key={req.id} request={req} />
                    ))}
                </div>
            )}

            {activeTab === 'scanner' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('فحص العقود', 'Contract Scanner')}</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 text-center cursor-pointer hover:border-[#C8A762] transition">
                        <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                        <h3 className="font-bold text-gray-700 dark:text-white">{t('ارفع العقد للفحص', 'Upload Contract to Scan')}</h3>
                        <p className="text-gray-500 text-sm mt-1">{t('PDF, DOCX — حتى 10 ميجا', 'PDF, DOCX — up to 10MB')}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('نتائج الفحص', 'Scan Results')}</h3>
                        <div className="space-y-3">
                            {[
                                { icon: AlertTriangle, label: t('علامات حمراء', 'Red Flags'), value: '-', color: 'text-red-500' },
                                { icon: Shield, label: t('بنود متوافقة', 'Compliant Clauses'), value: '-', color: 'text-green-500' },
                                { icon: FileText, label: t('بنود تحتاج مراجعة', 'Needs Review'), value: '-', color: 'text-amber-500' },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <Icon className={item.color} size={18} />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.label}</span>
                                        <span className="font-bold text-gray-800 dark:text-white">{item.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-4">{t('قريباً — تحليل ذكي بالذكاء الاصطناعي', 'Coming soon — AI-powered analysis')}</p>
                    </div>
                </div>
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
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Users className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('إدارة فريق العمل', 'Team Management')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — إضافة أعضاء وتعيين صلاحيات', 'Coming soon — Add members & set permissions')}</p>
                </div>
            )}

            {activeTab === 'wallet' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <DollarSign className="mx-auto text-[#C8A762] mb-3" size={40} />
                    <h3 className="font-bold text-gray-700 dark:text-white">{t('المحفظة', 'Wallet')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('قريباً — رصيد الاشتراك والمدفوعات', 'Coming soon — Subscription balance & payments')}</p>
                </div>
            )}
        </div>
    );
};

export default CompanyDashboard;
