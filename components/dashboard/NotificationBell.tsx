import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, Check, CheckCheck, X } from 'lucide-react';

const NOTIF_TYPE_LABELS: Record<string, [string, string]> = {
    request_accepted: ['تم قبول طلبك', 'Request Accepted'],
    request_completed: ['تم إكمال طلبك', 'Request Completed'],
    new_message: ['رسالة جديدة', 'New Message'],
    document_verified: ['تم التحقق من المستند', 'Document Verified'],
    new_pool_request: ['طلب جديد متاح', 'New Pool Request'],
};

const NotificationBell: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { notifications, loading, unreadCount, markAsRead, markAllRead } = useNotifications(profile?.id);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return t('الآن', 'just now');
        if (mins < 60) return `${mins} ${t('د', 'm')}`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} ${t('س', 'h')}`;
        const days = Math.floor(hours / 24);
        return `${days} ${t('ي', 'd')}`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute top-full mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
                    {/* Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                            {t('الإشعارات', 'Notifications')}
                        </h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-[#C8A762] hover:underline flex items-center gap-1"
                            >
                                <CheckCheck size={12} />
                                {t('تعيين الكل كمقروء', 'Mark all read')}
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-72 divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                {t('جاري التحميل...', 'Loading...')}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                <Bell className="mx-auto mb-2 text-gray-300" size={24} />
                                {t('لا توجد إشعارات', 'No notifications')}
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const typeLabel = NOTIF_TYPE_LABELS[notif.type];
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => { if (!notif.read) markAsRead(notif.id); }}
                                        className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-[#C8A762]'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                                    {typeLabel ? (isRTL ? typeLabel[0] : typeLabel[1]) : notif.title}
                                                </p>
                                                {notif.body && (
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{notif.body}</p>
                                                )}
                                                <span className="text-[10px] text-gray-400 mt-1 block">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
