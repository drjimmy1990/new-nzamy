import React from 'react';
import { motion } from 'framer-motion';
import { COLORS, getIcon } from '../utils/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useFeatures, useSiteSettings } from '../hooks/useContent';

const Features: React.FC = () => {
  const { t, language } = useLanguage();
  const { selectedCountry } = useCountry();
  const { features, loading } = useFeatures(selectedCountry?.id);
  const { get } = useSiteSettings(selectedCountry?.id);

  if (loading || features.length === 0) return null;

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0B3D2E] dark:text-white transition-colors">
            {get('features_title', language)}
          </h2>
          <div className="w-24 h-1 mx-auto" style={{ backgroundColor: COLORS.accent }}></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="p-8 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300 text-center group h-full flex flex-col items-center"
            >
              <div className="mb-6 flex justify-center transform group-hover:scale-110 transition duration-300">
                <div style={{ color: COLORS.accent }}>
                  {getIcon(feature.icon, "w-10 h-10")}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#0B3D2E] dark:text-gray-100 transition-colors">
                {t(feature.title_ar, feature.title_en)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors flex-grow">
                {t(feature.description_ar, feature.description_en)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;