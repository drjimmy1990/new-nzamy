import React from 'react';
import { motion, Variants } from 'framer-motion';
import { COLORS, getIcon } from '../utils/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useServices, useSiteSettings } from '../hooks/useContent';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

const Services: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const { selectedCountry } = useCountry();
  const { services: personalServices } = useServices(selectedCountry?.id, 'personal');
  const { services: companyServices } = useServices(selectedCountry?.id, 'company');
  const { get } = useSiteSettings(selectedCountry?.id);

  const whatsapp = get('whatsapp_1', 'en');

  return (
    <section id="services" className="py-20 bg-[#F8F9FA] dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">

        {/* Personal Services */}
        {personalServices.length > 0 && (
          <>
            <div className="text-center mb-16" id="personal-services">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4 text-[#0B3D2E] dark:text-white transition-colors"
              >
                {get('services_personal_title', language)}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors"
              >
                {get('services_personal_subtitle', language)}
              </motion.p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
            >
              {personalServices.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-2 border-t-4 group h-full flex flex-col"
                  style={{ borderColor: COLORS.primary }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300 bg-[#0B3D2E] dark:bg-[#113127]">
                    {getIcon(service.icon, `text-white w-7 h-7`)}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-[#0B3D2E] dark:text-white transition-colors">
                    {t(service.title_ar, service.title_en)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed flex-grow transition-colors">
                    {t(service.description_ar, service.description_en)}
                  </p>
                  <div className="mt-auto pt-4">
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t(service.whatsapp_message_ar, service.whatsapp_message_en))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sm transition hover:underline flex items-center gap-1 group-hover:gap-2 text-[#C8A762]"
                    >
                      {t(service.button_text_ar, service.button_text_en)} <span>{isRTL ? '←' : '→'}</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Company Services */}
        {companyServices.length > 0 && (
          <>
            <div className="text-center mb-12" id="company-services">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-4 text-[#0B3D2E] dark:text-white transition-colors"
              >
                {get('services_company_title', language)}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors"
              >
                {get('services_company_subtitle', language)}
              </motion.p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {companyServices.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 h-full flex flex-col"
                >
                  <div className="mb-4 text-[#C8A762]">
                    {getIcon(service.icon, `w-8 h-8`)}
                  </div>
                  <h4 className="font-bold mb-2 text-[#0B3D2E] dark:text-gray-100">
                    {t(service.title_ar, service.title_en)}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 flex-grow">
                    {t(service.description_ar, service.description_en)}
                  </p>
                  <div className="mt-auto">
                    <a
                      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t(service.whatsapp_message_ar, service.whatsapp_message_en))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold border px-3 py-1 rounded hover:bg-[#0B3D2E] hover:text-white dark:hover:bg-[#C8A762] dark:hover:text-[#0B3D2E] transition text-[#0B3D2E] dark:text-[#C8A762] border-[#C8A762] inline-block"
                    >
                      {t(service.button_text_ar, service.button_text_en)}
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default Services;