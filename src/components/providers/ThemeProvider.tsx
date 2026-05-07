'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'default' | 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'retro';

const ThemeContext = createContext<{
    theme: Theme;
    setTheme: (theme: Theme) => void;
}>({
    theme: 'default',
    setTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>('default');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        
        if (savedTheme && savedTheme !== 'default') {
            setThemeState(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Usa la preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'bumblebee';
            setThemeState('default');
            document.documentElement.setAttribute('data-theme', systemTheme);
        }
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        
        if (newTheme === 'default') {
            localStorage.removeItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'bumblebee';
            document.documentElement.setAttribute('data-theme', systemTheme);
        } else {
            localStorage.setItem('theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
