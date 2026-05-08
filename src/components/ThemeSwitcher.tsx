'use client';
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
