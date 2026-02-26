// =============================================
// Database Types — matches schema.sql v2
// =============================================

export type Language = 'ar' | 'en';
export type ServiceCategory = 'personal' | 'company';
export type UserRole = 'admin' | 'user';

export interface Country {
    id: string;
    code: string;
    name_ar: string;
    name_en: string;
    flag_emoji: string | null;
    phone_code: string | null;
    currency: string | null;
    default_language: string;
    display_order: number;
    is_default: boolean;
    is_active: boolean;
    created_at: string;
}

export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface SiteSetting {
    id: string;
    country_id: string | null;
    setting_key: string;
    value_ar: string | null;
    value_en: string | null;
    updated_at: string;
}

export interface HeroContent {
    id: string;
    country_id: string | null;
    title_ar: string;
    title_en: string;
    subtitle_ar: string | null;
    subtitle_en: string | null;
    cta1_text_ar: string | null;
    cta1_text_en: string | null;
    cta1_url: string | null;
    cta2_text_ar: string | null;
    cta2_text_en: string | null;
    cta2_url: string | null;
    cta3_text_ar: string | null;
    cta3_text_en: string | null;
    cta3_url: string | null;
    video_url: string | null;
    background_image: string | null;
    is_active: boolean;
    updated_at: string;
}

export interface Feature {
    id: string;
    country_id: string | null;
    icon: string;
    title_ar: string;
    title_en: string;
    description_ar: string;
    description_en: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Service {
    id: string;
    country_id: string | null;
    title_ar: string;
    title_en: string;
    description_ar: string;
    description_en: string;
    icon: string;
    button_text_ar: string | null;
    button_text_en: string | null;
    whatsapp_message_ar: string | null;
    whatsapp_message_en: string | null;
    category: ServiceCategory;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Stat {
    id: string;
    country_id: string | null;
    label_ar: string;
    label_en: string;
    value: number;
    suffix: string;
    icon: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TeamMember {
    id: string;
    country_id: string | null;
    slug: string;
    name_ar: string;
    name_en: string;
    title_ar: string;
    title_en: string;
    description_ar: string | null;
    description_en: string | null;
    bio_ar: string | null;
    bio_en: string | null;
    image: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Testimonial {
    id: string;
    country_id: string | null;
    content_ar: string;
    content_en: string;
    author_ar: string;
    author_en: string;
    role_ar: string | null;
    role_en: string | null;
    avatar_url: string | null;
    rating: number;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BlogPost {
    id: string;
    author_id: string;
    country_id: string | null;
    slug: string;
    title_ar: string;
    title_en: string;
    excerpt_ar: string | null;
    excerpt_en: string | null;
    content_ar: string | null;
    content_en: string | null;
    featured_image: string | null;
    category: string | null;
    tags: string[] | null;
    meta_description_ar: string | null;
    meta_description_en: string | null;
    is_published: boolean;
    is_approved: boolean;
    views_count: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    author?: Profile;
    likes_count?: number;
    comments_count?: number;
    user_has_liked?: boolean;
}

export interface BlogComment {
    id: string;
    post_id: string;
    author_id: string;
    parent_id: string | null;
    content: string;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
    // Joined
    author?: Profile;
    replies?: BlogComment[];
}

export interface BlogLike {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface FaqItem {
    id: string;
    country_id: string | null;
    question_ar: string;
    question_en: string;
    answer_ar: string;
    answer_en: string;
    category: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SocialLink {
    id: string;
    country_id: string | null;
    platform: string;
    url: string;
    icon: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export interface NavLink {
    id: string;
    country_id: string | null;
    parent_id: string | null;
    name_ar: string;
    name_en: string;
    href: string;
    target: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    // Computed
    children?: NavLink[];
}

export interface ContactSubmission {
    id: string;
    country_id: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    service_type: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface ClientLogo {
    id: string;
    country_id: string | null;
    name: string;
    logo_url: string;
    website_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export interface Page {
    id: string;
    country_id: string | null;
    slug: string;
    title_ar: string;
    title_en: string;
    content_ar: string | null;
    content_en: string | null;
    meta_description_ar: string | null;
    meta_description_en: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

// Helper type for bilingual field access
export type BilingualField<T> = {
    [K in keyof T]: K extends `${string}_ar` | `${string}_en` ? T[K] : never;
};
