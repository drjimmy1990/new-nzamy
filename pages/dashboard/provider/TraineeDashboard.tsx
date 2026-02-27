import * as React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Inbox, PenTool, GraduationCap, Award } from 'lucide-react';

const TraineeDashboard: React.FC = () => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة المتدرب', 'Trainee Dashboard')}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { icon: Inbox, label: t('المهام', 'Tasks') },
                    { icon: PenTool, label: t('الصياغة', 'Drafting') },
                    { icon: GraduationCap, label: t('الأكاديمية', 'Academy') },
                    { icon: Award, label: t('الأداء', 'Performance') },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <Icon className="mx-auto text-[#0B3D2E] dark:text-[#C8A762] mb-2" size={28} />
                            <h3 className="font-bold text-sm text-gray-800 dark:text-white">{item.label}</h3>
                        </div>
                    );
                })}
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
                ⚠️ {t('كمتدرب، يجب إرسال أعمالك للموافقة قبل تسليمها للعملاء', 'As a trainee, your work must be submitted for approval before delivery to clients')}
            </div>
        </div>
    );
};
export default TraineeDashboard;
