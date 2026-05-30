import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { Footer } from '@/components/sections/Footer'
import Navbar from '@/components/ui/navbars/Navbar'

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