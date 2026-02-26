import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useBlogPosts } from '../hooks/useBlog';
import { COLORS } from '../utils/icons';

const BlogList: React.FC = () => {
    const { t, language, isRTL } = useLanguage();
    const { selectedCountry } = useCountry();
    const [page, setPage] = useState(1);
    const pageSize = 9;

    const { posts, totalPages, loading } = useBlogPosts({
        countryId: selectedCountry?.id,
        page,
        pageSize
    });

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.accent }}></div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 text-[#0B3D2E] dark:text-white">
                        {isRTL ? 'المدونة والأخبار' : 'Blog & News'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {isRTL
                            ? 'اطلع على آخر الأخبار والمقالات القانونية من فريق خبرائنا'
                            : 'Stay updated with the latest legal news and articles from our expert team'}
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {isRTL ? 'لا توجد مقالات حالياً' : 'No posts found at the moment'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700"
                            >
                                <Link to={`/blog/${post.slug}`} className="block h-48 overflow-hidden relative group">
                                    <img
                                        src={post.featured_image || '/placeholder-blog.jpg'}
                                        alt={t(post.title_ar, post.title_en)}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                    <span className="absolute top-4 right-4 bg-[#C8A762] text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {post.category}
                                    </span>
                                </Link>

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{new Date(post.published_at!).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                        </div>
                                        {post.author && (
                                            <div className="flex items-center gap-1">
                                                <User size={14} />
                                                <span>{post.author.full_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 text-[#0B3D2E] dark:text-white line-clamp-2 hover:text-[#C8A762] transition-colors">
                                        <Link to={`/blog/${post.slug}`}>{t(post.title_ar, post.title_en)}</Link>
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                                        {t(post.excerpt_ar, post.excerpt_en)}
                                    </p>

                                    <Link
                                        to={`/blog/${post.slug}`}
                                        className="inline-flex items-center gap-2 text-[#0B3D2E] dark:text-[#C8A762] font-bold hover:gap-3 transition-all text-sm mt-auto"
                                    >
                                        {isRTL ? 'اقرأ المزيد' : 'Read More'}
                                        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-16 gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-10 h-10 rounded-lg font-bold transition ${page === i + 1
                                        ? 'bg-[#0B3D2E] text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;
