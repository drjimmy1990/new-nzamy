import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { smartHandoff } from '../../services/n8nClient';
import { supabase } from '../../services/supabaseClient';
import { Sparkles, User, Star, Shield, Loader, ArrowRight, CheckCircle } from 'lucide-react';
import type { ServiceCategoryV2 } from '../../types/database';

interface MatchedProvider {
    id: string;
    full_name: string;
    specialty: string;
    visibility_score: number;
    avatar_url: string;
}

const CATEGORIES: { value: ServiceCategoryV2; ar: string; en: string }[] = [
    { value: 'consultation', ar: 'استشارة قانونية', en: 'Legal Consultation' },
    { value: 'case_pleading', ar: 'ترافع في قضية', en: 'Case Pleading' },
    { value: 'contract_review', ar: 'مراجعة عقد', en: 'Contract Review' },
    { value: 'notarization', ar: 'توثيق', en: 'Notarization' },
    { value: 'marriage', ar: 'زواج', en: 'Marriage' },
    { value: 'arbitration', ar: 'تحكيم', en: 'Arbitration' },
];

const SmartHandoffWidget: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;

    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ServiceCategoryV2>('consultation');
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState<MatchedProvider[]>([]);
    const [error, setError] = useState('');
    const [requested, setRequested] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!description.trim() || !profile?.country_id) return;
        setLoading(true);
        setError('');
        setProviders([]);

        const result = await smartHandoff(description, category, profile.country_id);

        if (result.success && result.data?.providers) {
            setProviders(result.data.providers);
            if (result.data.providers.length === 0) {
                setError(t('لم نجد محامين متاحين حالياً', 'No available lawyers found'));
            }
        } else {
            setError(result.error || t('فشل البحث', 'Search failed'));
        }
        setLoading(false);
    };

    const handleRequest = async (providerId: string) => {
        if (!profile?.id || !profile?.country_id) return;
        setRequested(providerId);

        const { error: insertError } = await supabase
            .from('service_requests')
            .insert({
                seeker_id: profile.id,
                provider_id: providerId,
                country_id: profile.country_id,
                category,
                title: description.slice(0, 100),
                description,
                status: 'in_progress',
            });

        if (insertError) {
            setError(insertError.message);
            setRequested(null);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-[#C8A762]" size={20} />
                    {t('التوصيل الذكي بمحامي', 'Smart Lawyer Matching')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    {t('وصف مشكلتك وسنوصلك بأفضل محامي متخصص', 'Describe your case and we\'ll match you with the best lawyer')}
                </p>
            </div>

            <div className="p-5 space-y-4">
                {/* Category */}
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ServiceCategoryV2)}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-white"
                >
                    {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{isRTL ? c.ar : c.en}</option>
                    ))}
                </select>

                {/* Description */}
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={t('صف مشكلتك أو قضيتك بشكل مختصر...', 'Briefly describe your case or issue...')}
                    className="w-full h-24 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#C8A762]/50"
                />

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    disabled={loading || !description.trim()}
                    className="w-full py-3 bg-[#0B3D2E] text-white rounded-lg font-bold text-sm hover:bg-[#0B3D2E]/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    {loading ? t('جاري البحث...', 'Searching...') : t('ابحث عن محامي', 'Find a Lawyer')}
                </button>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* Results */}
                {providers.length > 0 && (
                    <div className="space-y-3 mt-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase">
                            {t('المحامون المقترحون', 'Suggested Lawyers')} ({providers.length})
                        </h4>
                        {providers.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div className="w-10 h-10 bg-[#C8A762] rounded-full flex items-center justify-center flex-shrink-0">
                                    {p.avatar_url ? (
                                        <img src={p.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                                    ) : (
                                        <User className="text-white" size={20} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-800 dark:text-white truncate">{p.full_name}</p>
                                    <p className="text-xs text-gray-500 truncate">{p.specialty || t('محامي عام', 'General Lawyer')}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                                            <Star size={10} /> {p.visibility_score}
                                        </span>
                                    </div>
                                </div>
                                {requested === p.id ? (
                                    <span className="text-green-500 flex items-center gap-1 text-xs font-bold">
                                        <CheckCircle size={14} /> {t('تم', 'Sent')}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleRequest(p.id)}
                                        className="px-3 py-1.5 bg-[#C8A762] text-[#0B3D2E] rounded-lg text-xs font-bold hover:bg-[#C8A762]/90 transition flex items-center gap-1"
                                    >
                                        {t('طلب', 'Request')} <ArrowRight size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartHandoffWidget;
