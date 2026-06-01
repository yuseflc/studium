/* Archivo: src\components\sections\LegalDocument.tsx
    Descripción: Componente para mostrar documentos legales (TOS, privacidad) con un diseño simple. */

// Componente para mostrar documentos legales con formato limpio
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

type SummaryItem = {
    label: string
    value: string
    description: string
}

type LegalSection = {
    title: string
    paragraphs: string[]
    bullets?: string[]
    ordered?: string[]
}

type LegalDocumentProps = {
    eyebrow: string
    title: string
    intro: string
    updatedAt: string
    summary: SummaryItem[]
    sections: LegalSection[]
    contactEmail: string
    contactLabel: string
    closingNote: string
}

export default function LegalDocument({
    eyebrow,
    title,
    intro,
    sections,
    contactEmail,
}: LegalDocumentProps) {
    return (
        <div className="mx-auto w-full max-w-3xl px-5 py-12 lg:py-16">
            {/* Cabecera con el logo de Studium */}
            <header className="flex flex-col items-center gap-5 text-center">
                <Logo className="h-7 w-auto" />
                <div className="space-y-3">
                    <p className="text-xl font-bold text-primary sm:text-2xl">{eyebrow}</p>
                    <h1 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-base-content/70">
                        {intro}
                    </p>
                </div>
            </header>

            <div className="divider my-10" />

            {/* Secciones del documento */}
            <article className="flex flex-col gap-10">
                {sections.map((section) => (
                    <section key={section.title} className="space-y-4">
                        <h2 className="text-xl font-bold text-base-content">{section.title}</h2>

                        {section.paragraphs.map((paragraph) => (
                            <p key={paragraph} className="text-base leading-relaxed text-base-content/75">
                                {paragraph}
                            </p>
                        ))}

                        {section.bullets?.length ? (
                            <ul className="ml-1 space-y-2">
                                {section.bullets.map((bullet) => (
                                    <li key={bullet} className="flex gap-3 text-base leading-relaxed text-base-content/75">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}

                        {section.ordered?.length ? (
                            <ol className="ml-1 space-y-2">
                                {section.ordered.map((item, itemIndex) => (
                                    <li key={item} className="flex gap-3 text-base leading-relaxed text-base-content/75">
                                        <span className="font-semibold text-primary">{itemIndex + 1}.</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : null}
                    </section>
                ))}
            </article>

            <div className="divider my-10" />

            {/* Cierre y contacto */}
            <footer className="space-y-5 text-center">
                <a href={`mailto:${contactEmail}`} className="link link-hover font-medium text-primary">
                    {contactEmail}
                </a>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-base-content/60">
                    <Link href="/" className="link link-hover">Volver al inicio</Link>
                    <Link href="/mycourses" className="link link-hover">Ir a mis cursos</Link>
                </div>
            </footer>
        </div>
    )
}

export type { LegalSection, SummaryItem, LegalDocumentProps }
