import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProviderRequests, usePoolRequests } from '../../../hooks/useServiceRequests';
import StatsOverviewWidget from '../../../components/widgets/StatsOverviewWidget';
import CalendarWidget from '../../../components/widgets/CalendarWidget';
import OrderInboxWidget from '../../../components/widgets/OrderInboxWidget';
import { supabase } from '../../../services/supabaseClient';
import { FileText, Award, Calendar, BookOpen, CheckCircle, Users, Heart } from 'lucide-react';

type Tab = '' | 'dossier' | 'ceremony' | 'calendar' | 'archive';

const MarriageDashboard: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') || '') as Tab;

    const { requests: poolRequests, loading: poolLoading } = usePoolRequests(profile?.country_id || undefined);
    const { requests: myRequests, loading: myLoading, refetch } = useProviderRequests(profile?.id);

    const pendingCount = myRequests.filter(r => !['completed', 'cancelled'].includes(r.status)).length;
    const completedCount = myRequests.filter(r => r.status === 'completed').length;

    const handleAccept = async (id: string) => {
        if (!profile?.id) return;
        await supabase.from('service_requests').update({ provider_id: profile.id, status: 'in_progress' }).eq('id', id);
        refetch();
    };

    return (
        <div className="space-y-6">
            {activeTab === '' && (
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('لوحة المأذون', 'Marriage Official Dashboard')}</h1>
                    <StatsOverviewWidget stats={[
                        { label_ar: 'طلبات جديدة', label_en: 'New Requests', value: poolRequests.length, color: 'text-blue-600' },
                        { label_ar: 'قيد التجهيز', label_en: 'In Preparation', value: pendingCount, color: 'text-amber-600' },
                        { label_ar: 'عقود مكتملة', label_en: 'Completed', value: completedCount, color: 'text-green-600' },
                    ]} />
                    <OrderInboxWidget requests={poolRequests.slice(0, 5)} loading={poolLoading} onAccept={handleAccept} />
                </div>
            )}

            {activeTab === 'dossier' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('الملف الرقمي', 'Digital Dossier')}</h2>
                    {myRequests.filter(r => r.status !== 'completed').length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                            <FileText className="mx-auto mb-3 text-gray-300" size={40} />
                            {t('لا توجد طلبات حالياً', 'No active requests')}
                        </div>
                    ) : (
                        myRequests.filter(r => r.status !== 'completed').map(req => (
                            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-3">{req.title}</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: t('هوية الزوج', 'Groom ID'), done: false },
                                        { label: t('هوية الزوجة', 'Bride ID'), done: false },
                                        { label: t('الفحص الطبي', 'Medical Check'), done: false },
                                        { label: t('بيانات الولي', 'Guardian Info'), done: false },
                                        { label: t('بيانات الشهود', 'Witness Info'), done: false },
                                        { label: t('تحديد المهر', 'Mahr Details'), done: false },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm">
                                            {item.done ? (
                                                <CheckCircle className="text-green-500" size={16} />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                                            )}
                                            <span className={item.done ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'ceremony' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('وضع المراسم', 'Ceremony Mode')}</h2>
                    <div className="bg-gradient-to-br from-[#0B3D2E] to-[#0B3D2E]/80 text-white rounded-2xl p-8 text-center">
                        <Heart className="mx-auto mb-4 text-[#C8A762]" size={48} />
                        <h3 className="text-xl font-bold mb-2">{t('واجهة يوم العقد', 'Wedding Day Interface')}</h3>
                        <p className="text-white/70 text-sm mb-6">{t('واجهة مخصصة للجهاز اللوحي بأزرار كبيرة وواضحة', 'Tablet-optimized interface with large, clear buttons')}</p>
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <button className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition">
                                <Users className="mx-auto mb-2" size={24} />
                                <span className="text-sm font-bold">{t('بيانات الأطراف', 'Parties Info')}</span>
                            </button>
                            <button className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition">
                                <FileText className="mx-auto mb-2" size={24} />
                                <span className="text-sm font-bold">{t('المهر والشروط', 'Mahr & Terms')}</span>
                            </button>
                            <button className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition">
                                <Award className="mx-auto mb-2" size={24} />
                                <span className="text-sm font-bold">{t('التوقيعات', 'Signatures')}</span>
                            </button>
                            <button className="p-4 bg-[#C8A762] text-[#0B3D2E] rounded-xl hover:bg-[#C8A762]/90 transition font-bold">
                                <CheckCircle className="mx-auto mb-2" size={24} />
                                <span className="text-sm">{t('إتمام وتوثيق', 'Complete & Register')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('تقويم الحجوزات', 'Booking Calendar')}</h2>
                    <CalendarWidget events={myRequests.map(r => ({ id: r.id, title: r.title, date: r.created_at }))} />
                </div>
            )}

            {activeTab === 'archive' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('أرشيف العقود', 'Marriage Contracts Archive')}</h2>
                    {completedCount === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500">
                            <BookOpen className="mx-auto mb-3 text-gray-300" size={40} />
                            {t('لا توجد عقود مكتملة', 'No completed contracts')}
                        </div>
                    ) : (
                        <OrderInboxWidget requests={myRequests.filter(r => r.status === 'completed')} loading={myLoading} />
                    )}
                </div>
            )}
        </div>
    );
};

export default MarriageDashboard;
