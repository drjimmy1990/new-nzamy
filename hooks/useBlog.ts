import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { BlogPost, BlogComment } from '../types/database';

// =============================================
// Blog Posts — listing, single, CRUD
// =============================================

interface UseBlogOptions {
    countryId?: string | null;
    category?: string;
    page?: number;
    pageSize?: number;
}

export function useBlogPosts(options: UseBlogOptions = {}) {
    const { countryId, category, page = 1, pageSize = 9 } = options;
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('blog_posts')
            .select('*', { count: 'exact' })
            .eq('is_published', true)
            .eq('is_approved', true)
            .order('published_at', { ascending: false })
            .range(from, to);

        if (countryId) query = query.eq('country_id', countryId);
        if (category) query = query.eq('category', category);

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
        } else {
            setPosts((data as BlogPost[]) || []);
            setTotal(count || 0);
        }
        setLoading(false);
    }, [countryId, category, page, pageSize]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    return {
        posts,
        total,
        totalPages: Math.ceil(total / pageSize),
        loading,
        refetch: fetchPosts,
    };
}


// =============================================
// Single Blog Post by slug
// =============================================
export function useBlogPost(slug: string | undefined) {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        const fetch = async () => {
            setLoading(true);

            // Increment view count
            try { await supabase.rpc('increment_views', { post_slug: slug }); } catch { }

            const { data } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .single();

            setPost(data as BlogPost);
            setLoading(false);
        };
        fetch();
    }, [slug]);

    return { post, loading };
}


// =============================================
// Blog Comments (threaded)
// =============================================
export function useBlogComments(postId: string | undefined) {
    const [comments, setComments] = useState<BlogComment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        if (!postId) return;
        setLoading(true);

        const { data } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('post_id', postId)
            .eq('is_approved', true)
            .order('created_at', { ascending: true });

        // Build threaded tree
        const flat = (data || []) as BlogComment[];
        const roots = flat.filter(c => !c.parent_id);
        const tree = roots.map(root => ({
            ...root,
            replies: flat.filter(c => c.parent_id === root.id),
        }));

        setComments(tree);
        setLoading(false);
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const addComment = async (content: string, authorId: string, parentId?: string) => {
        const { error } = await supabase.from('blog_comments').insert({
            post_id: postId,
            author_id: authorId,
            parent_id: parentId || null,
            content,
        });
        if (!error) await fetchComments();
        return { error: error?.message || null };
    };

    const deleteComment = async (commentId: string) => {
        await supabase.from('blog_comments').delete().eq('id', commentId);
        await fetchComments();
    };

    return { comments, loading, addComment, deleteComment, refetch: fetchComments };
}


// =============================================
// Blog Likes
// =============================================
export function useBlogLikes(postId: string | undefined, userId: string | null) {
    const [likesCount, setLikesCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);

    const fetchLikes = useCallback(async () => {
        if (!postId) return;

        const { count } = await supabase
            .from('blog_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        setLikesCount(count || 0);

        if (userId) {
            const { data } = await supabase
                .from('blog_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .single();
            setHasLiked(!!data);
        }
    }, [postId, userId]);

    useEffect(() => { fetchLikes(); }, [fetchLikes]);

    const toggleLike = async () => {
        if (!postId || !userId) return;

        if (hasLiked) {
            await supabase.from('blog_likes').delete()
                .eq('post_id', postId)
                .eq('user_id', userId);
        } else {
            await supabase.from('blog_likes').insert({
                post_id: postId,
                user_id: userId,
            });
        }
        await fetchLikes();
    };

    return { likesCount, hasLiked, toggleLike };
}


// =============================================
// My Posts (user's own, including drafts)
// =============================================
export function useMyPosts(authorId: string | null) {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyPosts = useCallback(async () => {
        if (!authorId) { setLoading(false); return; }
        setLoading(true);

        const { data } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('author_id', authorId)
            .order('created_at', { ascending: false });

        setPosts((data as BlogPost[]) || []);
        setLoading(false);
    }, [authorId]);

    useEffect(() => { fetchMyPosts(); }, [fetchMyPosts]);

    return { posts, loading, refetch: fetchMyPosts };
}


// =============================================
// Create / Update / Delete Posts
// =============================================
export function useBlogActions() {
    const createPost = async (post: Partial<BlogPost>) => {
        const { data, error } = await supabase.from('blog_posts').insert(post).select().single();
        return { data, error: error?.message || null };
    };

    const updatePost = async (id: string, updates: Partial<BlogPost>) => {
        const { error } = await supabase.from('blog_posts').update(updates).eq('id', id);
        return { error: error?.message || null };
    };

    const deletePost = async (id: string) => {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        return { error: error?.message || null };
    };

    return { createPost, updatePost, deletePost };
}
