-- =============================================
-- NIZAMI LAW FIRM — Full Supabase Schema v2
-- =============================================
-- Every country gets its own complete content set.
-- All content is bilingual (ar/en) using dual-column pattern.
-- Run this in Supabase SQL Editor to set up the entire database.
-- =============================================

-- =============================================
-- 1. PROFILES (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR
SELECT USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
    USING (auth.uid () = id);

CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. COUNTRIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    code TEXT UNIQUE NOT NULL, -- ISO 3166-1 alpha-2 (SA, AE, EG)
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    flag_emoji TEXT, -- 🇸🇦, 🇦🇪
    phone_code TEXT, -- +966, +971
    currency TEXT, -- SAR, AED, EGP
    default_language TEXT DEFAULT 'ar', -- ar or en
    display_order INT DEFAULT 0,
    is_default BOOLEAN DEFAULT false, -- one country is the default
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "countries_select" ON public.countries FOR
SELECT USING (true);

CREATE POLICY "countries_admin" ON public.countries FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 3. SITE SETTINGS (key-value per country)
-- =============================================
-- country_id NULL = global default, overridden by country-specific rows
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    value_ar TEXT,
    value_en TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (setting_key, country_id)
);

CREATE INDEX idx_site_settings_country ON public.site_settings (country_id);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select" ON public.site_settings FOR
SELECT USING (true);

