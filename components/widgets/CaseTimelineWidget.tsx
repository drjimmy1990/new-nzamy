import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ServiceRequest } from '../../types/database';
import { Circle, CheckCircle2, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface CaseTimelineWidgetProps {
    request: ServiceRequest;
}

const TIMELINE_STEPS: { status: string; label_ar: string; label_en: string }[] = [
    { status: 'draft', label_ar: 'مسودة', label_en: 'Draft' },
    { status: 'pending_match', label_ar: 'بانتظار التعيين', label_en: 'Pending Match' },
    { status: 'in_progress', label_ar: 'قيد التنفيذ', label_en: 'In Progress' },
    { status: 'pending_approval', label_ar: 'بانتظار الموافقة', label_en: 'Pending Approval' },
    { status: 'completed', label_ar: 'مكتمل', label_en: 'Completed' },
];

const CATEGORY_LABELS: Record<string, { ar: string; en: string; color: string }> = {
    consultation: { ar: 'استشارة', en: 'Consultation', color: 'bg-blue-100 text-blue-700' },
    contract_review: { ar: 'مراجعة عقد', en: 'Contract Review', color: 'bg-emerald-100 text-emerald-700' },
    case_pleading: { ar: 'ترافع', en: 'Case Pleading', color: 'bg-red-100 text-red-700' },
    notarization: { ar: 'توثيق', en: 'Notarization', color: 'bg-purple-100 text-purple-700' },
    other: { ar: 'أخرى', en: 'Other', color: 'bg-gray-100 text-gray-700' },
};

const CaseTimelineWidget: React.FC<CaseTimelineWidgetProps> = ({ request }) => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const currentIndex = TIMELINE_STEPS.findIndex(s => s.status === request.status);
    const cat = CATEGORY_LABELS[(request as any).category] || CATEGORY_LABELS.other;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 dark:text-white">{request.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.color}`}>
                    {isRTL ? cat.ar : cat.en}
                </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">{request.description || ''}</p>

            <div className="flex items-center gap-1">
                {TIMELINE_STEPS.map((step, i) => {
                    const isDone = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    const Arrow = isRTL ? ArrowLeft : ArrowRight;
                    return (
                        <React.Fragment key={step.status}>
                            <div className="flex flex-col items-center flex-1 min-w-0">
                                {isDone ? (
                                    <CheckCircle2 size={22} className={`${isCurrent ? 'text-[#C8A762]' : 'text-green-500'} flex-shrink-0`} />
                                ) : (
                                    <Circle size={22} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                )}
                                <span className={`text-[10px] mt-1 text-center leading-tight ${isDone ? 'text-gray-800 dark:text-white font-bold' : 'text-gray-400'}`}>
                                    {isRTL ? step.label_ar : step.label_en}
                                </span>
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                                <Arrow size={12} className={`flex-shrink-0 ${i < currentIndex ? 'text-green-500' : 'text-gray-300'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default CaseTimelineWidget;
