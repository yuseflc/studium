/* Archivo: src\components\sections\Pricing.tsx
    Descripción: Sección de precios y planes mostrada en la página principal. */

// Sección de precios y planes del producto
export default function Pricing() {
    return (
        <section id="pricing" className="flex flex-col lg:flex-row w-full items-center lg:items-stretch justify-center py-24 bg-base-100 gap-6 px-4">

            {/* Tarjeta Gratuito */}
            <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-base-200">
                <div className="card-body flex flex-col justify-between">
                    <div>
                        <span className="badge w-full bg-info/10 text-info text-center py-3 mb-4">
                            Ideal para empezar
                        </span>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-base-content">Gratuito</h2>
                            <span className="text-xl font-semibold text-base-content">0 €/mes</span>
                        </div>
                    </div>

                    <ul className="mt-6 flex flex-col gap-3 text-sm">
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Hasta 10 alumnos activos</div>
                                <div className="text-xs text-base-content/70">Ideal para probar la plataforma</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Hasta 3 cursos públicos</div>
                                <div className="text-xs text-base-content/70">Comparte tu conocimiento</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Subida de archivos hasta 10MB</div>
                                <div className="text-xs text-base-content/70">PDFs, imágenes y documentos</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-base-content/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Sin evaluaciones automáticas</div>
                                <div className="text-xs text-base-content/70">Las evaluaciones requieren plan de pago</div>
                            </div>
                        </li>
                    </ul>

                    <div className="mt-8">
                        <button className="btn btn-outline btn-primary btn-block">Comenzar gratis</button>
                    </div>
                </div>
            </div>

            {/* Tarjeta Básico (MÁS ELEGIDO) */}
            <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-primary relative">
                <div className="card-body flex flex-col justify-between">
                    <div>
                        <span className="badge w-full badge-primary text-center py-3 mb-4">
                            Más elegido
                        </span>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-base-content">Básico</h2>
                            <span className="text-xl font-semibold text-base-content">9 €/mes</span>
                        </div>
                        <span className="badge mt-3 bg-secondary/10 text-secondary border-none">
                            Ideal para pequeños creadores
                        </span>
                    </div>

                    <ul className="mt-6 flex flex-col gap-3 text-sm">
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Hasta 30 alumnos activos</div>
                                <div className="text-xs text-base-content/70">Perfecto para clases pequeñas</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Hasta 15 cursos privados</div>
                                <div className="text-xs text-base-content/70">Crea y organiza tu contenido</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Subida de archivos hasta 50MB</div>
                                <div className="text-xs text-base-content/70">Videos cortos y documentos</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Evaluaciones automáticas</div>
                                <div className="text-xs text-base-content/70">Cuestionarios y tests con corrección automática</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Soporte por correo 48h</div>
                                <div className="text-xs text-base-content/70">Respuesta garantizada</div>
                            </div>
                        </li>
                    </ul>

                    <div className="mt-8">
                        <button className="btn btn-primary btn-block">Suscribirse</button>
                    </div>
                </div>
            </div>

            {/* Tarjeta Premium */}
            <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-secondary">
                <div className="card-body flex flex-col justify-between">
                    <div>
                        <span className="badge w-full bg-black text-white text-center py-3 mb-4">
                            Para empresas
                        </span>
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-base-content">Premium</h2>
                            <span className="text-xl font-semibold text-base-content">29 €/mes</span>
                        </div>
                        <span className="badge mt-3 bg-success/10 text-success border-none">
                            Escalabilidad total
                        </span>
                    </div>

                    <ul className="mt-6 flex flex-col gap-3 text-sm">
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Alumnos ilimitados</div>
                                <div className="text-xs text-base-content/70">Sin límites de capacidad</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Cursos ilimitados</div>
                                <div className="text-xs text-base-content/70">Crea todos los cursos que necesites</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Subida de archivos hasta 100MB</div>
                                <div className="text-xs text-base-content/70">Videos HD, proyectos y archivos grandes</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Evaluaciones avanzadas</div>
                                <div className="text-xs text-base-content/70">IA, análisis de rendimiento y feedback personalizado</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Certificados personalizados</div>
                                <div className="text-xs text-base-content/70">Con tu marca y logo</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">Soporte prioritario 24/7</div>
                                <div className="text-xs text-base-content/70">Respuesta en menos de 2 horas</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <div>
                                <div className="font-medium text-base-content">API y Webhooks</div>
                                <div className="text-xs text-base-content/70">Integración con tus sistemas</div>
                            </div>
                        </li>
                    </ul>

                    <div className="mt-8">
                        <button className="btn btn-primary btn-block">Suscribirse</button>
                    </div>
                </div>
            </div>
        </section>
    );
}