export default function Pricing() {
    return (
        <section id="pricing" className="bg-base-100 py-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl text-center mx-auto">
                    <p className="text-sm font-bold uppercase tracking-[0.32em] text-primary/80">Planes y precios</p>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold text-base-content tracking-tight">
                        Elige el plan que se adapte a tu ritmo de aprendizaje
                    </h2>
                    <p className="mt-4 text-lg text-base-content/70 leading-relaxed">
                        Accede a cursos, tareas y recursos desde un plan gratuito, sube al básico para obtener certificaciones o elige premium para tu equipo.
                    </p>
                </div>

                <div className="mt-16 grid gap-8 lg:grid-cols-3">
                    <div className="card w-full bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300 rounded-[2rem] hover:-translate-y-1">
                        <div className="card-body flex flex-col justify-between p-8">
                            <div>
                                <div className="h-2 w-16 rounded-full bg-primary/20 mb-6"></div>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-base-content">Gratuito</h3>
                                        <p className="text-sm text-base-content/60 mt-2">Acceso inmediato a recursos de estudio y actividades básicas.</p>
                                    </div>
                                    <span className="text-2xl font-semibold text-base-content">0 €/mes</span>
                                </div>
                                <p className="mt-5 text-sm text-base-content/70">
                                    Ideal para explorar la plataforma, aprender contenidos introductorios y familiarizarte con el flujo de cursos.
                                </p>
                            </div>

                            <div className="mt-10 space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Contenido gratuito ilimitado</div>
                                        <div className="text-xs text-base-content/70">Acceso inmediato a lecciones y recursos de inicio.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Apoyo comunitario</div>
                                        <div className="text-xs text-base-content/70">Participa en foros y comparte dudas con otros estudiantes.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 opacity-70">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-base-content/10 text-base-content/60 text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium line-through text-base-content">Certificado oficial</div>
                                        <div className="text-xs text-base-content/50">Actívalo al pasar a un plan de pago.</div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-outline btn-block mt-10 text-base-content">Comenzar gratis</button>
                        </div>
                    </div>

                    <div className="card w-full bg-base-100 shadow-[0_24px_80px_-48px_rgba(59,130,246,0.45)] border border-primary/20 hover:shadow-[0_26px_110px_-64px_rgba(59,130,246,0.35)] transition-all duration-300 rounded-[2rem] hover:-translate-y-1">
                        <div className="card-body flex flex-col justify-between p-8">
                            <div>
                                <div className="h-2 w-16 rounded-full bg-primary/30 mb-6"></div>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-base-content">Básico</h3>
                                        <p className="text-sm text-base-content/60 mt-2">Diseñado para aprender con estructura y certificación.</p>
                                    </div>
                                    <span className="text-2xl font-semibold text-base-content">9 €/mes</span>
                                </div>
                                <p className="mt-5 text-sm text-base-content/70">
                                    Ideal para estudiantes que quieren avanzar con proyectos prácticos, evaluaciones y acceso a certificaciones oficiales.
                                </p>
                            </div>

                            <div className="mt-10 space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Certificado oficial</div>
                                        <div className="text-xs text-base-content/70">Obtén un certificado digital al completar el curso.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Aprendizaje guiado</div>
                                        <div className="text-xs text-base-content/70">Trabaja proyectos prácticos con instrucciones paso a paso.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Soporte prioritario</div>
                                        <div className="text-xs text-base-content/70">Atención rápida para dudas y correcciones.</div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-primary btn-block mt-10">Suscribirse</button>
                        </div>
                    </div>

                    <div className="card w-full bg-base-100 shadow-xl border border-secondary/20 hover:shadow-2xl transition-all duration-300 rounded-[2rem] hover:-translate-y-1">
                        <div className="card-body flex flex-col justify-between p-8">
                            <div>
                                <div className="h-2 w-16 rounded-full bg-secondary/20 mb-6"></div>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-base-content">Premium</h3>
                                        <p className="text-sm text-base-content/60 mt-2">La opción completa para equipos con necesidades avanzadas.</p>
                                    </div>
                                    <span className="text-2xl font-semibold text-base-content">29 €/mes</span>
                                </div>
                                <p className="mt-5 text-sm text-base-content/70">
                                    Perfecto para equipos que quieren mentoría, integraciones y análisis de desempeño con prioridad activa.
                                </p>
                            </div>

                            <div className="mt-10 space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Mentoría 1:1</div>
                                        <div className="text-xs text-base-content/70">Recibe orientación personalizada con sesiones directas.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Integraciones profesionales</div>
                                        <div className="text-xs text-base-content/70">Conecta tu trabajo con GitHub, Slack y exporta resultados.</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Feedback experto</div>
                                        <div className="text-xs text-base-content/70">Recibe evaluaciones detalladas de tus ejercicios.</div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-primary btn-block mt-10">Suscribirse</button>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}