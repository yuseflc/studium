/* Archivo: src\components\providers\ThemeProvider.tsx
    Descripción: Proveedor que gestiona el tema (claro/oscuro) y proporciona contexto a la UI. */

"use client";
// Provider de tema que expone `useTheme` para cambiar el tema de la UI
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
    const [theme, setThemeState] = useState<Theme>('bumblebee');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const resolvedTheme = savedTheme && savedTheme !== 'default'
            ? savedTheme
            : prefersDark
                ? 'dark'
                : 'bumblebee';
        
        setThemeState(resolvedTheme);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
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