CREATE POLICY "site_settings_admin" ON public.site_settings FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 4. HERO CONTENT (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.hero_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_ar TEXT,
    subtitle_en TEXT,
    cta1_text_ar TEXT,
    cta1_text_en TEXT,
    cta1_url TEXT,
    cta2_text_ar TEXT,
    cta2_text_en TEXT,
    cta2_url TEXT,
    cta3_text_ar TEXT,
    cta3_text_en TEXT,
    cta3_url TEXT,
    video_url TEXT, -- intro video per country
    background_image TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hero_content_country ON public.hero_content (country_id);

ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_content_select" ON public.hero_content FOR
SELECT USING (true);

CREATE POLICY "hero_content_admin" ON public.hero_content FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 5. FEATURES (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    icon TEXT NOT NULL DEFAULT 'ShieldCheck',
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_features_country ON public.features (country_id);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "features_select" ON public.features FOR
SELECT USING (true);

CREATE POLICY "features_admin" ON public.features FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 6. SERVICES (personal / company, per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Scale',
    button_text_ar TEXT,
    button_text_en TEXT,
    whatsapp_message_ar TEXT,
    whatsapp_message_en TEXT,
    category TEXT NOT NULL CHECK (
        category IN ('personal', 'company')
    ),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_services_country ON public.services (country_id);

CREATE INDEX idx_services_category ON public.services (category);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_select" ON public.services FOR
SELECT USING (true);

CREATE POLICY "services_admin" ON public.services FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 7. STATS (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    label_ar TEXT NOT NULL,
    label_en TEXT NOT NULL,
    value INT NOT NULL DEFAULT 0,
    suffix TEXT DEFAULT '+',
    icon TEXT NOT NULL DEFAULT 'Trophy',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stats_country ON public.stats (country_id);

ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stats_select" ON public.stats FOR
SELECT USING (true);

CREATE POLICY "stats_admin" ON public.stats FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 8. TEAM MEMBERS / FOUNDERS (per country)
-- =============================================
-- Same person can appear in multiple countries with different content
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    bio_ar TEXT,
    bio_en TEXT,
    image TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (slug, country_id)
);

CREATE INDEX idx_team_members_country ON public.team_members (country_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select" ON public.team_members FOR
SELECT USING (true);

CREATE POLICY "team_members_admin" ON public.team_members FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 9. TESTIMONIALS (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    author_ar TEXT NOT NULL,
    author_en TEXT NOT NULL,
    role_ar TEXT,
    role_en TEXT,
    avatar_url TEXT, -- reviewer photo
    rating INT DEFAULT 5 CHECK (
        rating >= 1
        AND rating <= 5
    ),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_testimonials_country ON public.testimonials (country_id);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_select" ON public.testimonials FOR
SELECT USING (true);

CREATE POLICY "testimonials_admin" ON public.testimonials FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 10. BLOG POSTS (user-generated, per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    excerpt_ar TEXT,
    excerpt_en TEXT,
    content_ar TEXT,
    content_en TEXT,
    featured_image TEXT,
    category TEXT,
    tags TEXT [], -- array of tags for filtering
    meta_description_ar TEXT, -- SEO meta per post
    meta_description_en TEXT,
    is_published BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    views_count INT DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (slug, country_id)
);

CREATE INDEX idx_blog_posts_country ON public.blog_posts (country_id);

CREATE INDEX idx_blog_posts_author ON public.blog_posts (author_id);

CREATE INDEX idx_blog_posts_published ON public.blog_posts (is_published, is_approved);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public reads published + approved posts only
CREATE POLICY "blog_posts_select_public" ON public.blog_posts FOR
SELECT USING (
        is_published = true
        AND is_approved = true
    );

-- Authors see their own posts (including drafts)
CREATE POLICY "blog_posts_select_own" ON public.blog_posts FOR
SELECT USING (auth.uid () = author_id);

-- Authenticated users can create
CREATE POLICY "blog_posts_insert" ON public.blog_posts FOR INSERT
WITH
    CHECK (auth.uid () = author_id);

-- Authors update their own
CREATE POLICY "blog_posts_update_own" ON public.blog_posts
FOR UPDATE
    USING (auth.uid () = author_id);

-- Authors delete their own
CREATE POLICY "blog_posts_delete_own" ON public.blog_posts FOR DELETE USING (auth.uid () = author_id);

-- Admins manage all (approve, reject, edit, delete)
CREATE POLICY "blog_posts_admin" ON public.blog_posts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 10b. BLOG COMMENTS (threaded)
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    post_id UUID NOT NULL REFERENCES public.blog_posts (id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.blog_comments (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blog_comments_post ON public.blog_comments (post_id);

CREATE INDEX idx_blog_comments_parent ON public.blog_comments (parent_id);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_comments_select" ON public.blog_comments FOR
SELECT USING (is_approved = true);

CREATE POLICY "blog_comments_select_own" ON public.blog_comments FOR
SELECT USING (auth.uid () = author_id);

CREATE POLICY "blog_comments_insert" ON public.blog_comments FOR INSERT
WITH
    CHECK (auth.uid () = author_id);

CREATE POLICY "blog_comments_update_own" ON public.blog_comments
FOR UPDATE
    USING (auth.uid () = author_id);

CREATE POLICY "blog_comments_delete_own" ON public.blog_comments FOR DELETE USING (auth.uid () = author_id);

CREATE POLICY "blog_comments_admin" ON public.blog_comments FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 10c. BLOG LIKES (one per user per post)
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    post_id UUID NOT NULL REFERENCES public.blog_posts (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (post_id, user_id)
);

CREATE INDEX idx_blog_likes_post ON public.blog_likes (post_id);

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_likes_select" ON public.blog_likes FOR
SELECT USING (true);

CREATE POLICY "blog_likes_insert" ON public.blog_likes FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "blog_likes_delete_own" ON public.blog_likes FOR DELETE USING (auth.uid () = user_id);

CREATE POLICY "blog_likes_admin" ON public.blog_likes FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 11. FAQ ITEMS (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.faq_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    question_ar TEXT NOT NULL,
    question_en TEXT NOT NULL,
    answer_ar TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    category TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_faq_items_country ON public.faq_items (country_id);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_items_select" ON public.faq_items FOR
SELECT USING (true);

CREATE POLICY "faq_items_admin" ON public.faq_items FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 12. SOCIAL LINKS (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_social_links_country ON public.social_links (country_id);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_links_select" ON public.social_links FOR
SELECT USING (true);

CREATE POLICY "social_links_admin" ON public.social_links FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 13. NAVIGATION LINKS (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.nav_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.nav_links (id) ON DELETE CASCADE, -- for dropdown nesting
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    href TEXT NOT NULL,
    target TEXT DEFAULT '_self', -- _self or _blank
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_nav_links_country ON public.nav_links (country_id);

CREATE INDEX idx_nav_links_parent ON public.nav_links (parent_id);

ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nav_links_select" ON public.nav_links FOR
SELECT USING (true);

CREATE POLICY "nav_links_admin" ON public.nav_links FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 14. CONTACT SUBMISSIONS (per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service_type TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contact_submissions_country ON public.contact_submissions (country_id);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit the contact form
CREATE POLICY "contact_submissions_insert" ON public.contact_submissions FOR INSERT
WITH
    CHECK (true);

-- Only admins can read/update/delete
CREATE POLICY "contact_submissions_admin" ON public.contact_submissions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 15. CLIENT LOGOS (marquee carousel, per country)
-- =============================================
CREATE TABLE IF NOT EXISTS public.client_logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    website_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_client_logos_country ON public.client_logos (country_id);

ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_logos_select" ON public.client_logos FOR
SELECT USING (true);

CREATE POLICY "client_logos_admin" ON public.client_logos FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- 16. PAGES (custom CMS pages, per country)
-- =============================================
-- For admin-editable pages: About, Terms, Privacy, etc.
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID REFERENCES public.countries (id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT,
    content_en TEXT,
    meta_description_ar TEXT,
    meta_description_en TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (slug, country_id)
);

CREATE INDEX idx_pages_country ON public.pages (country_id);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_select" ON public.pages FOR
SELECT USING (is_published = true);

CREATE POLICY "pages_admin" ON public.pages FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =============================================
-- UTILITY: Auto-update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'site_settings', 'hero_content', 'features',
    'services', 'stats', 'team_members', 'testimonials',
    'blog_posts', 'blog_comments', 'faq_items', 'pages'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I;
       CREATE TRIGGER update_%s_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- =============================================
-- SEED DATA — Default country: Saudi Arabia
-- =============================================
-- All seed data is linked to SA. Other countries start empty
-- and are populated via the Admin Panel.

-- Countries
INSERT INTO
    public.countries (
        code,
        name_ar,
        name_en,
        flag_emoji,
        phone_code,
        currency,
        default_language,
        display_order,
        is_default
    )
VALUES (
        'SA',
        'المملكة العربية السعودية',
        'Saudi Arabia',
        '🇸🇦',
        '+966',
        'SAR',
        'ar',
        1,
        true
    ),
    (
        'AE',
        'الإمارات العربية المتحدة',
        'United Arab Emirates',
        '🇦🇪',
        '+971',
        'AED',
        'ar',
        2,
        false
    ),
    (
        'EG',
        'مصر',
        'Egypt',
        '🇪🇬',
        '+20',
        'EGP',
        'ar',
        3,
        false
    ),
    (
        'KW',
        'الكويت',
        'Kuwait',
        '🇰🇼',
        '+965',
        'KWD',
        'ar',
        4,
        false
    ),
    (
        'BH',
        'البحرين',
        'Bahrain',
        '🇧🇭',
        '+973',
        'BHD',
        'ar',
        5,
        false
    ),
    (
        'OM',
        'عُمان',
        'Oman',
        '🇴🇲',
        '+968',
        'OMR',
        'ar',
        6,
        false
    ),
    (
        'QA',
        'قطر',
        'Qatar',
        '🇶🇦',
        '+974',
        'QAR',
        'ar',
        7,
        false
    ),
    (
        'JO',
        'الأردن',
        'Jordan',
        '🇯🇴',
        '+962',
        'JOD',
        'ar',
        8,
        false
    )
ON CONFLICT (code) DO NOTHING;

-- Site Settings (for Saudi Arabia)
INSERT INTO
    public.site_settings (
        country_id,
        setting_key,
        value_ar,
        value_en
    )
SELECT c.id, v.key, v.val_ar, v.val_en
FROM public.countries c, (
        VALUES (
                'company_name', 'شركة نظامي', 'Nizami Law Firm'
            ), (
                'company_tagline', 'للمحاماة', 'Law Firm'
            ), (
                'whatsapp_1', '966560655552', '966560655552'
            ), (
                'whatsapp_2', '966555979607', '966555979607'
            ), (
                'phone_1', '0560655552', '0560655552'
            ), (
                'phone_2', '0555979607', '0555979607'
            ), (
                'email', 'info@nzamy.com', 'info@nzamy.com'
            ), (
                'location', 'مقر شركة نظامي - جدة', 'Nizami Firm HQ - Jeddah'
            ), (
                'maps_url', 'https://maps.app.goo.gl/uLFNk7kkaGXocnfR7', 'https://maps.app.goo.gl/uLFNk7kkaGXocnfR7'
            ), (
                'footer_desc', 'شريكك القانوني الموثوق في المملكة العربية السعودية. نقدم حلولاً مبتكرة تجمع بين الخبرة العريقة والتقنية الحديثة.', 'Your trusted legal partner in Saudi Arabia. We offer innovative solutions combining ancient expertise with modern technology.'
            ), (
                'copyright', 'جميع الحقوق محفوظة © شركة نظامي 2025', 'All rights reserved © Nizami Law Firm 2025'
            ), (
                'features_title', 'لماذا نحن خيارك الأول؟', 'Why are we your first choice?'
            ), (
                'services_personal_title', 'خدماتنا للأفراد', 'Personal Services'
            ), (
                'services_personal_subtitle', 'حلول قانونية مصممة لحماية حقوقك الشخصية', 'Legal solutions designed to protect your personal rights'
            ), (
                'services_company_title', 'خدمات الشركات', 'Corporate Services'
            ), (
                'services_company_subtitle', 'حلول قانونية متكاملة لدعم أعمالك التجارية', 'Comprehensive legal solutions to support your business'
            ), (
                'stats_title', 'أرقام تتحدث عن نفسها', 'Numbers Speak for Themselves'
            ), (
                'founders_title', 'فريق القيادة', 'Leadership Team'
            ), (
                'founders_subtitle', 'نخبة من الخبراء القانونيين', 'Elite Legal Experts'
            ), (
                'clients_title', 'ثقة عملائنا هي فخرنا', 'Our Clients'' Trust is Our Pride'
            ), (
                'blog_title', 'المدونة القانونية', 'Legal Blog'
            ), (
                'blog_subtitle', 'مقالات ونصائح قانونية من خبرائنا', 'Articles and legal tips from our experts'
            ), (
                'faq_title', 'الأسئلة الشائعة', 'Frequently Asked Questions'
            ), (
                'book_cta', 'احجز استشارتك الآن', 'Book Consultation Now'
            ), (
                'book_message', 'مرحباً، أرغب في حجز استشارة قانونية.', 'Hello, I would like to book a legal consultation.'
            ), (
                'chat_title', 'المستشار الذكي', 'Smart Advisor'
            ), (
                'chat_subtitle', 'متصل (AI)', 'Online (AI)'
            ), (
                'chat_placeholder', 'اكتب استفسارك هنا...', 'Type your inquiry here...'
            ), (
                'chat_initial_message', 'أهلاً بك في نظامي، أنا مساعدك الرقمي تحت التدريب، كيف يمكنني توجيهك اليوم للخدمة الصحيحة؟', 'Welcome to Nizami. I am your digital assistant in training. How can I guide you to the right service today?'
            )
    ) AS v (key, val_ar, val_en)
WHERE
    c.code = 'SA'
ON CONFLICT (setting_key, country_id) DO NOTHING;

-- Hero Content (Saudi Arabia)
INSERT INTO
    public.hero_content (
        country_id,
        title_ar,
        title_en,
        subtitle_ar,
        subtitle_en,
        cta1_text_ar,
        cta1_text_en,
        cta2_text_ar,
        cta2_text_en,
        cta3_text_ar,
        cta3_text_en,
        is_active
    )
SELECT id, 'شركة نظامي.. شريكك القانوني الرقمي الموثوق', 'Nizami Firm.. Your Trusted Digital Legal Partner', 'أكثر من 15 عاماً من الخبرة نضعها بين يديك. نجمع بين النخبة القانونية والحلول الرقمية لضمان دقة الامتثال وسرعة الإنجاز، بما يتماشى مع رؤية المملكة 2030.', 'Over 15 years of experience at your fingertips. We combine the legal elite with digital solutions to ensure compliance accuracy and execution speed, in line with Vision 2030.', 'اطلب خدمة فورية', 'Request Service', 'تصفح خدماتنا', 'Browse Services', 'شاهد فيديو تعريفي', 'Watch Video', true
FROM public.countries
WHERE
    code = 'SA';

-- Features (Saudi Arabia)
INSERT INTO
    public.features (
        country_id,
        icon,
        title_ar,
        title_en,
        description_ar,
        description_en,
        display_order
    )
SELECT c.id, v.icon, v.t_ar, v.t_en, v.d_ar, v.d_en, v.ord
FROM public.countries c, (
        VALUES (
                'ShieldCheck', 'خبرة وتوافق', 'Experience & Compliance', 'فريق يضم نخبة المستشارين، وحلولنا متوافقة تماماً مع رؤية 2030.', 'A team of elite consultants, with solutions fully compatible with Vision 2030.', 1
            ), (
                'Zap', 'حلول ذكية', 'Smart Solutions', 'نقدم خدمات سريعة ودقيقة تساعدك على اتخاذ القرارات في وقت أقل.', 'We offer fast and accurate services that help you make decisions in less time.', 2
            ), (
                'Lock', 'خصوصية تامة', 'Complete Privacy', 'نلتزم بأعلى معايير الأمان وحماية البيانات لضمان سرية أعمالك.', 'We adhere to the highest security and data protection standards to ensure your business confidentiality.', 3
            )
    ) AS v (
        icon, t_ar, t_en, d_ar, d_en, ord
    )
WHERE
    c.code = 'SA';

-- Personal Services (Saudi Arabia)
INSERT INTO
    public.services (
        country_id,
        title_ar,
        title_en,
        description_ar,
        description_en,
        icon,
        button_text_ar,
        button_text_en,
        whatsapp_message_ar,
        whatsapp_message_en,
        category,
        display_order
    )
SELECT c.id, v.t_ar, v.t_en, v.d_ar, v.d_en, v.icon, v.btn_ar, v.btn_en, v.wa_ar, v.wa_en, v.cat, v.ord
FROM public.countries c, (
        VALUES (
                'دراسة قضية', 'Case Study', 'إذا كان موضوعك يحتوي الكثير من التفاصيل والعقود والإثباتات وتصكوك الأحكام المطلوب دراستها للوصول للإجابات التي تحتاجها.', 'If your matter involves many details, contracts, proofs, and judgment deeds requiring study to reach the answers you need.', 'ClipboardList', 'اطلب دراسة قضية', 'Request Case Study', 'مرحباً، أرغب في طلب خدمة دراسة قضية.', 'Hello, I would like to request a Case Study service.', 'personal', 1
            ), (
                'حضور جلسات', 'Session Attendance', 'إذا كنت مشغول، حصل لك ظرف أو ما عندك رغبة لتحضر الجلسة لأي سبب كان.. وكل محامي يحضر الجلسة ويرافع عنك فيها.', 'If you are busy, had an emergency, or simply do not wish to attend the session... assign a lawyer to attend and plead for you.', 'Users', 'احجز محامي للجلسة', 'Book a Lawyer', 'مرحباً، أرغب في حجز محامي لحضور جلسة.', 'Hello, I would like to book a lawyer for session attendance.', 'personal', 2
            ), (
                'الترافع والتوكيل', 'Pleading & Power of Attorney', 'توكيل محامي للترافع عنك في القضية بشكل كامل حتى صدور الحكم الابتدائي أو القطعي وتقديم طلب التنفيذ عند الحاجة.', 'Appointing a lawyer to fully plead for you until the preliminary or final judgment and filing for execution when needed.', 'Scale', 'وكّل محامي', 'Hire a Lawyer', 'مرحباً، أرغب في توكيل محامي للترافع.', 'Hello, I would like to hire a lawyer for pleading.', 'personal', 3
            ), (
                'طلبات تنفيذ', 'Execution Requests', 'رفع طلب التنفيذ و/أو متابعة الإجراءات حتى إخراج ضد المنفذ ضده أمام محكمة التنفيذ.', 'Filing execution requests and/or following up procedures until enforcement against the debtor before the execution court.', 'Gavel', 'ابدأ طلب تنفيذ', 'Start Execution', 'مرحباً، أرغب في البدء بإجراءات طلب تنفيذ.', 'Hello, I would like to start an execution request.', 'personal', 4
            ), (
                'العقود و الاتفاقيات', 'Contracts & Agreements', 'العقد شريعة المتعاقدين، صياغة ومراجعة العقود والاتفاقيات ودراسة العقود والبحث في إمكانية فسخها.', 'The contract is the law of the contractors. Drafting and reviewing contracts/agreements, studying contracts, and researching termination possibilities.', 'FileText', 'اطلب صياغة عقد', 'Request Drafting', 'مرحباً، أرغب في طلب صياغة/مراجعة عقد.', 'Hello, I would like to request contract drafting/review.', 'personal', 5
            ), (
                'كتابات قانونية', 'Legal Writing', 'صياغة اللوائح والمذكرات الجوابية الاعتراضية وصحائف الدعوى والنقض والالتماس وغيرها من الخطابات بطريقة قانونية سليمة.', 'Drafting regulations, response memos, objections, claim sheets, cassations, petitions, and other letters in a sound legal manner.', 'PenTool', 'اطلب صياغة لائحة', 'Request Writing', 'مرحباً، أرغب في طلب خدمة كتابة قانونية.', 'Hello, I would like to request legal writing services.', 'personal', 6
            )
    ) AS v (
        t_ar, t_en, d_ar, d_en, icon, btn_ar, btn_en, wa_ar, wa_en, cat, ord
    )
WHERE
    c.code = 'SA';

-- Company Services (Saudi Arabia)
INSERT INTO
    public.services (
        country_id,
        title_ar,
        title_en,
        description_ar,
        description_en,
        icon,
        button_text_ar,
        button_text_en,
        whatsapp_message_ar,
        whatsapp_message_en,
        category,
        display_order
    )
SELECT c.id, v.t_ar, v.t_en, v.d_ar, v.d_en, v.icon, v.btn_ar, v.btn_en, v.wa_ar, v.wa_en, v.cat, v.ord
FROM public.countries c, (
        VALUES (
                'الاستشارات القانونية', 'Legal Consultation', 'استشارات متخصصة للأفراد والشركات لدعم القرارات وحماية المصالح.', 'Specialized consultations for individuals and companies to support decisions and protect interests.', 'Briefcase', 'استشر الآن', 'Consult Now', 'مرحباً، أرغب في طلب استشارة قانونية.', 'Hello, I would like to book a legal consultation.', 'company', 1
            ), (
                'الامتثال والحوكمة', 'Compliance & Governance', 'تصميم سياسات وأنظمة امتثال متكاملة تعزز الشفافية.', 'Designing integrated compliance policies and systems that enhance transparency.', 'ShieldCheck', 'طلب خدمة شركات', 'Corporate Service', 'مرحباً، أرغب في الاستفسار عن خدمات الامتثال والحوكمة.', 'Hello, I would like to inquire about Compliance & Governance services.', 'company', 2
            ), (
                'التوثيق والإفراغ', 'Documentation & Notarization', 'خدمات التوثيق العقاري والإفراغ بكفاءة عالية ووفق الإجراءات النظامية.', 'Real estate documentation and notarization services with high efficiency and according to regulatory procedures.', 'FileCheck', 'احجز موعد توثيق', 'Book Appointment', 'مرحباً، أرغب في حجز موعد لخدمة توثيق/إفراغ.', 'Hello, I would like to book an appointment for documentation/notarization.', 'company', 3
            ), (
                'الشركات والاستثمار', 'Companies & Investment', 'خدمات تأسيس الشركات والاستشارات الاستثمارية وفق الأنظمة السعودية.', 'Company incorporation and investment consulting services according to Saudi regulations.', 'Building2', 'ابدأ مشروعك', 'Start Project', 'مرحباً، أرغب في الاستفسار عن خدمات تأسيس الشركات والاستثمار.', 'Hello, I would like to inquire about Company Incorporation & Investment services.', 'company', 4
            )
    ) AS v (
        t_ar, t_en, d_ar, d_en, icon, btn_ar, btn_en, wa_ar, wa_en, cat, ord
    )
WHERE
    c.code = 'SA';

-- Stats (Saudi Arabia)
INSERT INTO
    public.stats (
        country_id,
        label_ar,
        label_en,
        value,
        suffix,
        icon,
        display_order
    )
SELECT c.id, v.l_ar, v.l_en, v.val, v.suf, v.icon, v.ord
FROM public.countries c, (
        VALUES (
                'قضية تم إنجازها بنجاح', 'Cases Successfully Completed', 500, '+', 'Scale', 1
            ), (
                'عميل راضٍ عن خدماتنا', 'Satisfied Clients', 300, '+', 'Star', 2
            ), (
                'عقد واتفاقية تم صياغتها', 'Contracts & Agreements Drafted', 800, '+', 'FileText', 3
            ), (
                'عاماً من الخبرة القانونية', 'Years of Legal Experience', 15, '+', 'Trophy', 4
            )
    ) AS v (
        l_ar, l_en, val, suf, icon, ord
    )
WHERE
    c.code = 'SA';

-- Team Members (Saudi Arabia)
INSERT INTO
    public.team_members (
        country_id,
        slug,
        name_ar,
        name_en,
        title_ar,
        title_en,
        description_ar,
        description_en,
        bio_ar,
        bio_en,
        image,
        display_order
    )
SELECT c.id, v.slug, v.n_ar, v.n_en, v.t_ar, v.t_en, v.d_ar, v.d_en, v.b_ar, v.b_en, v.img, v.ord
FROM public.countries c, (
        VALUES (
                'rami-baqader', 'أ. رامي محمد باقادر', 'Mr. Rami Mohammed Baqader', 'محامٍ وموثق معتمد', 'Lawyer & Certified Notary', 'عضو هيئة المحامين السعوديين، خبرة عملية تتجاوز 12 عاماً.', 'Member of the Saudi Bar Association, with over 12 years of practical experience.', 'أ. رامي محمد باقادر، محامٍ وموثق معتمد، يتمتع بخبرة واسعة في المجال القانوني تمتد لأكثر من 12 عاماً.', 'Mr. Rami Mohammed Baqader is a certified lawyer and notary with over 12 years of extensive experience in the legal field.', '/creator-ramy.jpg', 1
            ), (
                'ashraf-weih', 'أ. أشرف عبدالرازق ويح', 'Mr. Ashraf Abdelrazaq Weih', 'مستشار قانوني', 'Legal Advisor', 'محامٍ بالنقض (مصر)، مؤلف للعديد من المؤلفات القانونية، دكتور بكلية الحقوق.', 'Cassation Lawyer (Egypt), author of numerous legal publications, PhD in Law.', 'أ. أشرف عبدالرازق ويح، مستشار قانوني ومحامٍ بالنقض في مصر.', 'Mr. Ashraf Abdelrazaq Weih is a Legal Advisor and Cassation Lawyer in Egypt.', '/creater-ashraf.jpg', 2
            )
    ) AS v (
        slug, n_ar, n_en, t_ar, t_en, d_ar, d_en, b_ar, b_en, img, ord
    )
WHERE
    c.code = 'SA';

-- Testimonials (Saudi Arabia)
INSERT INTO
    public.testimonials (
        country_id,
        content_ar,
        content_en,
        author_ar,
        author_en,
        role_ar,
        role_en,
        rating,
        display_order
    )
SELECT c.id, v.c_ar, v.c_en, v.a_ar, v.a_en, v.r_ar, v.r_en, v.rat, v.ord
FROM public.countries c, (
        VALUES (
                'خدمة احترافية وسرعة في الإنجاز لم أعهدها من قبل. فريق نظامي ساعدني في حل قضية عقارية معقدة.', 'Professional service and speed of execution I have never seen before. The Nizami team helped me solve a complex real estate case.', 'أ. محمد العتيبي', 'Mr. Mohammed Al-Otaibi', 'قطاع العقارات', 'Real Estate Sector', 5, 1
            ), (
                'الدقة في صياغة العقود حمت شركتنا من مشاكل قانونية كبيرة. أنصح بالتعامل معهم.', 'Precision in contract drafting saved our company from major legal problems. I highly recommend dealing with them.', 'شركة القمم', 'Al-Qimam Company', 'شركة تجارية', 'Trading Company', 5, 2
            ), (
                'المستشار الذكي في الموقع ساعدني أفهم موقفي القانوني مبدئياً قبل حجز الاستشارة. تجربة ممتازة.', 'The Smart Advisor on the site helped me understand my legal position initially before booking a consultation. Excellent experience.', 'سارة الأحمد', 'Sarah Al-Ahmed', 'عميل فردي', 'Individual Client', 5, 3
            )
    ) AS v (
        c_ar, c_en, a_ar, a_en, r_ar, r_en, rat, ord
    )
WHERE
    c.code = 'SA';

-- Navigation Links (Saudi Arabia)
INSERT INTO
    public.nav_links (
        country_id,
        name_ar,
        name_en,
        href,
        display_order
    )
SELECT c.id, v.n_ar, v.n_en, v.href, v.ord
FROM public.countries c, (
        VALUES (
                'الرئيسية', 'Home', '#hero', 1
            ), (
                'خدمات الأفراد', 'Personal Services', '#personal-services', 2
            ), (
                'خدمات الشركات', 'Corporate Services', '#company-services', 3
            ), ('المدونة', 'Blog', '/blog', 4), (
                'المؤسسون', 'Founders', '#founders', 5
            ), (
                'تواصل معنا', 'Contact', '#footer', 6
            )
    ) AS v (n_ar, n_en, href, ord)
WHERE
    c.code = 'SA';

-- Social Links (Saudi Arabia)
INSERT INTO
    public.social_links (
        country_id,
        platform,
        url,
        icon,
        display_order
    )
SELECT c.id, v.platform, v.url, v.icon, v.ord
FROM public.countries c, (
        VALUES ('twitter', '#', 'Twitter', 1), (
                'instagram', '#', 'Instagram', 2
            ), (
                'linkedin', '#', 'LinkedIn', 3
            ), ('youtube', '#', 'Youtube', 4)
    ) AS v (platform, url, icon, ord)
WHERE
    c.code = 'SA';

-- FAQ Items (Saudi Arabia)
INSERT INTO
    public.faq_items (
        country_id,
        question_ar,
        question_en,
        answer_ar,
        answer_en,
        category,
        display_order
    )
SELECT c.id, v.q_ar, v.q_en, v.a_ar, v.a_en, v.cat, v.ord
FROM public.countries c, (
        VALUES (
                'ما هي تكلفة الاستشارة القانونية؟', 'What is the cost of a legal consultation?', 'تختلف تكلفة الاستشارة حسب نوع القضية ومدى تعقيدها. يمكنك التواصل معنا عبر الواتساب للحصول على تقدير مبدئي.', 'The cost varies depending on the type and complexity of the case. You can contact us via WhatsApp for an initial estimate.', 'general', 1
            ), (
                'هل يمكنني حجز استشارة عن بُعد؟', 'Can I book a remote consultation?', 'نعم، نقدم استشارات عن بُعد عبر الاتصال المرئي أو الهاتفي لراحتك.', 'Yes, we offer remote consultations via video or phone call for your convenience.', 'general', 2
            ), (
                'كم يستغرق الرد على الاستفسارات؟', 'How long does it take to respond to inquiries?', 'نحرص على الرد خلال 24 ساعة عمل كحد أقصى.', 'We strive to respond within 24 business hours maximum.', 'general', 3
            ), (
                'هل تقدمون خدمات لغير السعوديين؟', 'Do you provide services for non-Saudis?', 'نعم، نقدم خدماتنا لجميع المقيمين في المملكة بغض النظر عن الجنسية.', 'Yes, we provide our services to all residents in the Kingdom regardless of nationality.', 'general', 4
            ), (
                'ما هي المستندات المطلوبة لتوكيل محامي؟', 'What documents are required to hire a lawyer?', 'عادة ما نحتاج إلى صورة الهوية الوطنية أو الإقامة، وأي مستندات متعلقة بالقضية.', 'We usually need a copy of the national ID or residency, and any documents related to the case.', 'general', 5
            )
    ) AS v (
        q_ar, q_en, a_ar, a_en, cat, ord
    )
WHERE
    c.code = 'SA';

-- =============================================
-- SEED BLOG POSTS
-- Requires author_id (FK to auth.users).
-- Run AFTER creating your first admin user.
-- Replace 'YOUR_ADMIN_USER_UUID' with actual UUID.
-- =============================================
/*
INSERT INTO public.blog_posts (author_id, country_id, slug, title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en, category, is_published, is_approved, published_at)
SELECT 'YOUR_ADMIN_USER_UUID'::uuid, c.id, v.slug, v.t_ar, v.t_en, v.e_ar, v.e_en, v.c_ar, v.c_en, v.cat, true, true, now()
FROM public.countries c,
(VALUES
('importance-of-legal-contracts', 'أهمية العقود القانونية في حماية حقوقك', 'The Importance of Legal Contracts in Protecting Your Rights', 'تعرف على أهمية صياغة العقود بشكل قانوني سليم وكيف يمكن أن تحمي حقوقك.', 'Learn about the importance of properly drafting legal contracts and how they can protect your rights.', 'العقود القانونية هي الأساس الذي تقوم عليه العلاقات التجارية والشخصية...', 'Legal contracts are the foundation upon which business and personal relationships are built...', 'contracts'),
('vision-2030-legal-compliance', 'الامتثال القانوني في ظل رؤية 2030', 'Legal Compliance Under Vision 2030', 'كيف تتوافق أعمالك مع متطلبات رؤية المملكة 2030 القانونية.', 'How to align your business with the legal requirements of Saudi Vision 2030.', 'رؤية 2030 أحدثت تحولات جوهرية في البيئة التنظيمية...', 'Vision 2030 has brought fundamental transformations to the regulatory environment...', 'compliance'),
('real-estate-documentation-guide', 'دليلك الشامل للتوثيق العقاري', 'Your Complete Guide to Real Estate Documentation', 'كل ما تحتاج معرفته عن إجراءات التوثيق والإفراغ العقاري في السعودية.', 'Everything you need to know about real estate documentation and notarization procedures in Saudi Arabia.', 'التوثيق العقاري في المملكة العربية السعودية يمر بعدة مراحل...', 'Real estate documentation in Saudi Arabia goes through several stages...', 'real-estate')
) AS v(slug, t_ar, t_en, e_ar, e_en, c_ar, c_en, cat)
WHERE c.code = 'SA';
*/