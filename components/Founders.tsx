import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { COLORS } from '../utils/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useTeam, useSiteSettings } from '../hooks/useContent';

const Founders: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const { selectedCountry } = useCountry();
  const { members, loading } = useTeam(selectedCountry?.id);
  const { get } = useSiteSettings(selectedCountry?.id);

  if (loading || members.length === 0) return null;

  return (
    <section id="founders" className="py-20 bg-[#F8F9FA] dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-[#0B3D2E] dark:text-white transition-colors"
          >
            {get('founders_title', language)}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-600 dark:text-gray-400"
          >
            {get('founders_subtitle', language)}
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-10">
          {members.map((member, index) => (
            <Link
              to={`/team/${member.slug}`}
              key={member.id}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg dark:shadow-gray-900/50 max-w-sm w-full group transition-colors duration-300 cursor-pointer h-full"
              >
                <div className="h-80 overflow-hidden relative">
                  <img
                    src={member.image || ''}
                    alt={t(member.name_ar, member.name_en)}
                    className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-105 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D2E]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition duration-500 ease-out">
                    <p className="text-white text-sm leading-relaxed border-l-2 border-[#C8A762] pl-3">
                      {isRTL ? 'اضغط للمزيد من التفاصيل' : 'Click for more details'}
                    </p>
                  </div>
                </div>
                <div className="p-8 text-center relative bg-white dark:bg-gray-800 z-10 transition-colors group-hover:bg-gray-50 dark:group-hover:bg-gray-750">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-[#C8A762] transition-all group-hover:w-24"></div>
                  <h3 className="text-xl font-bold mb-1 text-[#0B3D2E] dark:text-white transition-colors">
                    {t(member.name_ar, member.name_en)}
                  </h3>
                  <p className="font-medium text-sm mb-4 uppercase tracking-wider text-[#C8A762]">
                    {t(member.title_ar, member.title_en)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed md:hidden">
                    {t(member.description_ar, member.description_en)}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Founders;