import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AccountCategory, SeekerType, ProviderType } from '../../types/database';
import { Loader, ShieldX } from 'lucide-react';

interface RequireRoleProps {
    children: React.ReactNode;
    allowedCategories?: AccountCategory[];
    allowedSeekerTypes?: SeekerType[];
    allowedProviderTypes?: ProviderType[];
}

const RequireRole: React.FC<RequireRoleProps> = ({
    children,
    allowedCategories,
    allowedSeekerTypes,
    allowedProviderTypes,
}) => {
    const { profile, isLoading } = useAuth();
    const { isRTL } = useLanguage();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader className="animate-spin text-[#C8A762]" size={40} />
            </div>
        );
    }

    if (!profile) {
        return <Navigate to="/login" replace />;
    }

    // Check category match
    if (allowedCategories && !allowedCategories.includes(profile.account_cat)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-8">
                    <ShieldX className="mx-auto text-red-400 mb-4" size={56} />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {isRTL ? 'غير مصرح' : 'Access Denied'}
                    </h2>
                    <p className="text-gray-500">
                        {isRTL ? 'ليس لديك صلاحية للوصول لهذه الصفحة' : 'You do not have permission to access this page'}
                    </p>
                </div>
            </div>
        );
    }

    // Check seeker sub-type
    if (allowedSeekerTypes && profile.s_type && !allowedSeekerTypes.includes(profile.s_type)) {
        return <Navigate to="/" replace />;
    }

    // Check provider sub-type
    if (allowedProviderTypes && profile.p_type && !allowedProviderTypes.includes(profile.p_type)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RequireRole;
