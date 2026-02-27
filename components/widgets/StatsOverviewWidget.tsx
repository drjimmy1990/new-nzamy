import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Stat {
    label_ar: string;
    label_en: string;
    value: string | number;
    color: string;
    icon?: React.ReactNode;
}

interface StatsOverviewWidgetProps {
    stats: Stat[];
}

const StatsOverviewWidget: React.FC<StatsOverviewWidgetProps> = ({ stats }) => {
    const { isRTL } = useLanguage();

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{isRTL ? stat.label_ar : stat.label_en}</p>
                        {stat.icon && <span className="text-gray-400">{stat.icon}</span>}
                    </div>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsOverviewWidget;
