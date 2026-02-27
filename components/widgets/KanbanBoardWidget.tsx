import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ServiceRequest, RequestStatus } from '../../types/database';

interface KanbanBoardWidgetProps {
    requests: ServiceRequest[];
    onStatusChange?: (id: string, newStatus: RequestStatus) => void;
}

const COLUMNS: { status: RequestStatus; label_ar: string; label_en: string; color: string }[] = [
    { status: 'pending_match', label_ar: 'جديد', label_en: 'New', color: 'border-t-blue-500' },
    { status: 'in_progress', label_ar: 'قيد التنفيذ', label_en: 'In Progress', color: 'border-t-amber-500' },
    { status: 'pending_approval', label_ar: 'بانتظار الموافقة', label_en: 'Pending Approval', color: 'border-t-purple-500' },
    { status: 'completed', label_ar: 'مكتمل', label_en: 'Completed', color: 'border-t-green-500' },
];

const KanbanBoardWidget: React.FC<KanbanBoardWidgetProps> = ({ requests, onStatusChange }) => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('لوحة المهام', 'Task Board')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLUMNS.map((col) => {
                    const colRequests = requests.filter(r => r.status === col.status);
                    return (
                        <div key={col.status} className={`bg-gray-50 dark:bg-gray-900 rounded-lg border-t-4 ${col.color} p-3 min-h-[200px]`}>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {isRTL ? col.label_ar : col.label_en}
                                </h4>
                                <span className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold shadow-sm">
                                    {colRequests.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {colRequests.map((req) => (
                                    <div key={req.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{req.title}</p>
                                        {req.price && (
                                            <p className="text-xs text-[#C8A762] font-bold mt-1">{req.price} SAR</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(req.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                        </p>
                                    </div>
                                ))}
                                {colRequests.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-8">{t('فارغ', 'Empty')}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanBoardWidget;
