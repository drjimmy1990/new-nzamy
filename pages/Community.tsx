import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useQuestions, useAskQuestion, useQuestionDetail, useSubmitAnswer, useUpvoteAnswer } from '../hooks/useCommunity';
import {
    MessageCircle, Send, ThumbsUp,
    User, Shield, Search, Plus, X, Loader, Clock,
    Tag, ArrowLeft, ArrowRight, CheckCircle
} from 'lucide-react';

const CATEGORIES = [
    { value: '', ar: 'الكل', en: 'All' },
    { value: 'family', ar: 'الأحوال الشخصية', en: 'Family Law' },
    { value: 'labor', ar: 'قانون العمل', en: 'Labor Law' },
    { value: 'commercial', ar: 'القانون التجاري', en: 'Commercial Law' },
    { value: 'criminal', ar: 'القانون الجنائي', en: 'Criminal Law' },
    { value: 'real_estate', ar: 'العقارات', en: 'Real Estate' },
    { value: 'administrative', ar: 'القانون الإداري', en: 'Administrative Law' },
    { value: 'other', ar: 'أخرى', en: 'Other' },
];

const Community: React.FC = () => {
    const { user, profile } = useAuth();
    const { isRTL } = useLanguage();
    const { selectedCountry } = useCountry();
    const t = (ar: string, en: string) => isRTL ? ar : en;

    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAskModal, setShowAskModal] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

    const { questions, loading, refetch } = useQuestions(selectedCountry?.id, selectedCategory || undefined);

    const filteredQuestions = questions.filter(q =>
        !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero */}
            <div style={{ background: '#0B3D2E' }} className="text-white pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
                        {t('اسأل. ناقش. تعلّم.', 'Ask. Discuss. Learn.')}
                    </h1>
                    <p className="text-sm" style={{ color: '#C8A762' }}>
                        {t('اطرح أسئلتك القانونية واحصل على إجابات من محامين معتمدين', 'Ask legal questions and get answers from certified lawyers')}
                    </p>
                </div>
            </div>

            {/* Main Container */}
            <div className="max-w-3xl mx-auto px-4 -mt-6 pb-16">
                {/* Search + Filter Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 mb-6 border border-gray-100 dark:border-gray-700">
                    {/* Search */}
                    <div className="flex items-center gap-3 mb-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#C8A762]">
                        <Search size={18} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('ابحث في الأسئلة...', 'Search questions...')}
                            className="w-full bg-transparent focus:outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${selectedCategory === cat.value
                                    ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#C8A762]'
                                    }`}
                            >
                                {isRTL ? cat.ar : cat.en}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Header Row */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {t('الأسئلة', 'Questions')}
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{filteredQuestions.length}</span>
                    </h2>
                    <button
                        onClick={() => {
                            if (!user) { window.location.href = '/login'; return; }
                            setShowAskModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#C8A762] text-[#0B3D2E] rounded-xl font-bold text-sm hover:bg-[#b89a56] transition shadow-sm"
                    >
                        <Plus size={14} /> {t('اطرح سؤال', 'Ask')}
                    </button>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="flex justify-center py-16"><Loader className="animate-spin text-[#C8A762]" size={32} /></div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <MessageCircle className="mx-auto mb-3 text-gray-300" size={48} />
                        <h3 className="font-bold text-gray-600 dark:text-gray-300">{t('لا توجد أسئلة بعد', 'No questions yet')}</h3>
                        <p className="text-gray-400 text-sm mt-1">{t('كن أول من يطرح سؤال!', 'Be the first to ask!')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredQuestions.map(q => (
                            <QuestionCard key={q.id} question={q} onOpen={() => setSelectedQuestionId(q.id)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAskModal && <AskQuestionModal onClose={() => setShowAskModal(false)} onSuccess={() => { setShowAskModal(false); refetch(); }} />}
            {selectedQuestionId && <QuestionDetailModal questionId={selectedQuestionId} onClose={() => setSelectedQuestionId(null)} />}
        </div>
    );
};

// ── Question Card ──
const QuestionCard: React.FC<{ question: any; onOpen: () => void }> = ({ question, onOpen }) => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const category = CATEGORIES.find(c => c.value === question.category);
    const authorName = question.author?.full_name || t('مجهول', 'Anonymous');
    const isProvider = question.author?.account_cat === 'provider';

    return (
        <div onClick={onOpen} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-[#C8A762]/30 transition cursor-pointer">
            <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ${isProvider ? 'bg-[#0B3D2E]' : 'bg-gray-400'}`}>
                    {authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm leading-snug">{question.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{question.content}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {category && category.value && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#0B3D2E]/10 text-[#0B3D2E] dark:text-[#C8A762] dark:bg-[#C8A762]/10 rounded-full">
                                <Tag size={10} /> {isRTL ? category.ar : category.en}
                            </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {new Date(question.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><User size={10} /> {authorName}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><MessageCircle size={10} /> {question.answers_count || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Ask Question Modal ──
const AskQuestionModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const { selectedCountry } = useCountry();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const { ask } = useAskQuestion();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('other');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;
        setSubmitting(true);
        setError('');
        const { error: err } = await ask({
            country_id: selectedCountry?.id || '',
            author_id: profile?.id || null,
            title: title.trim(),
            content: content.trim(),
            category,
        });
        setSubmitting(false);
        if (err) { setError(err.message); return; }
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('اطرح سؤال', 'Ask a Question')}</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
                </div>

                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('التصنيف', 'Category')}</label>
                <div className="flex flex-wrap gap-2 mb-4">
                    {CATEGORIES.filter(c => c.value).map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${category === cat.value
                                ? 'border-[#C8A762] bg-[#C8A762]/10 text-[#C8A762]'
                                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#C8A762]/50'}`}
                        >
                            {isRTL ? cat.ar : cat.en}
                        </button>
                    ))}
                </div>

                <input
                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={t('عنوان السؤال...', 'Question title...')}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] mb-3 text-sm"
                />
                <textarea
                    value={content} onChange={e => setContent(e.target.value)}
                    placeholder={t('اشرح سؤالك بالتفصيل...', 'Describe your question in detail...')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] mb-3 resize-none text-sm"
                />

                {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center mb-3">{error}</div>}

                <button
                    onClick={handleSubmit}
                    disabled={!title.trim() || !content.trim() || submitting}
                    className="w-full py-3 bg-[#0B3D2E] text-white font-bold rounded-lg hover:bg-[#0B3D2E]/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {submitting ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                    {t('نشر السؤال', 'Post Question')}
                </button>
            </div>
        </div>
    );
};

