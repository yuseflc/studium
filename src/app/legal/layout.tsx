/* Archivo: src\app\legal\layout.tsx
    Descripción: Layout compartido para las páginas legales (TOS, privacidad, etc.). */

import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'
import { Footer } from '@/components/sections/Footer'
import Navbar from '@/components/navbars/Navbar'

export default function LegalLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return <>
        <Navbar />
        {children}
    </>
}