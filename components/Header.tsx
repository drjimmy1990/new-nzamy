import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Moon, Sun, ChevronDown } from 'lucide-react';
import { COLORS } from '../utils/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavLinks, useSiteSettings } from '../hooks/useContent';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { countries, selectedCountry, setCountry } = useCountry();
  const { navLinks } = useNavLinks(selectedCountry?.id);
  const { get } = useSiteSettings(selectedCountry?.id);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (href.startsWith('/')) {
      navigate(href);
      return;
    }

    if (href === '#' || href === '#hero') {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleLanguage = () => setLanguage(language === 'ar' ? 'en' : 'ar');
  const companyName = get('company_name', language);
  const companyTagline = get('company_tagline', language);
  const bookCta = get('book_cta', language);
  const bookMsg = get('book_message', language);
  const whatsapp = get('whatsapp_1', 'en');

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="#"
            onClick={(e) => handleNavClick(e, '#')}
            className="flex items-center gap-2 text-2xl font-bold text-[#0B3D2E] dark:text-white transition-colors"
          >
            <img src="/logo.png" alt="Nizami Law Firm" className="h-10 w-auto object-contain" />
            <div className="flex flex-col mx-2">
              <span className="text-xl font-bold text-[#0B3D2E] dark:text-white leading-none">
                {companyName || (isRTL ? 'نظامي' : 'Nizami')}
              </span>
              <span className="text-xs font-light text-gray-500 dark:text-gray-400 leading-none">
                {companyTagline || (isRTL ? 'للمحاماة' : 'Law Firm')}
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-reverse space-x-6 items-center rtl:space-x-reverse ltr:space-x-6">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target={link.target || '_self'}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-medium text-[#0B3D2E] dark:text-gray-200 hover:text-[#C8A762] dark:hover:text-[#C8A762] transition-colors"
              >
                {t(link.name_ar, link.name_en)}
              </a>
            ))}
          </div>

          {/* Country Selector */}
          {countries.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-[#0B3D2E] dark:text-gray-200 transition"
              >
                <span>{selectedCountry?.flag_emoji}</span>
                <span className="hidden lg:inline">{selectedCountry && t(selectedCountry.name_ar, selectedCountry.name_en)}</span>
                <ChevronDown size={14} />
              </button>
              {isCountryOpen && (
                <div className="absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] z-50 end-0">
                  {countries.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setCountry(c); setIsCountryOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition ${c.id === selectedCountry?.id ? 'bg-gray-50 dark:bg-gray-700 font-bold' : ''
                        }`}
                    >
                      <span className="text-lg">{c.flag_emoji}</span>
                      <span className="text-[#0B3D2E] dark:text-gray-200">{t(c.name_ar, c.name_en)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions: Lang + Theme */}
          <div className="flex items-center gap-2 border-r rtl:border-l rtl:border-r-0 border-gray-200 dark:border-gray-700 px-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#0B3D2E] dark:text-yellow-400 transition-colors" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleLanguage} className="flex items-center gap-1 font-medium text-[#0B3D2E] dark:text-gray-200 hover:text-[#C8A762] dark:hover:text-[#C8A762] transition">
              <Globe size={18} />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>
          </div>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(bookMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-lg font-bold transition transform hover:scale-105 text-[#0B3D2E]"
            style={{ backgroundColor: COLORS.accent }}
          >
            {bookCta || (isRTL ? 'احجز استشارتك' : 'Book Consultation')}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {countries.length > 1 && (
            <button
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="text-lg"
            >
              {selectedCountry?.flag_emoji}
            </button>
          )}
          <button onClick={toggleTheme} className="p-1 text-[#0B3D2E] dark:text-yellow-400">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleLanguage} className="flex items-center gap-1 font-bold text-sm text-[#0B3D2E] dark:text-white">
            <span>{language === 'ar' ? 'En' : 'عربي'}</span>
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#0B3D2E] dark:text-white">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Country Dropdown */}
      {isCountryOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-2">
          {countries.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCountry(c); setIsCountryOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm ${c.id === selectedCountry?.id ? 'bg-gray-50 dark:bg-gray-700 font-bold' : ''
                }`}
            >
              <span className="text-lg">{c.flag_emoji}</span>
              <span className="text-[#0B3D2E] dark:text-gray-200">{t(c.name_ar, c.name_en)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4 flex flex-col space-y-4 shadow-lg transition-colors">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block font-medium p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-[#0B3D2E] dark:text-gray-200 transition-colors"
            >
              {t(link.name_ar, link.name_en)}
            </a>
          ))}
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(bookMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center px-6 py-3 rounded-lg font-bold text-[#0B3D2E]"
            style={{ backgroundColor: COLORS.accent }}
          >
            {bookCta || (isRTL ? 'احجز استشارتك' : 'Book Consultation')}
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;