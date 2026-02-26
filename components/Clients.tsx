import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { COLORS } from '../utils/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useTestimonials, useClientLogos, useSiteSettings } from '../hooks/useContent';

const Clients: React.FC = () => {
  const { t, language } = useLanguage();
  const { selectedCountry } = useCountry();
  const { testimonials } = useTestimonials(selectedCountry?.id);
  const { logos } = useClientLogos(selectedCountry?.id);
  const { get } = useSiteSettings(selectedCountry?.id);

  // Duplicate for infinite marquee
  const marqueeLogos = logos.length > 0 ? [...logos, ...logos, ...logos] : [];

  return (
    <section id="clients" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-[#0B3D2E] dark:text-white transition-colors"
          >
            {get('clients_title', language)}
          </motion.h2>
        </div>

        {/* Infinite Marquee */}
        {marqueeLogos.length > 0 && (
          <div className="mb-20 relative w-full overflow-hidden mask-gradient">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 transition-colors duration-300"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 transition-colors duration-300"></div>
            <motion.div
              className="flex gap-16 items-center whitespace-nowrap"
              animate={{ x: [0, -1000] }}
              transition={{
                x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
              }}
            >
              {marqueeLogos.map((logo, i) => (
                <div key={`${logo.id}-${i}`} className="flex-shrink-0 group cursor-default">
                  <div className="h-24 w-40 flex items-center justify-center grayscale hover:grayscale-0 transition duration-300 opacity-70 hover:opacity-100">
                    {logo.website_url ? (
                      <a href={logo.website_url} target="_blank" rel="noopener noreferrer">
                        <img src={logo.logo_url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                      </a>
                    ) : (
                      <img src={logo.logo_url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl relative hover:-translate-y-2 transition duration-300 shadow-sm hover:shadow-xl dark:shadow-gray-900 border border-transparent hover:border-[#C8A762]/30"
              >
                <div className="absolute -top-4 right-8 bg-[#C8A762] rounded-full p-2 shadow-lg">
                  <Star size={20} fill="white" stroke="white" />
                </div>
                <div className="flex text-[#C8A762] mb-4 mt-2">
                  {[...Array(item.rating)].map((_, i) => <Star key={i} size={16} fill="#C8A762" />)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                  "{t(item.content_ar, item.content_en)}"
                </p>
                <div className="border-t pt-4 border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  {item.avatar_url && (
                    <img src={item.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <h4 className="font-bold text-lg text-[#0B3D2E] dark:text-white transition-colors">
                      {t(item.author_ar, item.author_en)}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {t(item.role_ar, item.role_en)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Clients;