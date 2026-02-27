import * as React from 'react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
    id: string;
    title: string;
    date: string;  // ISO string
    type: string;
}

interface CalendarWidgetProps {
    events: CalendarEvent[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events }) => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1));

    const monthName = currentMonth.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' });

    const getEventsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date.startsWith(dateStr));
    };

    const today = new Date();
    const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft size={18} /></button>
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <CalendarIcon size={16} className="text-[#C8A762]" />
                    {monthName}
                </h3>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={18} /></button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {(isRTL ? ['س', 'ج', 'خ', 'أ', 'ث', 'إ', 'ح'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-bold py-1">{d}</div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    return (
                        <div
                            key={day}
                            className={`text-center py-1.5 rounded-lg text-sm relative cursor-pointer transition
                                ${isToday(day) ? 'bg-[#C8A762] text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                            `}
                        >
                            {day}
                            {dayEvents.length > 0 && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Upcoming events */}
            {events.length > 0 && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">{t('المواعيد القادمة', 'Upcoming')}</h4>
                    {events.slice(0, 3).map(e => (
                        <div key={e.id} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-[#C8A762] rounded-full flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">{e.title}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">
                                {new Date(e.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CalendarWidget;
