import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Camera, Star, Shield, Globe, Edit3 } from 'lucide-react';

const ProfileCardWidget: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;

    if (!profile) return null;

    const providerLabels: Record<string, [string, string]> = {
        law_firm: ['شركة محاماة', 'Law Firm'],
        independent_lawyer: ['محامي مستقل', 'Lawyer'],
        trainee_lawyer: ['متدرب', 'Trainee'],
        notary: ['موثق', 'Notary'],
        marriage_official: ['مأذون', 'Marriage Official'],
        arbitrator: ['محكم', 'Arbitrator'],
    };

    const roleLabel = profile.p_type
        ? (isRTL ? providerLabels[profile.p_type]?.[0] : providerLabels[profile.p_type]?.[1]) || ''
        : '';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Cover */}
            <div className="h-20 bg-gradient-to-r from-[#0B3D2E] to-[#0B3D2E]/70 relative">
                <button className="absolute bottom-2 right-2 p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition">
                    <Camera size={14} />
                </button>
            </div>

            {/* Avatar & Info */}
            <div className="px-4 pb-4">
                <div className="-mt-8 mb-3">
                    <div className="w-16 h-16 bg-[#C8A762] rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                        ) : (
                            <User className="text-white" size={28} />
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{profile.full_name}</h3>
                        <p className="text-sm text-[#C8A762]">{roleLabel}</p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <Edit3 size={16} />
                    </button>
                </div>

                {/* Specialty */}
                {profile.specialty && (
                    <p className="text-sm text-gray-500 mt-2">{profile.specialty}</p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {profile.is_verified && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                            <Shield size={10} /> {t('موثق', 'Verified')}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
                        <Star size={10} /> {profile.visibility_score || 0} {t('نقطة', 'pts')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProfileCardWidget;
