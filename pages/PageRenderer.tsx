import * as React from 'react';
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { usePage } from '../hooks/useContent';
import { COLORS } from '../utils/icons';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const PageRenderer: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t, language, isRTL } = useLanguage();
    const { selectedCountry } = useCountry();
    const { page, loading } = usePage(slug || '', selectedCountry?.id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.accent }}></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen pt-24 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">{isRTL ? 'الصفحة غير موجودة' : 'Page not found'}</h2>
                <Link to="/" className="text-[#C8A762] hover:underline flex items-center gap-2">
                    {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 py-16 mb-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-[#0B3D2E] dark:text-white mb-4">
                        {t(page.title_ar, page.title_en)}
                    </h1>
                    <div className="w-24 h-1 mx-auto" style={{ backgroundColor: COLORS.accent }}></div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose dark:prose-invert max-w-none prose-lg">
                    <div dangerouslySetInnerHTML={{ __html: t(page.content_ar, page.content_en) }} />
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#C8A762] font-bold hover:gap-3 transition-all">
                        {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PageRenderer;
