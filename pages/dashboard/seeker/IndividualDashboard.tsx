import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMyRequests, useCreateRequest } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import CaseTimelineWidget from '../../../components/widgets/CaseTimelineWidget';
import {
    MessageSquare, Search, FileText, DollarSign,
    Plus, X, Loader, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import type { ServiceCategoryV2 } from '../../../types/database';

const REQUEST_CATEGORIES: { value: ServiceCategoryV2; label_ar: string; label_en: string; icon: React.ElementType }[] = [
    { value: 'consultation', label_ar: 'استشارة قانونية', label_en: 'Legal Consultation', icon: MessageSquare },
    { value: 'contract_review', label_ar: 'مراجعة عقد', label_en: 'Contract Review', icon: FileText },
    { value: 'case_pleading', label_ar: 'ترافع في قضية', label_en: 'Case Pleading', icon: AlertCircle },
    { value: 'notarization', label_ar: 'توثيق', label_en: 'Notarization', icon: CheckCircle },
    { value: 'other', label_ar: 'أخرى', label_en: 'Other', icon: Plus },
];

const IndividualDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;

    const { requests, loading: requestsLoading, refetch } = useMyRequests(profile?.id);
    const { create, loading: creating } = useCreateRequest();

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCategory, setNewCategory] = useState<ServiceCategoryV2>('consultation');
    const [submitError, setSubmitError] = useState<string | null>(null);

    const activeRequests = requests.filter(r => !['completed', 'cancelled'].includes(r.status));
    const completedRequests = requests.filter(r => r.status === 'completed');
    const pendingRequests = requests.filter(r => r.status === 'pending_match');

    const handleCreateRequest = async () => {
        if (!profile?.country_id || !profile?.id) return;
        setSubmitError(null);

        const { error } = await create({
            country_id: profile.country_id,
            seeker_id: profile.id,
            category: newCategory,
            title: newTitle,
            description: newDesc || undefined,
        });

        if (error) {
            setSubmitError(error.message);
        } else {
            setShowModal(false);
            setNewTitle('');
            setNewDesc('');
            refetch();
        }
    };

    const quickActions = [
        { icon: MessageSquare, label: t('استشارة فورية', 'Quick Consultation'), color: 'bg-blue-500', onClick: () => { setNewCategory('consultation'); setShowModal(true); } },
        { icon: FileText, label: t('مراجعة عقد', 'Review Contract'), color: 'bg-emerald-500', onClick: () => { setNewCategory('contract_review'); setShowModal(true); } },
        { icon: Search, label: t('ابحث عن محامي', 'Find Lawyer'), color: 'bg-purple-500', onClick: () => { } },
        { icon: DollarSign, label: t('تتبع القضايا', 'Track Cases'), color: 'bg-amber-500', onClick: () => { } },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {t('مرحباً', 'Welcome')}, {profile?.full_name} 👋
                </h1>
                <p className="text-gray-500 mt-1">{t('ماذا تحتاج اليوم؟', 'What do you need today?')}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <button key={i} onClick={action.onClick} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition text-center group">
                            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                                <Icon className="text-white" size={24} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{action.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Stats */}
            <StatsOverviewWidget stats={[
                { label_ar: 'طلبات نشطة', label_en: 'Active', value: activeRequests.length, color: 'text-blue-600' },
                { label_ar: 'مكتملة', label_en: 'Completed', value: completedRequests.length, color: 'text-green-600' },
                { label_ar: 'في الانتظار', label_en: 'Pending', value: pendingRequests.length, color: 'text-amber-600' },
                { label_ar: 'مجموع الطلبات', label_en: 'Total', value: requests.length, color: 'text-purple-600' },
            ]} />

            {/* Create Request Button */}
            <button
                onClick={() => setShowModal(true)}
                className="w-full py-4 border-2 border-dashed border-[#C8A762] rounded-xl text-[#C8A762] font-bold hover:bg-[#C8A762]/10 transition flex items-center justify-center gap-2"
            >
                <Plus size={20} /> {t('إنشاء طلب جديد', 'Create New Request')}
            </button>

            {/* My Cases */}
            <div>
                <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-3">
                    {t('قضاياي', 'My Cases')} ({requests.length})
                </h2>
                {requestsLoading ? (
                    <div className="flex justify-center py-8"><Loader className="animate-spin text-[#C8A762]" size={30} /></div>
                ) : requests.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <FileText className="mx-auto text-gray-300 mb-3" size={40} />
                        <p className="text-gray-500">{t('لا توجد طلبات بعد. أنشئ طلبك الأول!', 'No requests yet. Create your first one!')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map(req => (
                            <CaseTimelineWidget key={req.id} request={req} />
                        ))}
                    </div>
                )}
            </div>

            {/* AI Chat Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <MessageSquare className="mx-auto text-[#C8A762] mb-3" size={40} />
                <h3 className="font-bold text-gray-700 dark:text-white">{t('المستشار الذكي', 'AI Legal Advisor')}</h3>
                <p className="text-gray-500 text-sm mt-1">{t('قريباً - سيتم ربطه مع n8n', 'Coming soon — will be connected to n8n')}</p>
            </div>

            {/* ── Create Request Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{t('طلب جديد', 'New Request')}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
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
                                        onClick={() => setNewCategory(cat.value)}
                                        className={`p-3 rounded-xl border-2 text-center text-xs font-semibold transition ${newCategory === cat.value
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
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder={t('عنوان الطلب...', 'Request title...')}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] mb-3"
                        />

                        {/* Description */}
                        <textarea
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder={t('وصف تفصيلي (اختياري)...', 'Detailed description (optional)...')}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762] mb-3 resize-none"
                        />

                        {submitError && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center mb-3">{submitError}</div>
                        )}

                        <button
                            onClick={handleCreateRequest}
                            disabled={!newTitle.trim() || creating}
                            className="w-full py-3 bg-[#0B3D2E] text-white font-bold rounded-lg hover:bg-[#0B3D2E]/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {creating ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                            {t('إرسال الطلب', 'Submit Request')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndividualDashboard;
