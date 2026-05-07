'use client';

import { useTheme } from "@/components/providers/ThemeProvider";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost text-base-content">
                Tema
                <svg
                    width="12px"
                    height="12px"
                    className="inline-block h-2 w-2 fill-current opacity-60"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 2048 2048">
                    <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl">

                <li>
                    <input
                        type="radio"
                        name="theme-dropdown"
                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start text-base-content"
                        aria-label="Por defecto"
                        value="default"
                        checked={theme === 'default'}
                        onChange={() => setTheme('default')} />
                </li>

                <li>
                    <div className="m-2">
                        <hr className="hr hr-primary m-auto w-25 text-base-content" />
                    </div>
                </li>

                <li>
                    <input
                        type="radio"
                        name="theme-dropdown"
                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start text-base-content"
                        aria-label="Oscuro"
                        value="dark"
                        checked={theme === 'dark'}
                        onChange={() => setTheme('dark')} />
                </li>
                <li>
                    <input
                        type="radio"
                        name="theme-dropdown"
                        className="theme-controller btn btn-sm btn-block btn-ghost justify-start text-base-content"
                        aria-label="Claro"
                        value="bumblebee"
                        checked={theme === 'bumblebee'}
                        onChange={() => setTheme('bumblebee')} />
                </li>
            </ul>
        </div>
    );
}
