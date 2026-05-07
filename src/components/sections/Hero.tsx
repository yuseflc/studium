import React from 'react';

const Hero = () => {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center py-12">
                <div className="max-w-3xl flex flex-col items-center">
                    <img 
                        src="/illustrations/hero_study.svg" 
                        alt="Estudiando" 
                        className="w-full max-w-md mb-8 drop-shadow-2xl" 
                    />
                    <h1 className="text-6xl font-bold text-base-content ">Tu <span className="text-secondary font-bold font-mono">estudio</span> organizado en una misma <span className="text-secondary font-bold font-mono">plataforma</span></h1>
                    <p className="py-6 text-lg text-base-content/80 font-mono">
                        Accede a tus cursos, materiales académicos y participa en la comunidad estudiantil.
                        Impulsa tu carrera profesional con las mejores herramientas digitales.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="btn btn-primary">Mis Cursos</button>
                        <button className="btn btn-outline btn-secondary">Ver utilidades</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
