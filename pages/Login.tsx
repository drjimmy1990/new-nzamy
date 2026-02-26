import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, Mail, Loader } from 'lucide-react';

const Login: React.FC = () => {
    const { signIn } = useAuth();
    const { isRTL } = useLanguage();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(email, password);
            navigate('/admin'); // Redirect to admin or home
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 flex justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-[#0B3D2E] dark:text-white mb-2">
                        {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isRTL ? 'مرحباً بعودتك! يرجى إدخال بياناتك' : 'Welcome back! Please enter your details'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]`}
                                dir="ltr"
                            />
                            <Mail className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'كلمة المرور' : 'Password'}
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C8A762]`}
                                dir="ltr"
                            />
                            <Lock className={`absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} text-gray-400`} size={20} />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#0B3D2E] text-white font-bold rounded-lg hover:bg-[#0B3D2E]/90 transition shadow-lg shadow-[#0B3D2E]/20 flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : (isRTL ? 'دخول' : 'Sign In')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
