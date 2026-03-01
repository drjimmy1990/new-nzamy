import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    LayoutDashboard, MessageSquare, Search, FileText, Kanban,
    BarChart3, Users, Shield, MapPin, Calendar, BookOpen,
    Award, Inbox, PenTool, GraduationCap, Gavel,
    Building2, Lock, DollarSign, X, Scale
} from 'lucide-react';

interface MenuItem {
    tab: string;
    icon: React.ElementType;
    label_ar: string;
    label_en: string;
}

const MENUS: Record<string, MenuItem[]> = {
    // ── Seeker Dashboards ──
    individual: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'chat', icon: MessageSquare, label_ar: 'المستشار الذكي', label_en: 'AI Chat' },
        { tab: 'browse', icon: Search, label_ar: 'تصفح المحامين', label_en: 'Browse Lawyers' },
        { tab: 'cases', icon: FileText, label_ar: 'قضاياي', label_en: 'My Cases' },
        { tab: 'wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    company: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'scanner', icon: Shield, label_ar: 'فحص العقود', label_en: 'Contract Scanner' },
        { tab: 'board', icon: Kanban, label_ar: 'لوحة المهام', label_en: 'Task Board' },
        { tab: 'risk', icon: BarChart3, label_ar: 'المخاطر', label_en: 'Risk Dashboard' },
        { tab: 'team', icon: Users, label_ar: 'الفريق', label_en: 'Team' },
        { tab: 'wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    government: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'compliance', icon: Shield, label_ar: 'الامتثال', label_en: 'Compliance' },
        { tab: 'cases', icon: FileText, label_ar: 'القضايا', label_en: 'Cases' },
        { tab: 'reports', icon: BarChart3, label_ar: 'التقارير', label_en: 'Reports' },
    ],
    ngo: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'compliance', icon: Shield, label_ar: 'الامتثال', label_en: 'Compliance' },
        { tab: 'board', icon: Users, label_ar: 'مجلس الإدارة', label_en: 'Board Portal' },
        { tab: 'grants', icon: DollarSign, label_ar: 'المنح', label_en: 'Grants' },
    ],

    // ── Provider Dashboards ──
    law_firm: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'inbox', icon: Inbox, label_ar: 'الطلبات', label_en: 'Order Inbox' },
        { tab: 'workflow', icon: Kanban, label_ar: 'سير العمل', label_en: 'Workflow' },
        { tab: 'team', icon: Users, label_ar: 'الفريق', label_en: 'Team' },
        { tab: 'analytics', icon: BarChart3, label_ar: 'التحليلات', label_en: 'Analytics' },
        { tab: 'community', icon: MessageSquare, label_ar: 'المجتمع', label_en: 'Community' },
        { tab: 'wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    independent_lawyer: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'inbox', icon: Inbox, label_ar: 'الطلبات', label_en: 'Order Inbox' },
        { tab: 'board', icon: Kanban, label_ar: 'لوحة المهام', label_en: 'Kanban Board' },
        { tab: 'calendar', icon: Calendar, label_ar: 'التقويم', label_en: 'Calendar' },
        { tab: 'templates', icon: FileText, label_ar: 'القوالب', label_en: 'Templates' },
        { tab: 'community', icon: MessageSquare, label_ar: 'المجتمع', label_en: 'Community' },
        { tab: 'wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    trainee_lawyer: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'tasks', icon: Inbox, label_ar: 'المهام', label_en: 'Task Inbox' },
        { tab: 'drafting', icon: PenTool, label_ar: 'الصياغة', label_en: 'Drafting Zone' },
        { tab: 'academy', icon: GraduationCap, label_ar: 'الأكاديمية', label_en: 'Academy' },
        { tab: 'performance', icon: Award, label_ar: 'الأداء', label_en: 'Performance' },
    ],
    notary: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'radar', icon: MapPin, label_ar: 'الرادار', label_en: 'Live Radar' },
        { tab: 'queue', icon: Inbox, label_ar: 'الطابور', label_en: 'Queue' },
        { tab: 'templates', icon: FileText, label_ar: 'القوالب', label_en: 'Templates' },
        { tab: 'archive', icon: BookOpen, label_ar: 'الأرشيف', label_en: 'Archive' },
        { tab: 'wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    marriage_official: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'dossier', icon: FileText, label_ar: 'الملف الرقمي', label_en: 'Digital Dossier' },
        { tab: 'ceremony', icon: Award, label_ar: 'وضع المراسم', label_en: 'Ceremony Mode' },
        { tab: 'calendar', icon: Calendar, label_ar: 'التقويم', label_en: 'Calendar' },
        { tab: 'archive', icon: BookOpen, label_ar: 'الأرشيف', label_en: 'Archive' },
    ],
    arbitrator: [
        { tab: '', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { tab: 'tribunal', icon: Gavel, label_ar: 'المحكمة', label_en: 'Virtual Tribunal' },
        { tab: 'evidence', icon: Lock, label_ar: 'الأدلة', label_en: 'Evidence Room' },
        { tab: 'rulings', icon: PenTool, label_ar: 'الأحكام', label_en: 'Rulings Drafter' },
        { tab: 'escrow', icon: DollarSign, label_ar: 'الضمان', label_en: 'Escrow' },
        { tab: 'archive', icon: BookOpen, label_ar: 'الأرشيف', label_en: 'Archive' },
    ],
};

interface DashboardSidebarProps {
    onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onClose }) => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const [searchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || '';

    const getMenuKey = (): string => {
        if (profile?.account_cat === 'provider' && profile.p_type) return profile.p_type;
        if (profile?.account_cat === 'seeker' && profile.s_type) return profile.s_type;
        return 'individual';
    };

    const getBasePath = (): string => {
        if (profile?.account_cat === 'provider' && profile.p_type) return `/dashboard/provider/${profile.p_type}`;
        if (profile?.account_cat === 'seeker' && profile.s_type) return `/dashboard/seeker/${profile.s_type}`;
        return '/dashboard/seeker/individual';
    };

    const menuItems = MENUS[getMenuKey()] || MENUS.individual;
    const basePath = getBasePath();

    return (
        <div className="flex flex-col h-full bg-[#0B3D2E] text-white">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Scale className="text-[#C8A762]" size={24} />
                    <span className="font-bold text-lg">Nzamy</span>
                </div>
                <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-white/10">
                    <X size={18} />
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const to = item.tab ? `${basePath}?tab=${item.tab}` : basePath;
                    const isActive = currentTab === item.tab;
                    return (
                        <Link
                            key={item.tab || 'home'}
                            to={to}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-[#C8A762] text-[#0B3D2E]'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <Icon size={18} />
                            <span>{isRTL ? item.label_ar : item.label_en}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-xs text-white/40 text-center">
                Nzamy Platform v2.0
            </div>
        </div>
    );
};

export default DashboardSidebar;
