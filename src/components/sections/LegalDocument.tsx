import Link from 'next/link'

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
    updatedAt,
    summary,
    sections,
    contactEmail,
    contactLabel,
    closingNote,
}: LegalDocumentProps) {
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-secondary/10 via-primary/5 to-transparent" />
            <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:px-8 lg:py-14">
                <section className="overflow-hidden rounded-[2rem] border border-neutral/10 bg-base-100 shadow-2xl shadow-neutral/10">
                    <div className="space-y-8 p-6 md:p-10 lg:p-12">
                        <div className="flex flex-col justify-between gap-6">
                            <div className="space-y-5">
                                <span className="badge badge-secondary badge-lg w-fit uppercase tracking-[0.2em]">
                                    {eyebrow}
                                </span>
                                <div className="space-y-4">
                                    <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-base-content md:text-5xl">
                                        {title}
                                    </h1>
                                    <p className="max-w-3xl text-base leading-relaxed text-base-content/75 md:text-lg">
                                        {intro}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70">
                                <span className="badge badge-outline badge-lg px-4 py-3">
                                    Actualizado: {updatedAt}
                                </span>
                                <span className="badge badge-outline badge-lg px-4 py-3">
                                    Studium
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {summary.map((item) => (
                                <article
                                    key={item.label}
                                    className="card border border-base-200 bg-base-200/70 shadow-sm"
                                >
                                    <div className="card-body flex h-full min-h-44 gap-3 p-5">
                                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                                            {item.label}
                                        </span>
                                        <p className="max-w-full break-words text-xl font-bold leading-tight text-base-content md:text-2xl">
                                            {item.value}
                                        </p>
                                        <p className="max-w-xl text-sm leading-relaxed text-base-content/70 md:text-base">
                                            {item.description}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-5">
                    {sections.map((section, index) => (
                        <article
                            key={section.title}
                            className="card border border-neutral/10 bg-base-100 shadow-xl shadow-neutral/5"
                        >
                            <div className="card-body gap-5 p-6 md:p-8">
                                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="badge badge-primary badge-lg mt-1 min-w-12 justify-center text-base-content">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-base-content md:text-3xl">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="space-y-4 text-base leading-relaxed text-base-content/75">
                                    {section.paragraphs.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>

                                {section.bullets?.length ? (
                                    <ul className="grid gap-3 md:grid-cols-2">
                                        {section.bullets.map((bullet) => (
                                            <li
                                                key={bullet}
                                                className="rounded-2xl border border-base-200 bg-base-200/60 px-4 py-3 text-sm leading-relaxed text-base-content/75"
                                            >
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}

                                {section.ordered?.length ? (
                                    <ol className="space-y-3 rounded-2xl border border-base-200 bg-base-200/60 p-5 text-sm leading-relaxed text-base-content/75">
                                        {section.ordered.map((item, itemIndex) => (
                                            <li key={item} className="flex gap-3">
                                                <span className="badge badge-outline badge-sm mt-0.5 min-w-8 justify-center">
                                                    {itemIndex + 1}
                                                </span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ol>
                                ) : null}
                            </div>
                        </article>
                    ))}
                </section>

                <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <article className="card border border-neutral/10 bg-base-100 shadow-xl shadow-neutral/5">
                        <div className="card-body gap-3 p-6 md:p-8">
                            <span className="badge badge-secondary badge-lg w-fit uppercase tracking-[0.2em]">
                                Contacto
                            </span>
                            <h2 className="text-2xl font-bold text-base-content md:text-3xl">{contactLabel}</h2>
                            <p className="max-w-2xl text-base leading-relaxed text-base-content/75">
                                Si quieres ejercer tus derechos, resolver dudas legales o pedir una revisión de tus datos,
                                escríbenos y te responderemos por el canal adecuado.
                            </p>
                            <a
                                href={`mailto:${contactEmail}`}
                                className="btn btn-primary btn-wide mt-2"
                            >
                                {contactEmail}
                            </a>
                        </div>
                    </article>

                    <article className="card border border-neutral/10 bg-base-100 shadow-xl shadow-neutral/5">
                        <div className="card-body gap-3 p-6 md:p-8">
                            <span className="badge badge-outline badge-lg w-fit uppercase tracking-[0.2em]">
                                Alcance
                            </span>
                            <p className="text-base leading-relaxed text-base-content/75">{closingNote}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-base-content/70">
                                <Link href="/" className="link link-hover font-medium text-primary">
                                    Volver al inicio
                                </Link>
                                <Link href="/mycourses" className="link link-hover font-medium text-primary">
                                    Ir a mis cursos
                                </Link>
                            </div>
                        </div>
                    </article>
                </section>
            </div>
        </div>
    )
}

export type { LegalSection, SummaryItem, LegalDocumentProps }