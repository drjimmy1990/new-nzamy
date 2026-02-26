import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useTeamMember } from '../hooks/useContent';
import { ArrowRight, ArrowLeft, Mail, Phone, Linkedin } from 'lucide-react';

const TeamMemberPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t, language, isRTL } = useLanguage();
    const { selectedCountry } = useCountry();
    const { member, loading } = useTeamMember(slug || '', selectedCountry?.id);

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#C8A762] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {isRTL ? 'عذراً، لم يتم العثور على العضو' : 'Sorry, member not found'}
                </h2>
                <Link
                    to="/"
                    className="text-[#C8A762] hover:underline flex items-center gap-2"
                >
                    {isRTL ? <ArrowRight /> : <ArrowLeft />}
                    {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#C8A762] transition-colors"
                    >
                        {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        <span>{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-2/5 h-96 md:h-auto relative">
                            <img
                                src={member.image || ''}
                                alt={t(member.name_ar, member.name_en)}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D2E]/80 to-transparent md:hidden"></div>
                        </div>

                        <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-center">
                            <div className="mb-6">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#0B3D2E] dark:text-white mb-2">
                                    {t(member.name_ar, member.name_en)}
                                </h1>
                                <p className="text-xl text-[#C8A762] font-medium">
                                    {t(member.title_ar, member.title_en)}
                                </p>
                            </div>

                            <div className="prose dark:prose-invert max-w-none mb-8">
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                    {t(member.description_ar, member.description_en)}
                                </p>
                                {(member.bio_ar || member.bio_en) && (
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                                        {t(member.bio_ar, member.bio_en)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-[#0B3D2E] dark:text-white hover:bg-[#C8A762] hover:text-white transition-colors">
                                    <Mail size={20} />
                                </button>
                                <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-[#0B3D2E] dark:text-white hover:bg-[#C8A762] hover:text-white transition-colors">
                                    <Phone size={20} />
                                </button>
                                <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-[#0B3D2E] dark:text-white hover:bg-[#C8A762] hover:text-white transition-colors">
                                    <Linkedin size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamMemberPage;
