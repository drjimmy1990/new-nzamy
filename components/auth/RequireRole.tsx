import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { AccountCategory, SeekerType, ProviderType } from '../../types/database';

interface RequireRoleProps {
    /** Allowed account categories (seeker, provider, admin) */
    allowedCats?: AccountCategory[];
    /** Allowed sub-types (individual, company, law_firm, etc.) */
    allowedTypes?: (SeekerType | ProviderType)[];
    /** Children to render if authorized */
    children: React.ReactNode;
}

/**
 * Route guard that checks if the user's profile matches the allowed roles.
 * If not, redirects to the user's correct dashboard path.
 *
 * Usage in App.tsx:
 * ```tsx
 * <RequireRole allowedCats={['seeker']} allowedTypes={['company']}>
 *   <CompanyDashboard />
 * </RequireRole>
 * ```
 */
const RequireRole: React.FC<RequireRoleProps> = ({ allowedCats, allowedTypes, children }) => {
    const { profile, isLoading, getDashboardPath } = useAuth();

    // Still loading — show nothing (RequireAuth handles the spinner)
    if (isLoading) return null;

    // No profile loaded yet — shouldn't happen if RequireAuth is wrapping this
    if (!profile) {
        return <Navigate to="/login" replace />;
    }

    // Check account category
    if (allowedCats && allowedCats.length > 0) {
        if (!profile.account_cat || !allowedCats.includes(profile.account_cat)) {
            // Redirect to the user's correct dashboard
            return <Navigate to={getDashboardPath()} replace />;
        }
    }

    // Check sub-type (s_type for seekers, p_type for providers)
    if (allowedTypes && allowedTypes.length > 0) {
        const userType = profile.account_cat === 'seeker' ? profile.s_type : profile.p_type;
        if (!userType || !allowedTypes.includes(userType as SeekerType | ProviderType)) {
            return <Navigate to={getDashboardPath()} replace />;
        }
    }

    return <>{children}</>;
};

export default RequireRole;
