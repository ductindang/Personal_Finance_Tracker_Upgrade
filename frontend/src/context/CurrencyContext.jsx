import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
    const [currency, setCurrencyState] = useState(() => {
        return localStorage.getItem('aura_currency') || '$';
    });

    // Lắng nghe event storage để đồng bộ giữa các tab
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'aura_currency' && e.newValue) {
                setCurrencyState(e.newValue);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const setCurrency = (val) => {
        setCurrencyState(val);
        localStorage.setItem('aura_currency', val);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

// Custom hook để sử dụng trong các component
export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
    return ctx;
}
