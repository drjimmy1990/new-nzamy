import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useFAQ } from '../hooks/useContent';
import { COLORS } from '../utils/icons';

const FAQ: React.FC = () => {
    const { t, language, isRTL } = useLanguage();
    const { selectedCountry } = useCountry();
    const { faqs, loading } = useFAQ(selectedCountry?.id);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <div className="inline-block p-4 bg-[#C8A762]/10 rounded-full mb-6">
                        <HelpCircle size={48} color={COLORS.accent} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 text-[#0B3D2E] dark:text-white">
                        {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {isRTL
                            ? 'إجابات على الأسئلة الأكثر شيوعاً حول خدماتنا وإجراءاتنا القانونية'
                            : 'Answers to the most common questions about our services and legal procedures'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.accent }}></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={faq.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-start hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                                >
                                    <span className="font-bold text-lg text-[#0B3D2E] dark:text-white">
                                        {t(faq.question_ar, faq.question_en)}
                                    </span>
                                    <span className={`p-2 rounded-full ${openIndex === idx ? 'bg-[#C8A762] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                        {openIndex === idx ? <Minus size={16} /> : <Plus size={16} />}
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {openIndex === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="p-6 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 mt-2">
                                                {t(faq.answer_ar, faq.answer_en)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FAQ;
