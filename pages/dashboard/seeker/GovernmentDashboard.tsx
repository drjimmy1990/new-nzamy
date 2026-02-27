import * as React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Shield, FileText, BarChart3, Landmark } from 'lucide-react';

const GovernmentDashboard: React.FC = () => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة الجهة الحكومية', 'Government Dashboard')}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { icon: Shield, label: t('الامتثال', 'Compliance Engine') },
                    { icon: FileText, label: t('القضايا', 'Cases') },
                    { icon: Landmark, label: t('الموافقات', 'Approvals') },
                    { icon: BarChart3, label: t('التقارير', 'Reports') },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <Icon className="mx-auto text-[#0B3D2E] dark:text-[#C8A762] mb-2" size={32} />
                            <h3 className="font-bold text-sm text-gray-800 dark:text-white">{item.label}</h3>
                        </div>
                    );
                })}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                {t('سيتم بناء الواجهات في المراحل القادمة', 'Interfaces will be built in upcoming phases')}
            </div>
        </div>
    );
};
export default GovernmentDashboard;
