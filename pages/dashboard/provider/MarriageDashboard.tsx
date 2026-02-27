import * as React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FileText, Award, Calendar, BookOpen } from 'lucide-react';

const MarriageDashboard: React.FC = () => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة المأذون', 'Marriage Official Dashboard')}</h1>
            <div className="grid grid-cols-2 gap-4">
                {[
                    { icon: FileText, label: t('الملف الرقمي', 'Digital Dossier'), desc: t('بيانات الزفاف', 'Wedding data') },
                    { icon: Award, label: t('وضع المراسم', 'Ceremony Mode'), desc: t('وضع ملء الشاشة', 'Full-screen mode') },
                    { icon: Calendar, label: t('التقويم', 'Calendar'), desc: t('المواعيد القادمة', 'Upcoming ceremonies') },
                    { icon: BookOpen, label: t('الأرشيف', 'Archive'), desc: t('العقود السابقة', 'Past contracts') },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <Icon className="mx-auto text-[#0B3D2E] dark:text-[#C8A762] mb-2" size={28} />
                            <h3 className="font-bold text-sm text-gray-800 dark:text-white">{item.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default MarriageDashboard;
