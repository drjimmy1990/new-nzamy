import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { CommunityQuestion, CommunityAnswer } from '../types/database';

// Fetch community questions for a country
export function useQuestions(countryId: string | undefined, category?: string) {
    const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!countryId) { setLoading(false); return; }
        setLoading(true);
        let query = supabase
            .from('community_questions')
            .select('*, author:profiles(*)')
            .eq('country_id', countryId)
            .order('created_at', { ascending: false });

        if (category) query = query.eq('category', category);

        const { data } = await query;
        setQuestions((data as CommunityQuestion[]) || []);
        setLoading(false);
    }, [countryId, category]);

    useEffect(() => { fetch(); }, [fetch]);
    return { questions, loading, refetch: fetch };
}

// Fetch a single question + its answers
export function useQuestionDetail(questionId: string | undefined) {
    const [question, setQuestion] = useState<CommunityQuestion | null>(null);
    const [answers, setAnswers] = useState<CommunityAnswer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!questionId) { setLoading(false); return; }
        setLoading(true);

        const [qRes, aRes] = await Promise.all([
            supabase.from('community_questions').select('*, author:profiles(*)').eq('id', questionId).single(),
            supabase.from('community_answers').select('*, provider:profiles(*)').eq('question_id', questionId).order('upvotes', { ascending: false }),
        ]);

        setQuestion(qRes.data as CommunityQuestion | null);
        setAnswers((aRes.data as CommunityAnswer[]) || []);
        setLoading(false);
    }, [questionId]);

    useEffect(() => { fetch(); }, [fetch]);
    return { question, answers, loading, refetch: fetch };
}

// Ask a question
export function useAskQuestion() {
    const ask = async (data: { country_id: string; author_id: string | null; title: string; content: string; category?: string }) => {
        const { data: question, error } = await supabase
            .from('community_questions')
            .insert(data)
            .select()
            .single();
        return { question, error };
    };
    return { ask };
}

// Submit an answer
export function useSubmitAnswer() {
    const submit = async (questionId: string, providerId: string, content: string) => {
        const { data: answer, error } = await supabase
            .from('community_answers')
            .insert({ question_id: questionId, provider_id: providerId, content })
            .select()
            .single();
        return { answer, error };
    };
    return { submit };
}

// Upvote an answer
export function useUpvoteAnswer() {
    const upvote = async (answerId: string) => {
        const { error } = await supabase.rpc('upvote_answer', { answer_id: answerId });
        if (error) {
            // Fallback: direct increment if RPC doesn't exist yet
            const { data: current } = await supabase.from('community_answers').select('upvotes').eq('id', answerId).single();
            if (current) {
                await supabase.from('community_answers').update({ upvotes: (current.upvotes || 0) + 1 }).eq('id', answerId);
            }
        }
        return { error };
    };
    return { upvote };
}
