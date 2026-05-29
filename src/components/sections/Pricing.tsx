export default function Pricing() {
    return (
        <section id="pricing" className="bg-base-100 py-24">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl text-center mx-auto">
                    <span className="inline-flex rounded-full bg-secondary/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.32em] text-secondary">
                        Planes y precios
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold text-base-content tracking-tight">
                        Elige el plan que se adapte a tu ritmo de aprendizaje
                    </h2>
                    <p className="mt-4 text-lg text-base-content/70 leading-relaxed">
                        Accede a cursos, tareas y recursos desde un plan gratuito, sube al básico para obtener certificaciones o elige premium para tu equipo.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 lg:grid-cols-3">
                    <div className="card w-full bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300 rounded-[2rem]">
                        <div className="card-body flex flex-col justify-between p-8">
                            <div>
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="text-2xl font-bold text-base-content">Gratuito</h3>
                                    <span className="text-2xl font-semibold text-base-content">0 €/mes</span>
                                </div>
                                <p className="mt-3 text-sm text-base-content/70">
                                    Comienza con lo esencial y prueba la plataforma sin compromiso.
                                </p>
                                <span className="badge mt-5 bg-info/10 text-info">Ideal para empezar</span>
                            </div>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Acceso a contenido gratuito</div>
                                        <div className="text-xs text-base-content/70">Más de 50 lecciones y recursos introductorios</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Acceso a la comunidad</div>
                                        <div className="text-xs text-base-content/70">Foros y grupo de discusión para dudas</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 opacity-70">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-base-content/10 text-base-content/60 grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium line-through text-base-content">Certificado oficial</div>
                                        <div className="text-xs text-base-content/50">Disponible en planes de pago</div>
                                    </div>
                                </li>
                            </ul>

                            <button className="btn btn-outline btn-block mt-10 text-base-content">Comenzar gratis</button>
                        </div>
                    </div>

                    <div className="card w-full bg-base-100 shadow-xl border border-primary hover:shadow-2xl transition-all duration-300 rounded-[2rem]">
                        <div className="card-body flex flex-col justify-between p-8">
                            <div>
                                <span className="badge badge-md badge-primary w-fit text-center">Más elegido</span>
                                <div className="mt-5 flex items-center justify-between gap-4">
                                    <h3 className="text-2xl font-bold text-base-content">Básico</h3>
                                    <span className="text-2xl font-semibold text-base-content">9 €/mes</span>
                                </div>
                                <p className="mt-3 text-sm text-base-content/70">
                                    Perfecto para estudiantes que quieren avanzar con soporte y certificaciones.
                                </p>
                                <span className="badge mt-5 bg-secondary/10 text-secondary">Recomendado</span>
                            </div>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Certificado al completar</div>
                                        <div className="text-xs text-base-content/70">Descargable y verificable</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Proyectos guiados</div>
                                        <div className="text-xs text-base-content/70">Casos prácticos con soluciones</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Soporte por correo</div>
                                        <div className="text-xs text-base-content/70">Respuesta en 48 horas</div>
                                    </div>
                                </li>
                            </ul>

                            <button className="btn btn-primary btn-block mt-10">Suscribirse</button>
                        </div>
                    </div>

                    <div className="card w-full bg-base-100 shadow-xl border border-secondary hover:shadow-2xl transition-all duration-300 rounded-[2rem]">
                        <div className="card-body flex flex-col justify-between p-8">
                            <div>
                                <span className="badge badge-md badge-accent w-fit text-center">Para empresas</span>
                                <div className="mt-5 flex items-center justify-between gap-4">
                                    <h3 className="text-2xl font-bold text-base-content">Premium</h3>
                                    <span className="text-2xl font-semibold text-base-content">29 €/mes</span>
                                </div>
                                <p className="mt-3 text-sm text-base-content/70">
                                    Un plan completo para equipos que necesitan soporte prioritario y evaluaciones avanzadas.
                                </p>
                                <span className="badge mt-5 bg-success/10 text-success">Soporte prioritario</span>
                            </div>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Mentoría 1:1</div>
                                        <div className="text-xs text-base-content/70">Sesiones mensuales con un mentor</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Integraciones</div>
                                        <div className="text-xs text-base-content/70">GitHub, Slack y exportación de datos</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1 h-5 w-5 rounded-full bg-success/10 text-success grid place-items-center text-xs font-bold">✓</span>
                                    <div>
                                        <div className="font-medium text-base-content">Evaluaciones y feedback</div>
                                        <div className="text-xs text-base-content/70">Ejercicios revisados por instructores</div>
                                    </div>
                                </li>
                            </ul>

                            <button className="btn btn-primary btn-block mt-10">Suscribirse</button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-base-200 bg-base-200 p-8 text-center">
                    <p className="text-base-content/70">
                        ¿No estás seguro cuál plan elegir? Prueba gratis y escala cuando necesites más funciones. Todos los planes incluyen acceso continuo a tus cursos y tareas.
                    </p>
                </div>
            </div>
        </section>
    );
}