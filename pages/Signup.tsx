import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabasePublic as supabase } from '../services/supabaseClient';
import { Country, AccountCategory, SeekerType, ProviderType } from '../types/database';
import {
    ArrowLeft, ArrowRight, Globe, Users, Briefcase,
    User, Building2, Landmark, Heart,
    Scale, GraduationCap, Stamp, Church, Shield,
    Mail, Lock, UserCircle, Loader, Hash, CheckCircle
} from 'lucide-react';

const SEEKER_OPTIONS: { value: SeekerType; icon: React.ElementType; label_ar: string; label_en: string; desc_ar: string; desc_en: string }[] = [
    { value: 'individual', icon: User, label_ar: 'فرد', label_en: 'Individual', desc_ar: 'شخص يبحث عن خدمة قانونية', desc_en: 'Person seeking legal service' },
    { value: 'company', icon: Building2, label_ar: 'شركة', label_en: 'Company', desc_ar: 'كيان تجاري يحتاج خدمات قانونية', desc_en: 'Business entity needing legal services' },
    { value: 'government', icon: Landmark, label_ar: 'جهة حكومية', label_en: 'Government', desc_ar: 'مؤسسة حكومية', desc_en: 'Government institution' },
    { value: 'ngo', icon: Heart, label_ar: 'جمعية / منظمة', label_en: 'NGO', desc_ar: 'جمعية خيرية أو منظمة غير ربحية', desc_en: 'Charity or non-profit organization' },
];

const PROVIDER_OPTIONS: { value: ProviderType; icon: React.ElementType; label_ar: string; label_en: string; desc_ar: string; desc_en: string }[] = [
    { value: 'law_firm', icon: Building2, label_ar: 'شركة محاماة', label_en: 'Law Firm', desc_ar: 'مكتب محاماة مرخص', desc_en: 'Licensed law firm' },
    { value: 'independent_lawyer', icon: Scale, label_ar: 'محامي مستقل', label_en: 'Independent Lawyer', desc_ar: 'محامي مرخص يعمل بشكل مستقل', desc_en: 'Licensed independent lawyer' },
    { value: 'trainee_lawyer', icon: GraduationCap, label_ar: 'محامي متدرب', label_en: 'Trainee Lawyer', desc_ar: 'محامي تحت التدريب', desc_en: 'Lawyer under training' },
    { value: 'notary', icon: Stamp, label_ar: 'موثق', label_en: 'Notary', desc_ar: 'موثق معتمد', desc_en: 'Certified notary' },
    { value: 'marriage_official', icon: Church, label_ar: 'مأذون', label_en: 'Marriage Official', desc_ar: 'مأذون شرعي معتمد', desc_en: 'Certified marriage official' },
    { value: 'arbitrator', icon: Shield, label_ar: 'محكم', label_en: 'Arbitrator', desc_ar: 'محكم معتمد', desc_en: 'Certified arbitrator' },
];

