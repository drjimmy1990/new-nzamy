import * as React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import DashboardSidebar from './DashboardSidebar';
import { Menu, X, LogOut, Globe, Moon, Sun } from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const { profile, signOut, user } = useAuth();
    const { isRTL, language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [dark, setDark] = React.useState(document.documentElement.classList.contains('dark'));

    const t = (ar: string, en: string) => isRTL ? ar : en;

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (e) {
            console.error('Sign out error:', e);
        }
        navigate('/');
        window.location.reload();
    };

    const toggleDark = () => {
        document.documentElement.classList.toggle('dark');
        setDark(!dark);
    };

    const roleLabel = (): string => {
        if (profile?.account_cat === 'provider' && profile.p_type) {
            const labels: Record<string, [string, string]> = {
                law_firm: ['شركة محاماة', 'Law Firm'],
                independent_lawyer: ['محامي مستقل', 'Lawyer'],
                trainee_lawyer: ['متدرب', 'Trainee'],
                notary: ['موثق', 'Notary'],
                marriage_official: ['مأذون', 'Marriage Official'],
                arbitrator: ['محكم', 'Arbitrator'],
            };
            return isRTL ? labels[profile.p_type]?.[0] || '' : labels[profile.p_type]?.[1] || '';
        }
        if (profile?.account_cat === 'seeker' && profile.s_type) {
            const labels: Record<string, [string, string]> = {
                individual: ['فرد', 'Individual'],
                company: ['شركة', 'Company'],
                government: ['حكومي', 'Government'],
                ngo: ['جمعية', 'NGO'],
            };
            return isRTL ? labels[profile.s_type]?.[0] || '' : labels[profile.s_type]?.[1] || '';
        }
        return isRTL ? 'مستخدم' : 'User';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <DashboardSidebar onClose={() => setSidebarOpen(false)} />
            </aside>

            {/* Sidebar - Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} w-64 z-50`}>
                        <DashboardSidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
                {/* Topbar */}
                <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                            <div>
                                <h2 className="font-bold text-gray-800 dark:text-white text-sm">
                                    {t('مرحباً', 'Welcome')}, {profile?.full_name || user?.email}
                                </h2>
                                <span className="text-xs text-[#C8A762] font-semibold">{roleLabel()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="Toggle Language">
                                <Globe size={18} />
                            </button>
                            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="Toggle Theme">
                                {dark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title={t('خروج', 'Sign Out')}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
