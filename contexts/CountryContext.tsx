import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { Country } from '../types/database';

interface CountryContextType {
    countries: Country[];
    selectedCountry: Country | null;
    setCountry: (country: Country) => void;
    loading: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

const STORAGE_KEY = 'nzamy_selected_country';

export const CountryProvider = ({ children }: { children: ReactNode }) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCountries = async () => {
            const { data, error } = await supabase
                .from('countries')
                .select('*')
                .eq('is_active', true)
                .order('display_order');

            if (error) {
                console.error('Error fetching countries:', error);
                setLoading(false);
                return;
            }

            // Filter to only SA and EG
            const filtered = (data || []).filter(c => c.code === 'SA' || c.code === 'EG');
            setCountries(filtered);

            // Restore from localStorage or default to SA
            const savedCode = localStorage.getItem(STORAGE_KEY);
            const saved = filtered.find(c => c.code === savedCode);
            const defaultCountry = filtered.find(c => c.code === 'SA') || filtered[0];
            setSelectedCountry(saved || defaultCountry || null);
            setLoading(false);
        };

        fetchCountries();
    }, []);

    const setCountry = (country: Country) => {
        setSelectedCountry(country);
        localStorage.setItem(STORAGE_KEY, country.code);
    };

    return (
        <CountryContext.Provider value={{ countries, selectedCountry, setCountry, loading }}>
            {children}
        </CountryContext.Provider>
    );
};

export const useCountry = () => {
    const context = useContext(CountryContext);
    if (!context) throw new Error('useCountry must be used within CountryProvider');
    return context;
};
