import React from 'react';

const Hero = () => {
    return (
        <div className="hero min-h-[70vh] bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-2xl">
                    <h1 className="text-5xl font-bold text-base-content">Tu Espacio de Aprendizaje</h1>
                    <p className="py-6 text-lg text-base-content/80 font-mono">
                        Accede a tus cursos, materiales académicos y participa en la comunidad estudiantil.
                        Impulsa tu carrera profesional con las mejores herramientas digitales.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="btn btn-primary">Mis Cursos</button>
                        <button className="btn btn-outline btn-secondary">Explorar Catálogo</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
