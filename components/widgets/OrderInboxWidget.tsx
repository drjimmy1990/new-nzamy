import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ServiceRequest } from '../../types/database';
import { Check, X, Clock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderInboxWidgetProps {
    requests: ServiceRequest[];
    loading: boolean;
    onAccept?: (id: string) => void;
    onReject?: (id: string) => void;
    onView?: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, [string, string]> = {
    consultation: ['استشارة', 'Consultation'],
    case_pleading: ['ترافع', 'Case Pleading'],
    contract_review: ['مراجعة عقد', 'Contract Review'],
    notarization: ['توثيق', 'Notarization'],
    marriage: ['زواج', 'Marriage'],
    arbitration: ['تحكيم', 'Arbitration'],
    other: ['أخرى', 'Other'],
};

const OrderInboxWidget: React.FC<OrderInboxWidgetProps> = ({ requests, loading, onAccept, onReject, onView }) => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const Arrow = isRTL ? ChevronLeft : ChevronRight;

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2" />)}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileText size={18} className="text-[#C8A762]" />
                    {t('الطلبات الواردة', 'Incoming Requests')}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-bold">
                    {requests.length}
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <Clock className="mx-auto mb-2" size={32} />
                    <p className="text-sm">{t('لا توجد طلبات', 'No requests yet')}</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {requests.map((req) => (
                        <div key={req.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-800 dark:text-white truncate">{req.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                            {isRTL ? CATEGORY_LABELS[req.category]?.[0] : CATEGORY_LABELS[req.category]?.[1]}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(req.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {onAccept && (
                                        <button onClick={() => onAccept(req.id)} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition" title={t('قبول', 'Accept')}>
                                            <Check size={14} />
                                        </button>
                                    )}
                                    {onReject && (
                                        <button onClick={() => onReject(req.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition" title={t('رفض', 'Reject')}>
                                            <X size={14} />
                                        </button>
                                    )}
                                    {onView && (
                                        <button onClick={() => onView(req.id)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                                            <Arrow size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderInboxWidget;
