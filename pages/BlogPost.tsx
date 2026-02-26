import * as React from 'react';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Clock, MessageSquare, ThumbsUp, ArrowRight, ArrowLeft, Share2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBlogPost, useBlogComments, useBlogLikes } from '../hooks/useBlog';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../utils/icons';

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t, language, isRTL } = useLanguage();
    const { user } = useAuth();
    const { post, loading: postLoading } = useBlogPost(slug);
    const { comments, addComment, loading: commentsLoading } = useBlogComments(post?.id);
    const { likesCount, hasLiked, toggleLike } = useBlogLikes(post?.id, user?.id || null);

    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (postLoading) {
        return (
            <div className="min-h-screen pt-24 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.accent }}></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen pt-24 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">{isRTL ? 'المقال غير موجود' : 'Post not found'}</h2>
                <Link to="/blog" className="text-[#C8A762] hover:underline flex items-center gap-2">
                    {isRTL ? 'العودة للمدونة' : 'Back to Blog'}
                </Link>
            </div>
        );
    }

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!newComment.trim()) return;

        setSubmitting(true);
        await addComment(newComment, user.id);
        setNewComment('');
        setSubmitting(false);
    };

    const handleShare = async () => {
        if (!post) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t(post.title_ar, post.title_en),
                    text: t(post.excerpt_ar, post.excerpt_en) || '',
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(isRTL ? 'تم نسخ الرابط' : 'Link copied to clipboard');
        }
    };

    return (
        <article className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Hero Image */}
            <div className="h-[400px] w-full relative">
                <img
                    src={post.featured_image || '/placeholder-blog.jpg'}
                    alt={t(post.title_ar, post.title_en)}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
                    <span className="inline-block bg-[#C8A762] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                        {post.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-4xl">
                        {t(post.title_ar, post.title_en)}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(post.published_at!).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        </div>
                        {post.author && (
                            <div className="flex items-center gap-2">
                                <User size={16} />
                                <span>{post.author.full_name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{post.views_count || 0} {isRTL ? 'مشاهدة' : 'Views'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm mb-12 prose dark:prose-invert max-w-none prose-lg">
                        <div dangerouslySetInnerHTML={{ __html: t(post.content_ar, post.content_en) || '' }} />
                    </div>

                    {/* Actions: Like & Share */}
                    <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-12">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleLike}
                                disabled={!user}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${hasLiked
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                    }`}
                            >
                                <ThumbsUp size={20} className={hasLiked ? 'fill-current' : ''} />
                                <span className="font-bold">{likesCount}</span>
                                <span>{isRTL ? 'إعجاب' : 'Likes'}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition"
                            >
                                <Share2 size={20} />
                                <span>{isRTL ? 'مشاركة' : 'Share'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                        <h3 className="text-2xl font-bold mb-8 text-[#0B3D2E] dark:text-white flex items-center gap-2">
                            <MessageSquare />
                            {isRTL ? 'التعليقات' : 'Comments'}
                            <span className="text-gray-400 text-lg font-normal">({comments.length})</span>
                        </h3>

                        {/* Comment Form */}
                        {user ? (
                            <form onSubmit={handleSubmitComment} className="mb-12">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        {user.user_metadata?.avatar_url && <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-grow">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder={isRTL ? 'أضف تعليقاً...' : 'Add a comment...'}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C8A762] min-h-[100px] transition-all"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                type="submit"
                                                disabled={submitting || !newComment.trim()}
                                                className="px-6 py-2 bg-[#0B3D2E] text-white rounded-lg font-bold hover:bg-[#0B3D2E]/90 transition disabled:opacity-50"
                                            >
                                                {submitting ? (isRTL ? 'جاري النشر...' : 'Posting...') : (isRTL ? 'نشر التعليق' : 'Post Comment')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl text-center mb-12">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {isRTL ? 'يرجى تسجيل الدخول لإضافة تعليق' : 'Please sign in to leave a comment'}
                                </p>
                                <button className="text-[#C8A762] font-bold hover:underline">
                                    {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                                </button>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-8">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        {comment.author?.avatar_url ? (
                                            <img src={comment.author?.avatar_url as string} alt={comment.author?.full_name || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 font-bold">
                                                {comment.author?.full_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl rounded-tl-none">
                                            <div className="flex justify-between items-center mb-2">
                                                <h5 className="font-bold text-[#0B3D2E] dark:text-white">{comment.author?.full_name}</h5>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-8">
                        {/* Categories Widget */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                            <h4 className="font-bold text-lg mb-4 text-[#0B3D2E] dark:text-white border-b pb-2 border-gray-100 dark:border-gray-700">
                                {isRTL ? 'التصنيفات' : 'Categories'}
                            </h4>
                            <ul className="space-y-2">
                                {['Legal', 'News', 'Updates', 'Cases'].map(cat => (
                                    <li key={cat}>
                                        <Link to={`/blog?category=${cat}`} className="block text-gray-600 dark:text-gray-400 hover:text-[#C8A762] transition text-sm">
                                            {cat}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter Widget */}
                        <div className="bg-[#0B3D2E] rounded-xl p-6 text-white text-center">
                            <h4 className="font-bold text-lg mb-2">
                                {isRTL ? 'اشترك في نشرتنا' : 'Subscribe to Newsletter'}
                            </h4>
                            <p className="text-sm opacity-80 mb-4">
                                {isRTL ? 'احصل على آخر التحديثات القانونية' : 'Get the latest legal updates direct to your inbox'}
                            </p>
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm mb-2"
                            />
                            <button className="w-full py-2 bg-[#C8A762] text-[#0B3D2E] font-bold rounded-lg text-sm hover:bg-[#b09150] transition">
                                {isRTL ? 'اشتراك' : 'Subscribe'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default BlogPost;
