import * as React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { MapPin, Inbox, FileText, BookOpen, DollarSign } from 'lucide-react';

const NotaryDashboard: React.FC = () => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة الموثق', 'Notary Dashboard')}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                    { icon: MapPin, label: t('الرادار', 'Live Radar'), desc: t('طلبات قريبة منك', 'Nearby requests') },
                    { icon: Inbox, label: t('الطابور', 'Queue'), desc: t('المواعيد المحجوزة', 'Booked slots') },
                    { icon: FileText, label: t('القوالب', 'Templates'), desc: t('وثائق جاهزة', 'Ready docs') },
                    { icon: BookOpen, label: t('الأرشيف', 'Archive'), desc: t('التوثيقات السابقة', 'Past notarizations') },
                    { icon: DollarSign, label: t('المحفظة', 'Wallet'), desc: t('الرصيد والعمولات', 'Balance & fees') },
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
export default NotaryDashboard;
