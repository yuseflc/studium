/* Archivo: src\components\sections\Footer.tsx
    Descripción: Componente Footer con enlaces y copyright del sitio. */

// Pie de página reutilizable del sitio público
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

interface FooterLink {
    name: string;
    href: string;
}
interface FooterSection {
    title: string;
    links: FooterLink[]
}
const footerSections = [
    {
        title: 'Recursos',
        links: [
            { name: 'Mis Cursos', href: '/mycourses' },
            { name: 'Explorar', href: '/mycourses' },
            { name: 'Perfil', href: '/account/profile' },
            { name: 'Tareas', href: '/mycourses' },
        ],
    },
    {
        title: 'Proyecto',
        links: [
            { name: 'Inicio', href: '/' },
            { name: 'Características', href: '/#features' },
            { name: 'Precios', href: '/#pricing' },
            { name: 'Contacto', href: 'mailto:hola@studium.com' },
        ],
    },
    {
        title: 'Integrantes',
        links: [
            { name: 'Darío Muñoz', href: 'https://dmrstudio.dev/' },
            { name: 'Yusef Laroussi', href: 'https://yuxey.pages.dev/' },
            { name: 'David López', href: 'https://github.com/dalofe23' },
            { name: 'Eva Cantero', href: 'https://github.com/ecanteroa02' },
        ],
    },
]
export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="about" className="m-auto text-base-content border border-neutral/10 rounded-t-3xl max-w-sm md:max-w-2xl lg:max-w-7xl mx-4 md:mx-auto shadow-2xl shadow-neutral/10">
            <div className="relative bg-base-100 rounded-3xl mx-auto py-10 flex flex-col md:flex-row justify-between items-start gap-6 px-4 md:px-0">
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-10 md:px-8 flex-1 w-full">
                    <div className='flex flex-col items-start gap-2'>
                        <Link
                            href="/"
                            className="flex flex-row gap-1 items-center justify-start text-2xl font-display font-extrabold text-base-content"
                        >
                            <Logo className="h-8 w-auto" />
                        </Link>
                        <p className='font-medium w-full md:w-4/5 text-base-content'>Tu estudio organizado en una misma plataforma.</p>
                    </div>

                    <div className='flex flex-col md:mx-4 md:flex-row gap-2 md:gap-20 items-start md:items-start'>

                        {footerSections.map((section: FooterSection) => (
                            <div key={section.title} className='flex flex-col gap-1 md:gap-4'>
                                <h4 className="uppercase font-display text-md font-semibold text-base-content">
                                    {section.title}
                                </h4>
                                <div className="flex flex-wrap md:flex-col gap-2 text-sm text-neutral items-start ">
                                    {section.links.map(link => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="whitespace-nowrap font-medium hover:text-primary text-base-content/70"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <div className="my-3 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center md:items-center gap-4 text-sm w-full max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 items-center sm:items-center">
                    <p className="whitespace-nowrap font-medium text-base-content/70">
                        ©{currentYear} Studium.
                    </p>
                    <div className="flex flex-row gap-4">
                        <Link href="/legal/privacy-policy" className="font-medium text-base-content/70 hover:text-primary">Política de Privacidad</Link>
                        <Link href="/legal/tos" className="font-medium text-base-content/70 hover:text-primary">Términos &#38; Condiciones</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
