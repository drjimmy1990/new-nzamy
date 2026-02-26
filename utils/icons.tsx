import React from 'react';
import {
    ClipboardList, Users, Scale, Gavel, FileText, PenTool,
    Briefcase, ShieldCheck, FileCheck, Building2,
    Trophy, Star, Clock, Zap, Lock
} from 'lucide-react';

export const COLORS = {
    primary: '#0B3D2E',
    accent: '#C8A762',
    white: '#FFFFFF',
    bgLight: '#F8F9FA',
};

export const getIcon = (name: string, className?: string) => {
    const props = { className: className || "w-6 h-6" };
    switch (name) {
        case 'ClipboardList': return <ClipboardList {...props} />;
        case 'Users': return <Users {...props} />;
        case 'Scale': return <Scale {...props} />;
        case 'Gavel': return <Gavel {...props} />;
        case 'FileText': return <FileText {...props} />;
        case 'PenTool': return <PenTool {...props} />;
        case 'Briefcase': return <Briefcase {...props} />;
        case 'ShieldCheck': return <ShieldCheck {...props} />;
        case 'FileCheck': return <FileCheck {...props} />;
        case 'Building2': return <Building2 {...props} />;
        case 'Trophy': return <Trophy {...props} />;
        case 'Star': return <Star {...props} />;
        case 'Clock': return <Clock {...props} />;
        case 'Zap': return <Zap {...props} />;
        case 'Lock': return <Lock {...props} />;
        default: return <Scale {...props} />;
    }
};