// ── Question Detail Modal ──
const QuestionDetailModal: React.FC<{ questionId: string; onClose: () => void }> = ({ questionId, onClose }) => {
    const { user, profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;

    const { question, answers, loading, refetch } = useQuestionDetail(questionId);
    const { submit } = useSubmitAnswer();
    const { upvote } = useUpvoteAnswer();

    const [answerText, setAnswerText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isProvider = profile?.account_cat === 'provider';
    const Arrow = isRTL ? ArrowRight : ArrowLeft;

    const handleAnswer = async () => {
        if (!answerText.trim() || !profile?.id) return;
        setSubmitting(true);
        await submit(questionId, profile.id, answerText.trim());
        setAnswerText('');
        setSubmitting(false);
        refetch();
    };

    const handleUpvote = async (answerId: string) => {
        await upvote(answerId);
        refetch();
    };

    const category = CATEGORIES.find(c => c.value === question?.category);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 flex-shrink-0">
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Arrow size={18} /></button>
                    <h3 className="font-bold text-gray-800 dark:text-white flex-1 text-sm">{t('تفاصيل السؤال', 'Question Details')}</h3>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader className="animate-spin text-[#C8A762]" size={28} /></div>
                    ) : question ? (
                        <>
                            <div>
                                <h2 className="text-base font-bold text-gray-800 dark:text-white mb-2">{question.title}</h2>
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    {category && category.value && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#0B3D2E]/10 text-[#0B3D2E] dark:text-[#C8A762] dark:bg-[#C8A762]/10 rounded-full">
                                            <Tag size={10} /> {isRTL ? category.ar : category.en}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {question.author?.full_name || t('مجهول', 'Anonymous')} • {new Date(question.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{question.content}</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-700 dark:text-white text-sm mb-3">
                                    {t('الإجابات', 'Answers')} ({answers.length})
                                </h4>
                                {answers.length === 0 ? (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center text-gray-400 text-sm">
                                        {t('لا توجد إجابات بعد. كن أول من يجيب!', 'No answers yet. Be the first to answer!')}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {answers.map(a => (
                                            <div key={a.id} className={`bg-gray-50 dark:bg-gray-700 rounded-xl p-4 ${a.is_endorsed ? 'ring-2 ring-green-400' : ''}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#0B3D2E] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {(a.provider?.full_name || '?').charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="text-sm font-bold text-gray-800 dark:text-white">{a.provider?.full_name || t('محامي', 'Lawyer')}</span>
                                                            {a.provider?.account_cat === 'provider' && <Shield className="text-[#C8A762]" size={12} />}
                                                            {a.is_endorsed && (
                                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                                    <CheckCircle size={10} /> {t('معتمدة', 'Endorsed')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{a.content}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <button onClick={() => handleUpvote(a.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#C8A762] transition">
                                                                <ThumbsUp size={12} /> {a.upvotes || 0}
                                                            </button>
                                                            <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Answer Input */}
                {user && isProvider ? (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text" value={answerText} onChange={e => setAnswerText(e.target.value)}
                                placeholder={t('اكتب إجابتك...', 'Write your answer...')}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] text-sm"
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnswer(); } }}
                            />
                            <button onClick={handleAnswer} disabled={!answerText.trim() || submitting} className="px-4 py-2.5 bg-[#0B3D2E] text-white rounded-lg hover:bg-[#0B3D2E]/90 disabled:opacity-50 transition">
                                {submitting ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">{t('إجابتك تزيد من نقاط ظهورك', 'Your answer boosts your visibility score')}</p>
                    </div>
                ) : !user ? (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center flex-shrink-0">
                        <a href="/login" className="text-sm text-[#C8A762] font-bold hover:underline">{t('سجّل دخول للإجابة', 'Login to answer')}</a>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Community;
