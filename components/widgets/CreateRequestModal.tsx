import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCreateRequest } from '../../hooks/useServiceRequests';
import {
    X, Loader, Plus, MessageSquare, FileText, CheckCircle, AlertCircle, Scale, Gavel
} from 'lucide-react';
import type { ServiceCategoryV2 } from '../../types/database';

const REQUEST_CATEGORIES: { value: ServiceCategoryV2; icon: React.ElementType; label_ar: string; label_en: string }[] = [
    { value: 'consultation', label_ar: 'استشارة قانونية', label_en: 'Legal Consultation', icon: MessageSquare },
    { value: 'contract_review', label_ar: 'مراجعة عقد', label_en: 'Contract Review', icon: FileText },
    { value: 'case_pleading', label_ar: 'ترافع في قضية', label_en: 'Case Pleading', icon: AlertCircle },
    { value: 'notarization', label_ar: 'توثيق', label_en: 'Notarization', icon: CheckCircle },
    { value: 'marriage', label_ar: 'عقد زواج', label_en: 'Marriage Contract', icon: Scale },
    { value: 'arbitration', label_ar: 'تحكيم', label_en: 'Arbitration', icon: Gavel },
    { value: 'other', label_ar: 'أخرى', label_en: 'Other', icon: Plus },
];

interface CreateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    defaultCategory?: ServiceCategoryV2;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
    isOpen,
    onClose,
    onCreated,
    defaultCategory = 'consultation',
}) => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const { create, loading: creating } = useCreateRequest();

    const [category, setCategory] = useState<ServiceCategoryV2>(defaultCategory);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!profile?.country_id || !profile?.id) return;
        setError(null);

        const { error: err } = await create({
            country_id: profile.country_id,
            seeker_id: profile.id,
            category,
            title,
            description: description || undefined,
        });

        if (err) {
            setError(err.message);
        } else {
            setTitle('');
            setDescription('');
            onClose();
            onCreated();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {t('طلب جديد', 'New Request')}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Category Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {REQUEST_CATEGORIES.map((cat) => {
                        const CatIcon = cat.icon;
                        return (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`p-3 rounded-xl border-2 text-center text-xs font-semibold transition ${category === cat.value
                                    ? 'border-[#C8A762] bg-[#C8A762]/10 text-[#C8A762]'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#C8A762]/50'
                                    }`}
                            >
                                <CatIcon size={18} className="mx-auto mb-1" />
                                {isRTL ? cat.label_ar : cat.label_en}
                            </button>
                        );
                    })}
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('عنوان الطلب...', 'Request title...')}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] mb-3 text-gray-800 dark:text-white"
                />

                {/* Description */}
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('وصف تفصيلي (اختياري)...', 'Detailed description (optional)...')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] mb-3 resize-none text-gray-800 dark:text-white"
                />

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-center mb-3">{error}</div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!title.trim() || creating}
                    className="w-full py-3 bg-[#0B3D2E] text-white font-bold rounded-lg hover:bg-[#0B3D2E]/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {creating ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                    {t('إرسال الطلب', 'Submit Request')}
                </button>
            </div>
        </div>
    );
};

export default CreateRequestModal;
