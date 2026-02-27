import * as React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Gavel, Lock, PenTool, DollarSign, BookOpen } from 'lucide-react';

const ArbitratorDashboard: React.FC = () => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة المحكم', 'Arbitrator Dashboard')}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { icon: Gavel, label: t('المحكمة الافتراضية', 'Virtual Tribunal') },
                    { icon: Lock, label: t('غرفة الأدلة', 'Evidence Room') },
                    { icon: PenTool, label: t('صياغة الأحكام', 'Rulings Drafter') },
                    { icon: DollarSign, label: t('الضمان', 'Escrow') },
                    { icon: BookOpen, label: t('الأرشيف', 'Archive') },
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-800 dark:text-red-200">
                🔒 {t('بيئة عالية الأمان — جميع البيانات مشفرة', 'High-security environment — All data is encrypted')}
            </div>
        </div>
    );
};
export default ArbitratorDashboard;
