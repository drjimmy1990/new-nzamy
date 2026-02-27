import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { DocumentRecord } from '../types/database';

// Fetch documents for a service request
export function useDocuments(requestId: string | undefined) {
    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!requestId) { setLoading(false); return; }
        setLoading(true);
        const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('request_id', requestId)
            .order('created_at', { ascending: false });
        setDocuments((data as DocumentRecord[]) || []);
        setLoading(false);
    }, [requestId]);

    useEffect(() => { fetch(); }, [fetch]);
    return { documents, loading, refetch: fetch };
}

// Upload a document
export function useUploadDocument() {
    const [uploading, setUploading] = useState(false);

    const upload = async (requestId: string, uploadedBy: string, file: File, documentType: string) => {
        setUploading(true);

        // Upload file to Supabase Storage
        const filePath = `documents/${requestId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            setUploading(false);
            return { error: uploadError };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        // Insert document record
        const { data, error } = await supabase
            .from('documents')
            .insert({
                request_id: requestId,
                uploaded_by: uploadedBy,
                document_type: documentType,
                file_url: urlData.publicUrl,
            })
            .select()
            .single();

        setUploading(false);
        return { data, error };
    };

    return { upload, uploading };
}
