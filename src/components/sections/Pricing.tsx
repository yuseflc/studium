export default function Pricing() {
    return (
        <section id="pricing" className="flex flex-col lg:flex-row w-full items-center lg:items-stretch justify-center py-24 bg-base-100 gap-6 px-4 space-between">
            <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-base-200">
                <div className="card-body flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content">Gratuito</h2>
                        <span className="text-xl font-semibold text-base-content">0 €/mes</span>
                    </div>
                    <span className="badge mt-3 bg-info/10 text-info">Ideal para empezar</span>
                    <ul className="mt-6 flex flex-col gap-3 text-sm">
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Acceso a contenido gratuito</div>
                                <div className="text-xs text-base-content/70">Más de 50 lecciones y recursos introductorios</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Acceso a la comunidad</div>
                                <div className="text-xs text-base-content/70">Foros y grupo de discusión para dudas</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 opacity-70">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-base-content/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium line-through text-base-content">Certificado oficial</div>
                                <div className="text-xs text-base-content/50">Disponible en planes de pago</div>
                            </div>
                        </li>
                    </ul>
                    <div className="mt-6">
                        <button className="btn btn-outline btn-block text-base-content">Comenzar gratis</button>
                    </div>
                </div>
            </div>

            <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-primary">
                <div className="card-body flex flex-col justify-between">
                    <span className="badge badge-md badge-primary w-full text-center">Más elegido</span>
                    <div className="flex justify-between items-center mt-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content">Básico</h2>
                        <span className="text-xl font-semibold text-base-content">9 €/mes</span>
                    </div>
                    <span className="badge mt-3 bg-secondary/10 text-secondary">Ideal para estudiantes</span>
                    <ul className="mt-6 flex flex-col gap-3 text-sm">
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Certificado al completar</div>
                                <div className="text-xs text-base-content/70">Descargable y verificable</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Proyectos guiados</div>
                                <div className="text-xs text-base-content/70">Casos prácticos con soluciones</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Soporte por correo</div>
                                <div className="text-xs text-base-content/70">Respuesta en 48 horas</div>
                            </div>
                        </li>
                    </ul>
                    <div className="mt-6">
                        <button className="btn btn-primary btn-block">Suscribirse</button>
                    </div>
                </div>
            </div>

            <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-secondary">
                <div className="card-body flex flex-col justify-between">
                    <span className="badge badge-md badge-accent w-full text-center">Para empresas</span>
                    <div className="flex justify-between items-center mt-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-base-content">Premium</h2>
                        <span className="text-xl font-semibold text-base-content">29 €/mes</span>
                    </div>
                    <span className="badge mt-3 bg-success/10 text-success">Soporte prioritario</span>
                    <ul className="mt-6 flex flex-col gap-3 text-sm">
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Mentoría 1:1</div>
                                <div className="text-xs text-base-content/70">Sesiones mensuales con un mentor</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Integraciones</div>
                                <div className="text-xs text-base-content/70">GitHub, Slack y exportación de datos</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Evaluaciones y feedback</div>
                                <div className="text-xs text-base-content/70">Ejercicios revisados por instructores</div>
                            </div>
                        </li>
                    </ul>
                    <div className="mt-6">
                        <button className="btn btn-primary btn-block">Suscribirse</button>
                    </div>
                </div>
            </div>
        </section>
    );
}