import React, { useState } from 'react';
import { MessageCircle, Bot, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../utils/icons';
import ChatWidget from './ChatWidget';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useSiteSettings } from '../hooks/useContent';

const FloatingActions: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isWhatsappHovered, setIsWhatsappHovered] = useState(false);
  const { language, isRTL } = useLanguage();
  const { selectedCountry } = useCountry();
  const { get } = useSiteSettings(selectedCountry?.id);

  const whatsapp1 = get('whatsapp_1', 'en');
  const whatsapp2 = get('whatsapp_2', 'en');

  return (
    <>
      {/* WhatsApp Button */}
      <div
        className={`fixed bottom-8 z-40 flex flex-col items-end ${isRTL ? 'right-8' : 'left-8'}`}
        onMouseEnter={() => setIsWhatsappHovered(true)}
        onMouseLeave={() => setIsWhatsappHovered(false)}
      >
        <AnimatePresence>
          {isWhatsappHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9, transformOrigin: isRTL ? 'bottom right' : 'bottom left' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 absolute bottom-16 ${isRTL ? 'right-0' : 'left-0'} min-w-[200px]`}
            >
              <div className="bg-[#0B3D2E] px-4 py-2 text-white text-xs font-bold text-center">
                {language === 'ar' ? 'تواصل معنا مباشرة' : 'Contact Us Directly'}
              </div>
              {whatsapp1 && (
                <a href={`https://wa.me/${whatsapp1}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700 transition group">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition">
                    <img src="/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200 dir-ltr">{whatsapp1}</span>
                </a>
              )}
              {whatsapp2 && (
                <a href={`https://wa.me/${whatsapp2}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-800 transition">
                    <img src="/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200 dir-ltr">{whatsapp2}</span>
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 0 0 rgba(37, 211, 102, 0.7)",
              "0 0 0 10px rgba(37, 211, 102, 0)",
              "0 0 0 0 rgba(37, 211, 102, 0)"
            ]
          }}
          transition={{
            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 bg-white shadow-lg overflow-hidden"
        >
          <img src="/whatsapp.png" alt="WhatsApp" className="w-full h-full object-cover" />
        </motion.button>
      </div>

      {/* AI Chat Trigger */}
      <div className={`fixed bottom-8 z-40 ${isRTL ? 'left-8' : 'right-8'}`}>
        <AnimatePresence>
          {!isChatOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsChatOpen(true)}
              className="group flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition"
              style={{ backgroundColor: COLORS.primary }}
            >
              <div className="relative">
                <Bot size={24} color={COLORS.accent} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-[#0B3D2E] rounded-full animate-pulse"></span>
              </div>
              <span className="text-white font-bold text-sm hidden sm:inline">
                {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default FloatingActions;