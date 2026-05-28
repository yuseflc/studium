'use client';

import { useTheme } from "@/components/providers/ThemeProvider";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Logo() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Evitar errores de hidratación asegurándonos de que el componente esté montado
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Placeholder con dimensiones similares para evitar layout shift
        return <div className="h-5 w-32" />;
    }

    // El logo "dark" (letras oscuras) se usa en el tema claro (bumblebee)
    // El logo "light" (letras blancas) se usa en el tema oscuro (dark)
    const isDarkTheme = theme === "dark";
    
    return (
        <div className="flex items-center">
            <Image
                src={isDarkTheme ? "/img/studium_light_blur.svg" : "/img/studium_dark_blur.svg"}
                alt="Studium"
                width={112}
                height={20}
                className="h-5 w-auto"
                priority
            />
        </div>
    );
}
