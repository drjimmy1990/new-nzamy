import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { scanContract } from '../../services/n8nClient';
import { supabase } from '../../services/supabaseClient';
import {
    Upload, FileText, AlertTriangle, CheckCircle, Shield,
    Loader, Eye, ChevronDown, ChevronUp, Trash2, Search, Clock, File
} from 'lucide-react';

interface UploadedFile {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
    scanType?: string;
    status: 'uploaded' | 'scanning' | 'scanned' | 'error';
    result?: ScanResult;
    error?: string;
}

interface ScanResult {
    redFlags: { clause: string; risk: string; explanation: string }[];
    compliantClauses: { clause: string; note: string }[];
    summary: string;
}

const ContractScannerWidget: React.FC = () => {
    const { profile } = useAuth();
    const { isRTL } = useLanguage();
    const t = (ar: string, en: string) => isRTL ? ar : en;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [expandedFile, setExpandedFile] = useState<string | null>(null);

    // Load previously uploaded contracts from storage on mount
    useEffect(() => {
        if (!profile?.id) return;
        loadUploadedFiles();
    }, [profile?.id]);

    const loadUploadedFiles = async () => {
        if (!profile?.id) return;
        const { data } = await supabase.storage
            .from('documents')
            .list(`contracts/${profile.id}`, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });

        if (data && data.length > 0) {
            const existing = data.map(f => {
                const { data: urlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(`contracts/${profile!.id}/${f.name}`);
                return {
                    id: f.id || f.name,
                    name: f.name,
                    url: urlData.publicUrl,
                    uploadedAt: f.created_at || new Date().toISOString(),
                    status: 'uploaded' as const,
                };
            });
            setFiles(prev => {
                // Merge: keep scanned results from current session, add new from storage
                const scannedIds = new Set(prev.filter(p => p.status !== 'uploaded').map(p => p.name));
                const merged = [...prev.filter(p => p.status !== 'uploaded'), ...existing.filter(e => !scannedIds.has(e.name))];
                return merged;
            });
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile?.id) return;

        setUploading(true);

        const filePath = `contracts/${profile.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            setUploading(false);
            alert(t('فشل رفع الملف: ' + uploadError.message, 'Upload failed: ' + uploadError.message));
            return;
        }

        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        const newFile: UploadedFile = {
            id: filePath,
            name: file.name,
            url: urlData.publicUrl,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
        };

        setFiles(prev => [newFile, ...prev]);
        setUploading(false);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleScan = async (fileId: string, scanType: 'full' | 'quick' | 'red_flags_only') => {
        setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, status: 'scanning' as const, scanType, error: undefined } : f
        ));

        const file = files.find(f => f.id === fileId);
        if (!file) return;

        const result = await scanContract(file.url, scanType, {
            country: profile?.country_id || 'SA',
        });

        if (result.success && result.data) {
            setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, status: 'scanned' as const, result: result.data as ScanResult } : f
            ));
            setExpandedFile(fileId);
        } else {
            setFiles(prev => prev.map(f =>
                f.id === fileId ? {
                    ...f,
                    status: 'error' as const,
                    error: result.error || t('فشل التحليل — تأكد من إعداد n8n', 'Analysis failed — make sure n8n is configured'),
                } : f
            ));
        }
    };

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!profile?.id) return;
        await supabase.storage.from('documents').remove([fileId]);
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const riskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            });
        } catch { return iso; }
    };

    const statusBadge = (f: UploadedFile) => {
        switch (f.status) {
            case 'uploaded':
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold flex items-center gap-1"><Clock size={10} />{t('بانتظار الفحص', 'Pending')}</span>;
            case 'scanning':
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-1"><Loader size={10} className="animate-spin" />{t('جاري الفحص...', 'Scanning...')}</span>;
            case 'scanned':
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold flex items-center gap-1"><CheckCircle size={10} />{t('تم الفحص', 'Scanned')}</span>;
            case 'error':
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold flex items-center gap-1"><AlertTriangle size={10} />{t('خطأ', 'Error')}</span>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Header + Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                    <Shield className="text-[#C8A762]" size={20} />
                    {t('فاحص العقود الذكي', 'Smart Contract Scanner')}
                </h3>

                {/* Upload Zone */}
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-[#C8A762] transition"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleUpload}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader className="animate-spin text-[#C8A762]" size={28} />
                            <p className="text-sm text-gray-500">{t('جاري رفع الملف...', 'Uploading...')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <Upload className="text-gray-400" size={28} />
                            <p className="text-sm font-bold text-gray-700 dark:text-white">
                                {t('ارفع عقدك هنا', 'Upload your contract here')}
                            </p>
                            <p className="text-xs text-gray-400">PDF, DOC, DOCX</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Files List */}
            {files.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                            <FileText size={16} className="text-[#C8A762]" />
                            {t('العقود المرفوعة', 'Uploaded Contracts')} ({files.length})
                        </h4>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {files.map(file => (
                            <div key={file.id}>
                                {/* File Row */}
                                <div className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <div className="w-9 h-9 rounded-lg bg-[#C8A762]/10 flex items-center justify-center flex-shrink-0">
                                        <File className="text-[#C8A762]" size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{file.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-gray-400">{formatDate(file.uploadedAt)}</span>
                                            {statusBadge(file)}
                                        </div>
                                        {file.error && (
                                            <p className="text-[11px] text-red-500 mt-1">⚡ {file.error}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* View button */}
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            title={t('عرض', 'View')}
                                        >
                                            <Eye size={14} />
                                        </a>

                                        {/* Scan buttons — only show if not already scanned */}
                                        {file.status !== 'scanning' && (
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    onClick={() => handleScan(file.id, 'full')}
                                                    className="px-2 py-1 text-[10px] font-bold rounded bg-[#0B3D2E] text-white hover:bg-[#0B3D2E]/90 transition"
                                                    title={t('فحص كامل', 'Full Scan')}
                                                >
                                                    {t('فحص', 'Scan')}
                                                </button>
                                                <button
                                                    onClick={() => handleScan(file.id, 'red_flags_only')}
                                                    className="px-2 py-1 text-[10px] font-bold rounded bg-red-600 text-white hover:bg-red-700 transition"
                                                    title={t('مخاطر فقط', 'Red Flags Only')}
                                                >
                                                    ⚠️
                                                </button>
                                            </div>
                                        )}

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(file.id, file.name)}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        {/* Expand results */}
                                        {file.result && (
                                            <button
                                                onClick={() => setExpandedFile(expandedFile === file.id ? null : file.id)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                {expandedFile === file.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Results */}
                                {file.result && expandedFile === file.id && (
                                    <div className="px-4 pb-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                                        {/* Summary */}
                                        <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <h5 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">{t('الملخص', 'Summary')}</h5>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{file.result.summary}</p>
                                        </div>

                                        {/* Red Flags */}
                                        {file.result.redFlags.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                                                    <AlertTriangle size={12} /> {t('مخاطر', 'Red Flags')} ({file.result.redFlags.length})
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {file.result.redFlags.map((flag, i) => (
                                                        <div key={i} className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${riskColor(flag.risk)}`}>{flag.risk.toUpperCase()}</span>
                                                            <p className="text-xs font-semibold text-gray-800 dark:text-white mt-1">{flag.clause}</p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5">{flag.explanation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Compliant */}
                                        {file.result.compliantClauses.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                                                    <CheckCircle size={12} /> {t('بنود متوافقة', 'Compliant')} ({file.result.compliantClauses.length})
                                                </h5>
                                                <div className="space-y-1.5">
                                                    {file.result.compliantClauses.map((c, i) => (
                                                        <div key={i} className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                                            <p className="text-xs font-semibold text-gray-800 dark:text-white">{c.clause}</p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5">{c.note}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {files.length === 0 && !uploading && (
                <div className="text-center py-6 text-gray-400 text-sm">
                    <FileText className="mx-auto mb-2" size={32} />
                    {t('لم يتم رفع أي عقود بعد', 'No contracts uploaded yet')}
                </div>
            )}
        </div>
    );
};

export default ContractScannerWidget;
