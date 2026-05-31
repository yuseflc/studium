/* Archivo: src\components\ThemeSwitcher.tsx
    Descripción: Selector de tema (claro/oscuro) que integra con el proveedor de tema. */

"use client";
// Interruptor de tema (claro/oscuro) usado por el layout
import { useTheme } from "@/components/providers/ThemeProvider";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const toggle = () => {
        setTheme(theme === 'dark' ? 'bumblebee' : 'dark');
    };

    return (
        <div className="dropdown dropdown-end">
            <button onClick={toggle} className="btn btn-circle btn-ghost rounded-full text-base-content">
                {theme === 'dark' ? <IconMoon size={20} /> : <IconSun size={20} />}
            </button>
        </div>
    );
}
