/* Archivo: src\components\sections\Hero.tsx
    Descripción: Sección Hero usada en la página de inicio con título y CTA principal. */

// Sección Hero de la landing: encabezado principal y llamada a la acción
const Hero = () => {
    return (
        <div id="top" className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center py-12">
                <div className="max-w-3xl flex flex-col items-center">
                    <img 
                        src="/illustrations/hero_study.svg" 
                        alt="Estudiando" 
                        className="w-full max-w-sm md:max-w-md mb-8 drop-shadow-2xl px-4" 
                    />
                    <h1 className="text-4xl md:text-6xl font-bold text-base-content px-4">Tu <span className="text-secondary font-bold font-mono">estudio</span> organizado en una misma <span className="text-secondary font-bold font-mono">plataforma</span></h1>
                    <p className="py-6 text-base md:text-lg text-base-content/80 font-mono px-6">
                        Accede a tus cursos, materiales académicos y participa en la comunidad estudiantil.
                        Impulsa tu carrera profesional con las mejores herramientas digitales.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full px-6 sm:px-0">
                        <a href="/mycourses" className="w-full sm:w-auto"><button className="btn btn-primary w-full">Mis Cursos</button></a>
                        <a href="#features" className="w-full sm:w-auto"><button className="btn btn-outline btn-secondary w-full">Ver utilidades</button></a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
