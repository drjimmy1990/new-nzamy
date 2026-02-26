import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useContact } from '../hooks/useContent';
import { COLORS } from '../utils/icons';

const Contact: React.FC = () => {
    const { t, language, isRTL } = useLanguage();
    const { selectedCountry } = useCountry();
    const { submitContact, loading, error, success } = useContact();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service_type: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitContact({
            ...formData,
            country_id: selectedCountry?.id || null
        });
    };

    if (success) {
        return (
            <div className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md mx-4">
                    <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                    <h2 className="text-2xl font-bold mb-2 text-[#0B3D2E] dark:text-white">
                        {isRTL ? 'تم الإرسال بنجاح' : 'Message Sent Successfully'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {isRTL
                            ? 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.'
                            : 'Thank you for contacting us. We will get back to you as soon as possible.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#0B3D2E] text-white rounded-lg font-bold hover:bg-[#0B3D2E]/90 transition"
                    >
                        {isRTL ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 text-[#0B3D2E] dark:text-white">
                        {isRTL ? 'تواصل معنا' : 'Contact Us'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {isRTL
                            ? 'نحن هنا لمساعدتك في جميع استفساراتك القانونية'
                            : 'We are here to assist you with all your legal inquiries'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="bg-[#0B3D2E] text-white p-8 rounded-xl lg:col-span-1 h-fit">
                        <h3 className="text-2xl font-bold mb-8">{isRTL ? 'بيانات التواصل' : 'Contact Information'}</h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 opacity-80">{isRTL ? 'الهاتف' : 'Phone'}</h4>
                                    <p dir="ltr">+966 50 000 0000</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 opacity-80">{isRTL ? 'البريد الإلكتروني' : 'Email'}</h4>
                                    <p>info@nizami-law.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 opacity-80">{isRTL ? 'العنوان' : 'Address'}</h4>
                                    <p>{isRTL ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'الاسم الكامل' : 'Full Name'}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {isRTL ? 'نوع الخدمة' : 'Service Type'}
                                    </label>
                                    <select
                                        name="service_type"
                                        value={formData.service_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]"
                                    >
                                        <option value="">{isRTL ? 'اختر نوع الخدمة' : 'Select Service'}</option>
                                        <option value="consultation">{isRTL ? 'استشارة قانونية' : 'Legal Consultation'}</option>
                                        <option value="representation">{isRTL ? 'تمثيل قضائي' : 'Legal Representation'}</option>
                                        <option value="companies">{isRTL ? 'خدمات شركات' : 'Corporate Services'}</option>
                                        <option value="other">{isRTL ? 'أخرى' : 'Other'}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    {isRTL ? 'الرسالة' : 'Message'}
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]"
                                ></textarea>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-[#0B3D2E] text-white font-bold rounded-lg hover:bg-[#0B3D2E]/90 transition shadow-lg shadow-[#0B3D2E]/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span>{isRTL ? 'جاري الإرسال...' : 'Sending...'}</span>
                                    ) : (
                                        <>
                                            <span>{isRTL ? 'إرسال الرسالة' : 'Send Message'}</span>
                                            {isRTL ? <Send size={18} className="transform rotate-180" /> : <Send size={18} />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
