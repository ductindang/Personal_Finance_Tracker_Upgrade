import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
    const auth = useAuth();
    const user = auth?.user;
    
    // Key theo từng user: ví dụ 'aura_currency_user1@gmail.com'
    const storageKey = user?.email ? `aura_currency_${user.email}` : 'aura_currency_guest';

    const [currency, setCurrencyState] = useState(() => {
        return localStorage.getItem(storageKey) || '$';
    });

    // Khi đổi tài khoản đăng nhập (user thay đổi), tự động tải lại tiền tệ của tài khoản đó
    useEffect(() => {
        const savedCurrency = localStorage.getItem(storageKey) || '$';
        setCurrencyState(savedCurrency);
    }, [storageKey]);

    const setCurrency = (val) => {
        setCurrencyState(val);
        localStorage.setItem(storageKey, val);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
    return ctx;
}