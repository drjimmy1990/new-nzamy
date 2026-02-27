import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommunityQuestion } from '../../types/database';
import { MessageCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface CommunityRadarWidgetProps {
    questions: CommunityQuestion[];
    loading: boolean;
    onAnswer?: (questionId: string) => void;
}

const CommunityRadarWidget: React.FC<CommunityRadarWidgetProps> = ({ questions, loading, onAnswer }) => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const Arrow = isRTL ? ChevronLeft : ChevronRight;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#C8A762]" />
                    {t('رادار المجتمع', 'Community Radar')}
                </h3>
                <span className="text-xs text-gray-500">{t('أجب لتزيد نقاطك', 'Answer to boost your score')}</span>
            </div>

            {loading ? (
                <div className="p-4 space-y-3 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
                </div>
            ) : questions.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <MessageCircle className="mx-auto mb-2" size={32} />
                    <p className="text-sm">{t('لا توجد أسئلة بدون إجابة', 'No unanswered questions')}</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {questions.slice(0, 5).map((q) => (
                        <div key={q.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{q.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{q.content}</p>
                                </div>
                                {onAnswer && (
                                    <button
                                        onClick={() => onAnswer(q.id)}
                                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#C8A762] text-white rounded-lg hover:bg-[#b89a56] transition whitespace-nowrap"
                                    >
                                        {t('أجب الآن', 'Answer')}
                                        <Arrow size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityRadarWidget;
