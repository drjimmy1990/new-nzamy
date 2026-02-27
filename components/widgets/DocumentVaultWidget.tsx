import * as React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DocumentRecord } from '../../types/database';
import { Upload, FileText, Eye, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

interface DocumentVaultWidgetProps {
    documents: DocumentRecord[];
    loading: boolean;
    onUpload?: (file: File, type: string) => void;
    uploading?: boolean;
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label_ar: string; label_en: string }> = {
    pending: { icon: Clock, color: 'text-amber-500', label_ar: 'قيد المراجعة', label_en: 'Pending' },
    verified: { icon: CheckCircle, color: 'text-green-500', label_ar: 'تم التحقق', label_en: 'Verified' },
    rejected: { icon: XCircle, color: 'text-red-500', label_ar: 'مرفوض', label_en: 'Rejected' },
};

const DocumentVaultWidget: React.FC<DocumentVaultWidgetProps> = ({ documents, loading, onUpload, uploading }) => {
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpload) {
            onUpload(file, file.type.includes('pdf') ? 'pdf' : 'image');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileText size={18} className="text-[#C8A762]" />
                    {t('المستندات', 'Documents')}
                </h3>
                {onUpload && (
                    <>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-1 text-sm px-3 py-1.5 bg-[#0B3D2E] text-white rounded-lg hover:bg-[#0B3D2E]/80 transition disabled:opacity-50"
                        >
                            {uploading ? <Loader className="animate-spin" size={14} /> : <Upload size={14} />}
                            {t('رفع', 'Upload')}
                        </button>
                    </>
                )}
            </div>

            {loading ? (
                <div className="p-6 animate-pulse space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
                </div>
            ) : documents.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <FileText className="mx-auto mb-2" size={32} />
                    <p className="text-sm">{t('لا توجد مستندات', 'No documents yet')}</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {documents.map((doc) => {
                        const status = STATUS_CONFIG[doc.verification_status] || STATUS_CONFIG.pending;
                        const StatusIcon = status.icon;
                        return (
                            <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <div className="flex items-center gap-3 min-w-0">
                                    <FileText size={18} className="text-gray-400 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{doc.document_type}</p>
                                        <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                                        <StatusIcon size={12} />
                                        {isRTL ? status.label_ar : status.label_en}
                                    </span>
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                                        <Eye size={14} />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DocumentVaultWidget;
