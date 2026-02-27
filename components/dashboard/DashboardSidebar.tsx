import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    LayoutDashboard, MessageSquare, Search, FileText, Kanban,
    BarChart3, Users, Shield, MapPin, Calendar, BookOpen,
    Award, Inbox, PenTool, GraduationCap, Gavel,
    Building2, Lock, DollarSign, X, Scale
} from 'lucide-react';

interface MenuItem {
    href: string;
    icon: React.ElementType;
    label_ar: string;
    label_en: string;
}

const MENUS: Record<string, MenuItem[]> = {
    // ── Seeker Dashboards ──
    individual: [
        { href: '/dashboard/seeker/individual', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/seeker/individual/chat', icon: MessageSquare, label_ar: 'المستشار الذكي', label_en: 'AI Chat' },
        { href: '/dashboard/seeker/individual/browse', icon: Search, label_ar: 'تصفح المحامين', label_en: 'Browse Lawyers' },
        { href: '/dashboard/seeker/individual/cases', icon: FileText, label_ar: 'قضاياي', label_en: 'My Cases' },
        { href: '/dashboard/seeker/individual/wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    company: [
        { href: '/dashboard/seeker/company', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/seeker/company/scanner', icon: Shield, label_ar: 'فحص العقود', label_en: 'Contract Scanner' },
        { href: '/dashboard/seeker/company/board', icon: Kanban, label_ar: 'لوحة المهام', label_en: 'Task Board' },
        { href: '/dashboard/seeker/company/risk', icon: BarChart3, label_ar: 'المخاطر', label_en: 'Risk Dashboard' },
        { href: '/dashboard/seeker/company/team', icon: Users, label_ar: 'الفريق', label_en: 'Team' },
        { href: '/dashboard/seeker/company/wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    government: [
        { href: '/dashboard/seeker/government', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/seeker/government/compliance', icon: Shield, label_ar: 'الامتثال', label_en: 'Compliance' },
        { href: '/dashboard/seeker/government/cases', icon: FileText, label_ar: 'القضايا', label_en: 'Cases' },
        { href: '/dashboard/seeker/government/reports', icon: BarChart3, label_ar: 'التقارير', label_en: 'Reports' },
    ],
    ngo: [
        { href: '/dashboard/seeker/ngo', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/seeker/ngo/compliance', icon: Shield, label_ar: 'الامتثال', label_en: 'Compliance' },
        { href: '/dashboard/seeker/ngo/board', icon: Users, label_ar: 'مجلس الإدارة', label_en: 'Board Portal' },
        { href: '/dashboard/seeker/ngo/grants', icon: DollarSign, label_ar: 'المنح', label_en: 'Grants' },
    ],

    // ── Provider Dashboards ──
    law_firm: [
        { href: '/dashboard/provider/law_firm', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/provider/law_firm/inbox', icon: Inbox, label_ar: 'الطلبات', label_en: 'Order Inbox' },
        { href: '/dashboard/provider/law_firm/workflow', icon: Kanban, label_ar: 'سير العمل', label_en: 'Workflow' },
        { href: '/dashboard/provider/law_firm/team', icon: Users, label_ar: 'الفريق', label_en: 'Team' },
        { href: '/dashboard/provider/law_firm/analytics', icon: BarChart3, label_ar: 'التحليلات', label_en: 'Analytics' },
        { href: '/dashboard/provider/law_firm/community', icon: MessageSquare, label_ar: 'المجتمع', label_en: 'Community' },
        { href: '/dashboard/provider/law_firm/wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    independent_lawyer: [
        { href: '/dashboard/provider/independent_lawyer', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/provider/independent_lawyer/inbox', icon: Inbox, label_ar: 'الطلبات', label_en: 'Order Inbox' },
        { href: '/dashboard/provider/independent_lawyer/board', icon: Kanban, label_ar: 'لوحة المهام', label_en: 'Kanban Board' },
        { href: '/dashboard/provider/independent_lawyer/calendar', icon: Calendar, label_ar: 'التقويم', label_en: 'Calendar' },
        { href: '/dashboard/provider/independent_lawyer/templates', icon: FileText, label_ar: 'القوالب', label_en: 'Templates' },
        { href: '/dashboard/provider/independent_lawyer/community', icon: MessageSquare, label_ar: 'المجتمع', label_en: 'Community' },
        { href: '/dashboard/provider/independent_lawyer/wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    trainee_lawyer: [
        { href: '/dashboard/provider/trainee_lawyer', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/provider/trainee_lawyer/tasks', icon: Inbox, label_ar: 'المهام', label_en: 'Task Inbox' },
        { href: '/dashboard/provider/trainee_lawyer/drafting', icon: PenTool, label_ar: 'الصياغة', label_en: 'Drafting Zone' },
        { href: '/dashboard/provider/trainee_lawyer/academy', icon: GraduationCap, label_ar: 'الأكاديمية', label_en: 'Academy' },
        { href: '/dashboard/provider/trainee_lawyer/performance', icon: Award, label_ar: 'الأداء', label_en: 'Performance' },
    ],
    notary: [
        { href: '/dashboard/provider/notary', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/provider/notary/radar', icon: MapPin, label_ar: 'الرادار', label_en: 'Live Radar' },
        { href: '/dashboard/provider/notary/queue', icon: Inbox, label_ar: 'الطابور', label_en: 'Queue' },
        { href: '/dashboard/provider/notary/templates', icon: FileText, label_ar: 'القوالب', label_en: 'Templates' },
        { href: '/dashboard/provider/notary/archive', icon: BookOpen, label_ar: 'الأرشيف', label_en: 'Archive' },
        { href: '/dashboard/provider/notary/wallet', icon: DollarSign, label_ar: 'المحفظة', label_en: 'Wallet' },
    ],
    marriage_official: [
        { href: '/dashboard/provider/marriage_official', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/provider/marriage_official/dossier', icon: FileText, label_ar: 'الملف الرقمي', label_en: 'Digital Dossier' },
        { href: '/dashboard/provider/marriage_official/ceremony', icon: Award, label_ar: 'وضع المراسم', label_en: 'Ceremony Mode' },
        { href: '/dashboard/provider/marriage_official/calendar', icon: Calendar, label_ar: 'التقويم', label_en: 'Calendar' },
        { href: '/dashboard/provider/marriage_official/archive', icon: BookOpen, label_ar: 'الأرشيف', label_en: 'Archive' },
    ],
    arbitrator: [
        { href: '/dashboard/provider/arbitrator', icon: LayoutDashboard, label_ar: 'الرئيسية', label_en: 'Dashboard' },
        { href: '/dashboard/provider/arbitrator/tribunal', icon: Gavel, label_ar: 'المحكمة', label_en: 'Virtual Tribunal' },
        { href: '/dashboard/provider/arbitrator/evidence', icon: Lock, label_ar: 'الأدلة', label_en: 'Evidence Room' },
        { href: '/dashboard/provider/arbitrator/rulings', icon: PenTool, label_ar: 'الأحكام', label_en: 'Rulings Drafter' },
        { href: '/dashboard/provider/arbitrator/escrow', icon: DollarSign, label_ar: 'الضمان', label_en: 'Escrow' },
        { href: '/dashboard/provider/arbitrator/archive', icon: BookOpen, label_ar: 'الأرشيف', label_en: 'Archive' },
    ],
};

interface DashboardSidebarProps {
    onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onClose }) => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();

    // Get the menu based on user type
    const getMenuKey = (): string => {
        if (profile?.account_cat === 'provider' && profile.p_type) return profile.p_type;
        if (profile?.account_cat === 'seeker' && profile.s_type) return profile.s_type;
        return 'individual'; // fallback
    };

    const menuItems = MENUS[getMenuKey()] || MENUS.individual;

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
                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === menuItems[0]?.href}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-[#C8A762] text-[#0B3D2E]'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'}`
                            }
                        >
                            <Icon size={18} />
                            <span>{isRTL ? item.label_ar : item.label_en}</span>
                        </NavLink>
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
