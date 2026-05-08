import { USUARIO } from "@/seed/data";

export default function ProfilePage() {
    return (
        <div className="flex flex-col items-center m-4 p-4">
            <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 p-3 pb-0 w-full max-w-3xl">
                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 p-3 pb-0 w-full max-w-3xl">
                    <div className="avatar flex items-start">
                        <div className="w-24 rounded-full mr-4">
                            <img src="https://i.pravatar.cc/150?u=maria" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{USUARIO.name}</h1>
                            <p className="mt-1 text-gray-400 text-sm leading-5">Biografía: [Espacio para la biografía del usuario]</p>
                        </div>
                    </div>
                </div>

                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
                    <div className="card-body">
                        <h2 className="badge badge badge-warning badge-xl m-2">Detalles del Usuario</h2>
                        <p><strong>Nombre:</strong> {USUARIO.name}</p>
                        <p><strong>Email:</strong> {USUARIO.email}</p>
                        <p><strong>Teléfono:</strong> {USUARIO.phone}</p>
                        <p><strong>Fecha de nacimiento:</strong> {USUARIO.birthDate}</p>
                        <p><strong>Dirección:</strong> {USUARIO.address}</p>
                        <p><strong>Género:</strong> Masculino</p>
                    </div>



                </div>
                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
                    <div className="card-body">
                        <h2 className="badge badge-soft badge-warning badge-xl m-2 border border-primary font-bold">Cursos</h2>
                        <div className="grid grid-cols-1 gap-4 justify-items-center">
                            <div className="card bg-base-100 w-full max-w-3xl shadow-sm">
                                <div className="card-body">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="card-title">Curso 1</h2>
                                            <p>Descripción corta del curso 1.</p>
                                        </div>
                                        <button className="btn btn-primary btn-sm">Entrar</button>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 w-full max-w-3xl shadow-sm">
                                <div className="card-body">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="card-title">Curso 2</h2>
                                            <p>Descripción corta del curso 2.</p>
                                        </div>
                                        <button className="btn btn-primary btn-sm">Entrar</button>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-base-100 w-full max-w-3xl shadow-sm">
                                <div className="card-body">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="card-title">Curso 3</h2>
                                            <p>Descripción corta del curso 3.</p>
                                        </div>
                                        <button className="btn btn-primary btn-sm">Entrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

            </div>

        </div >
    );
}