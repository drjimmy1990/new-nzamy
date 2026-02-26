import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { COLORS } from '../utils/icons';
import VideoModal from './VideoModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useHero, useSiteSettings } from '../hooks/useContent';

const Hero: React.FC = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const { t, isRTL } = useLanguage();
  const { selectedCountry } = useCountry();
  const { hero } = useHero(selectedCountry?.id);
  const { get } = useSiteSettings(selectedCountry?.id);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!hero) return null;

  const whatsappNum = get('whatsapp_1', 'en');
  const bookMsg = get('book_message', isRTL ? 'ar' : 'en');

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden" style={{ backgroundColor: COLORS.primary }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1.5" fill="#ffffff"></circle>
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
        </svg>
      </div>

      {/* Ambient Light */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A762] rounded-full blur-[120px] opacity-10 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#C8A762] rounded-full blur-[100px] opacity-5 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`text-white text-center ${isRTL ? 'md:text-right' : 'md:text-left'} flex flex-col justify-center`}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.5] md:leading-[1.3] tracking-normal"
          >
            {t(hero.title_ar, hero.title_en)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl opacity-90 mb-10 leading-loose font-light max-w-2xl"
          >
            {t(hero.subtitle_ar, hero.subtitle_en)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'md:justify-start' : 'md:justify-start'}`}
          >
            <motion.a
              href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(bookMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg font-bold text-center transition shadow-lg shadow-[#C8A762]/20 text-[#0B3D2E]"
              style={{ backgroundColor: COLORS.accent }}
            >
              {t(hero.cta1_text_ar, hero.cta1_text_en)}
            </motion.a>
            <motion.a
              href="#services"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleScroll(e, '#services')}
              className="px-8 py-4 rounded-lg font-bold text-center border-2 transition text-white"
              style={{ borderColor: COLORS.accent }}
            >
              {t(hero.cta2_text_ar, hero.cta2_text_en)}
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVideoOpen(true)}
              className="px-8 py-4 rounded-lg font-bold text-center border-2 flex items-center justify-center gap-2 transition text-white"
              style={{ borderColor: COLORS.accent }}
            >
              <Play size={20} fill={COLORS.accent} stroke={COLORS.accent} />
              {t(hero.cta3_text_ar, hero.cta3_text_en)}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Abstract Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          className="hidden md:flex justify-center items-center"
        >
          <div className="relative w-full max-w-md aspect-square rounded-full border-8 border-white/5 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[80%] h-[80%] rounded-full border-8 border-white/10"
            ></motion.div>
            <div className="w-[60%] h-[60%] bg-[#C8A762]/20 rounded-full blur-3xl absolute"></div>
            <motion.div animate={{ rotateY: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
              <ScaleIcon size={180} color={COLORS.accent} strokeWidth={1} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent transition-colors duration-300"></div>

      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} videoUrl={hero.video_url} />
    </section>
  );
};

const ScaleIcon = ({ size, color, strokeWidth }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

export default Hero;