const Signup: React.FC = () => {
    const { signUp } = useAuth();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    // Wizard state
    const [step, setStep] = useState(1);
    const [countries, setCountries] = useState<Country[]>([]);

    // Form data
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [accountCat, setAccountCat] = useState<AccountCategory | null>(null);
    const [subType, setSubType] = useState<SeekerType | ProviderType | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch countries on mount
    useEffect(() => {
        let cancelled = false;
        const fetchCountries = async () => {
            const { data, error } = await supabase
                .from('countries')
                .select('*')
                .in('code', ['SA', 'EG'])
                .eq('is_active', true)
                .order('display_order');
            if (!cancelled && !error) {
                setCountries(data || []);
            }
        };
        fetchCountries();
        return () => { cancelled = true; };
    }, []);

    const t = (ar: string, en: string) => isRTL ? ar : en;
    const BackArrow = isRTL ? ArrowRight : ArrowLeft;
    const NextArrow = isRTL ? ArrowLeft : ArrowRight;

    const needsLicense = subType && ['independent_lawyer', 'law_firm', 'notary', 'marriage_official', 'arbitrator'].includes(subType);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCountry || !accountCat || !subType) return;
        setLoading(true);
        setError(null);

        const { error: signUpError } = await signUp(
            email,
            password,
            fullName,
            selectedCountry.id,
            accountCat,
            subType
        );

        if (signUpError) {
            setError(signUpError);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    // ── Success screen ──
    if (success) {
        return (
            <div className="min-h-screen pt-20 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={56} />
                    <h2 className="text-xl font-bold text-[#0B3D2E] dark:text-white mb-2">
                        {t('تم إنشاء الحساب بنجاح!', 'Account Created Successfully!')}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {t('يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب', 'Please check your email to verify your account')}
                    </p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-3 bg-[#0B3D2E] text-white font-bold rounded-lg hover:bg-[#0B3D2E]/90 transition"
                    >
                        {t('تسجيل الدخول', 'Go to Login')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 flex justify-center items-start bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-4 pb-10">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">

                {/* ── Progress Bar ── */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex-1">
                            <div className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#C8A762]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            <p className={`text-xs mt-1 text-center ${s <= step ? 'text-[#C8A762] font-bold' : 'text-gray-400'}`}>
                                {s === 1 ? t('البلد', 'Country') : s === 2 ? t('الغرض', 'Intent') : s === 3 ? t('النوع', 'Type') : t('الحساب', 'Account')}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Step 1: Country ── */}
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-bold text-[#0B3D2E] dark:text-white mb-2 text-center">
                            {t('اختر بلدك', 'Choose Your Country')}
                        </h2>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            {t('سيتم عرض المحتوى والخدمات الخاصة ببلدك', 'Content and services will be tailored to your country')}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {countries.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => { setSelectedCountry(c); setStep(2); }}
                                    className={`p-4 rounded-xl border-2 text-center transition hover:shadow-md ${selectedCountry?.id === c.id ? 'border-[#C8A762] bg-[#C8A762]/10' : 'border-gray-200 dark:border-gray-700 hover:border-[#C8A762]/50'
                                        }`}
                                >
                                    <span className="text-3xl block mb-1">{c.flag_emoji}</span>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {isRTL ? c.name_ar : c.name_en}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Step 2: Seeker vs Provider ── */}
                {step === 2 && (
                    <div>
                        <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-500 hover:text-[#C8A762] mb-4 text-sm">
                            <BackArrow size={16} /> {t('رجوع', 'Back')}
                        </button>
                        <h2 className="text-xl font-bold text-[#0B3D2E] dark:text-white mb-2 text-center">
                            {t('ما هو هدفك؟', 'What is your purpose?')}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <button
                                onClick={() => { setAccountCat('seeker'); setSubType(null); setStep(3); }}
                                className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0B3D2E] hover:shadow-lg transition text-center group"
                            >
                                <Users className="mx-auto text-[#0B3D2E] mb-3 group-hover:scale-110 transition" size={40} />
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('أحتاج خدمة قانونية', 'I need legal services')}</h3>
                                <p className="text-gray-500 text-sm mt-1">{t('أبحث عن محامي أو مستشار قانوني', 'Looking for a lawyer or legal advisor')}</p>
                            </button>
                            <button
                                onClick={() => { setAccountCat('provider'); setSubType(null); setStep(3); }}
                                className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#C8A762] hover:shadow-lg transition text-center group"
                            >
                                <Briefcase className="mx-auto text-[#C8A762] mb-3 group-hover:scale-110 transition" size={40} />
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{t('أقدم خدمات قانونية', 'I provide legal services')}</h3>
                                <p className="text-gray-500 text-sm mt-1">{t('محامي، موثق، مأذون، أو محكم', 'Lawyer, notary, marriage official, or arbitrator')}</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Entity Type ── */}
                {step === 3 && (
                    <div>
                        <button onClick={() => setStep(2)} className="flex items-center gap-1 text-gray-500 hover:text-[#C8A762] mb-4 text-sm">
                            <BackArrow size={16} /> {t('رجوع', 'Back')}
                        </button>
                        <h2 className="text-xl font-bold text-[#0B3D2E] dark:text-white mb-2 text-center">
                            {accountCat === 'seeker' ? t('أنت...', 'You are...') : t('تخصصك هو...', 'Your specialty is...')}
                        </h2>
                        <div className={`grid gap-3 mt-6 ${accountCat === 'provider' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                            {(accountCat === 'seeker' ? SEEKER_OPTIONS : PROVIDER_OPTIONS).map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setSubType(opt.value); setStep(4); }}
                                        className={`p-4 rounded-xl border-2 text-center transition hover:shadow-md ${subType === opt.value ? 'border-[#C8A762] bg-[#C8A762]/10' : 'border-gray-200 dark:border-gray-700 hover:border-[#C8A762]/50'
                                            }`}
                                    >
                                        <Icon className="mx-auto text-[#0B3D2E] dark:text-[#C8A762] mb-2" size={28} />
                                        <h4 className="font-semibold text-sm text-gray-800 dark:text-white">{isRTL ? opt.label_ar : opt.label_en}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{isRTL ? opt.desc_ar : opt.desc_en}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Step 4: Credentials ── */}
                {step === 4 && (
                    <div>
                        <button onClick={() => setStep(3)} className="flex items-center gap-1 text-gray-500 hover:text-[#C8A762] mb-4 text-sm">
                            <BackArrow size={16} /> {t('رجوع', 'Back')}
                        </button>
                        <h2 className="text-xl font-bold text-[#0B3D2E] dark:text-white mb-6 text-center">
                            {t('أنشئ حسابك', 'Create Your Account')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('الاسم الكامل', 'Full Name')}
                                </label>
                                <div className="relative">
                                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]`}
                                    />
                                    <UserCircle className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('البريد الإلكتروني', 'Email Address')}
                                </label>
                                <div className="relative">
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr"
                                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]`}
                                    />
                                    <Mail className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('كلمة المرور', 'Password')}
                                </label>
                                <div className="relative">
                                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr"
                                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]`}
                                    />
                                    <Lock className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
                                </div>
                            </div>

                            {/* License Number (conditional) */}
                            {needsLicense && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        {t('رقم الترخيص / السجل التجاري', 'License / Commercial Record Number')}
                                    </label>
                                    <div className="relative">
                                        <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} dir="ltr"
                                            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]`}
                                            placeholder={t('اختياري', 'Optional')}
                                        />
                                        <Hash className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
                                    </div>
                                </div>
                            )}

                            {/* Summary Badge */}
                            <div className="p-3 bg-[#0B3D2E]/5 dark:bg-[#0B3D2E]/20 rounded-lg text-sm">
                                <span className="font-bold text-[#0B3D2E] dark:text-[#C8A762]">{t('ملخص:', 'Summary:')}</span>{' '}
                                <span className="text-gray-700 dark:text-gray-300">
                                    {selectedCountry?.flag_emoji} {isRTL ? selectedCountry?.name_ar : selectedCountry?.name_en} · {
                                        accountCat === 'seeker'
                                            ? (SEEKER_OPTIONS.find(o => o.value === subType)?.[isRTL ? 'label_ar' : 'label_en'] || '')
                                            : (PROVIDER_OPTIONS.find(o => o.value === subType)?.[isRTL ? 'label_ar' : 'label_en'] || '')
                                    }
                                </span>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full py-3 bg-[#0B3D2E] text-white font-bold rounded-lg hover:bg-[#0B3D2E]/90 transition shadow-lg shadow-[#0B3D2E]/20 flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : t('إنشاء الحساب', 'Create Account')}
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                                <Link to="/login" className="text-[#C8A762] font-bold hover:underline">
                                    {t('تسجيل الدخول', 'Sign In')}
                                </Link>
                            </p>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;
