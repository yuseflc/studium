import { USUARIO, CURSOS } from "@/seed/data";
import Link from "next/link";
import { IconUser, IconMail, IconPhone, IconCalendar, IconHome, IconKey} from "@tabler/icons-react";

// Página de perfil de usuario basada en datos de ejemplo del seed.
// Mantiene la presentación limpia sin editar los datos, solo muestra el usuario y sus cursos.
export default function ProfilePage() {
    return (
        <div className="flex flex-col items-center m-4 p-4">
            <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 p-3 pb-0 w-full max-w-3xl">
                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 p-3 pb-0 w-full max-w-3xl">
                    <div className="avatar flex items-start">
                        <div className="w-24 rounded-full mr-7 mt-4">
                            <img src="https://i.pravatar.cc/150?u=maria" alt={`Avatar de ${USUARIO.name}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mt-12">{USUARIO.name}</h1>
                        </div>
                    </div>
                </div>

                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
                    <div className="card-body">
                        <div className="flex mb-4">
                            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-yellow-400 text-black border-2 border-base-100 shadow-md">Detalles del Usuario</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 --font-manrope">
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconUser size={30} />
                                <input type="text" placeholder={USUARIO.name} readOnly className="input input-ghost w-full" />
                            </label>
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconMail size={30} />
                                <input type="text" placeholder={USUARIO.email} readOnly className="input input-ghost w-full" />
                            </label>
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2 text-xs">
                                <IconKey size={30} />
                                <input type="text" placeholder={USUARIO.id} readOnly className="input input-ghost input-sm w-full text-xs" />
                            </label>
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconPhone size={30} />
                                <input type="text" placeholder={USUARIO.phone} readOnly className="input input-ghost w-full" />
                            </label>
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconCalendar size={30} />
                                <input type="text" placeholder={USUARIO.birthDate} readOnly className="input input-ghost w-full" />
                            </label>
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconHome size={30} />
                                <input type="text" placeholder={USUARIO.address} readOnly className="input input-ghost w-full" />
                            </label>
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconKey size={30} />
                                <input type="text" placeholder={USUARIO.role} readOnly className="input input-ghost w-full" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
                    <div className="card-body">
                        <div className="flex mb-4">
                            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-yellow-400 text-black border-2 border-base-100 shadow-md">Cursos</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 justify-items-center">
                            {CURSOS.slice(0, 3).map((curso, index) => {
                              const courseId = curso._id?.toString() || `seed-${index}`;
                              return (
                                <div key={courseId} className="card bg-base-100 w-full max-w-3xl shadow-sm">
                                    <div className="card-body">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h2 className="card-title">{curso.title}</h2>
                                                <p>{curso.description}</p>
                                            </div>
                                            <Link href={`/mycourses/${courseId}`} className="btn btn-warning btn-sm">Entrar</Link>
                                        </div>
                                    </div>
                                </div>
                              );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}