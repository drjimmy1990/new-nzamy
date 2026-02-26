import React from 'react';
import { COLORS } from '../utils/icons';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useNavLinks, useSocialLinks, useSiteSettings } from '../hooks/useContent';

const Footer: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const { selectedCountry } = useCountry();
  const { navLinks } = useNavLinks(selectedCountry?.id);
  const { socialLinks } = useSocialLinks(selectedCountry?.id);
  const { get } = useSiteSettings(selectedCountry?.id);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#hero' || href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer" className="text-white pt-20 pb-32" style={{ backgroundColor: COLORS.primary }}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-20 mb-12">

          {/* Column 1: Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">
              {get('company_name', language) || (isRTL ? 'شركة نظامي' : 'Nizami Law Firm')}
            </h3>
            <p className="opacity-80 leading-relaxed mb-6 max-w-sm">
              {get('footer_desc', language)}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 rounded-full hover:bg-[#C8A762] transition"
                    aria-label={link.platform}
                  >
                    <span className="text-white text-sm">{link.platform.charAt(0).toUpperCase()}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:mx-auto">
            <h4 className="text-xl font-bold mb-6" style={{ color: COLORS.accent }}>
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-4 opacity-90">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    onClick={(e) => handleScroll(e, link.href)}
                    className="hover:text-[#C8A762] transition duration-200 inline-block hover:translate-x-1 rtl:hover:-translate-x-1"
                  >
                    {t(link.name_ar, link.name_en)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-xl font-bold mb-6" style={{ color: COLORS.accent }}>
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="space-y-6">
              {get('location', language) && (
                <a
                  href={get('location_url', 'en')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 hover:text-[#C8A762] transition group"
                >
                  <MapPin size={24} className="flex-shrink-0 text-[#C8A762] group-hover:scale-110 transition" />
                  <span className="leading-tight">{get('location', language)}</span>
                </a>
              )}

              <div className="flex items-start gap-4">
                <Phone size={24} className="text-[#C8A762] mt-1" />
                <div className="flex flex-col dir-ltr text-right items-end">
                  {get('phone_1', 'en') && (
                    <a href={`tel:${get('phone_1', 'en')}`} className="hover:text-[#C8A762] transition block mb-1 font-medium">
                      {get('phone_1', 'en')}
                    </a>
                  )}
                  {get('phone_2', 'en') && (
                    <a href={`tel:${get('phone_2', 'en')}`} className="hover:text-[#C8A762] transition block font-medium">
                      {get('phone_2', 'en')}
                    </a>
                  )}
                </div>
              </div>

              {get('email', 'en') && (
                <a href={`mailto:${get('email', 'en')}`} className="flex items-center gap-4 hover:text-[#C8A762] transition group">
                  <Mail size={24} className="text-[#C8A762] group-hover:scale-110 transition" />
                  <span>{get('email', 'en')}</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col items-center justify-center text-sm opacity-60">
          <div className="flex gap-8 mb-4">
            <a href="/page/privacy" className="hover:text-white transition">
              {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </a>
            <a href="/page/terms" className="hover:text-white transition">
              {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </a>
          </div>
          <p className="text-center font-medium">
            {get('footer_rights', language) || `© ${new Date().getFullYear()} Nizami Law Firm`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;