import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Loader2, Sparkles } from 'lucide-react';
import { COLORS } from '../utils/icons';
import { sendMessageToGemini } from '../services/geminiService';
import type { ChatMessage } from '../types/database';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ChatWidget: React.FC<Props> = ({ isOpen, onClose }) => {
    const { language, isRTL } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatTitle = isRTL ? 'المساعد الذكي' : 'AI Assistant';
    const chatSubtitle = isRTL ? 'متصل الآن' : 'Online now';
    const chatPlaceholder = isRTL ? 'اكتب سؤالك...' : 'Type your question...';
    const chatTyping = isRTL ? 'جاري الكتابة...' : 'Typing...';
    const chatPowered = isRTL ? 'مدعوم بالذكاء الصناعي' : 'Powered by AI';
    const initialMsg = isRTL
        ? 'مرحباً! أنا المساعد الذكي لشركة نظامي للمحاماة. كيف يمكنني مساعدتك؟'
        : 'Hello! I\'m the AI assistant for Nizami Law Firm. How can I help you?';

    useEffect(() => {
        setMessages([{ id: '1', role: 'model', text: initialMsg }]);
    }, [language]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const responseText = await sendMessageToGemini(userMsg.text);
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className={`fixed bottom-24 z-50 w-[350px] max-w-[calc(100vw-32px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden transition-colors duration-300 ${isRTL ? 'left-4 sm:left-8' : 'right-4 sm:right-8'}`}
                    style={{ height: '500px', maxHeight: '70vh' }}
                >
                    <div className="p-4 flex justify-between items-center text-white" style={{ backgroundColor: COLORS.primary }}>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-full"><Bot size={20} className="text-white" /></div>
                            <div>
                                <h3 className="font-bold text-sm">{chatTitle}</h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    <span className="text-xs opacity-80">{chatSubtitle}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'rounded-br-none text-white'
                                            : 'rounded-bl-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700'
                                        }`}
                                    style={msg.role === 'user' ? { backgroundColor: COLORS.primary } : {}}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-gray-400" />
                                    <span className="text-xs text-gray-400">{chatTyping}</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={chatPlaceholder}
                                className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C8A762]/50 placeholder-gray-400 transition-colors"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-[#0B3D2E]"
                                style={{ backgroundColor: COLORS.accent }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                {chatPowered} <Sparkles size={8} />
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatWidget;