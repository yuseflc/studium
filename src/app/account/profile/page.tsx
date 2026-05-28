import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import User from "@/models/User";
import Link from "next/link";
import { IconUser, IconMail, IconCalendar, IconKey, IconUserCheck, IconBook, IconSchool } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import mongoose from "mongoose";

interface PopulatedUser {
    _id: mongoose.Types.ObjectId;
    email: string;
    firstName: string;
    role: "student" | "teacher" | "admin";
    active: boolean;
    profile?: {
        lastName?: string;
        profilePicture?: string;
        bio?: string;
    };
    enrolledCourses?: any[];
    createdCourses?: any[];
    createdAt: Date;
    updatedAt: Date;
}

// SSR page para mostrar el perfil del usuario autenticado
export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    try {
        await connectDB();
        const user = (await User.findOne({ email: session.user.email })
            .populate("enrolledCourses", "title description")
            .populate("createdCourses", "title description")
            .lean()) as PopulatedUser | null;

        if (!user) {
            redirect("/auth/login");
        }

        const fullName = user.profile?.lastName 
            ? `${user.firstName} ${user.profile.lastName}`
            : user.firstName;

        const profilePicture = user.profile?.profilePicture 
            ? user.profile.profilePicture 
            : `https://i.pravatar.cc/150?u=${user.email}`;

        return (
            <div className="flex flex-col items-center m-4 p-4">
                {/* User Header Card */}
                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 p-3 pb-0 w-full max-w-3xl">
                    <div className="avatar flex items-start">
                        <div className="w-24 rounded-full mr-7 mt-4">
                            <img src={profilePicture} alt={`Avatar de ${fullName}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold mt-12">{fullName}</h1>
                            <p className="text-sm text-base-content/60 mt-2 capitalize">{user.role === "student" ? "Estudiante" : user.role === "teacher" ? "Profesor" : "Administrador"}</p>
                        </div>
                    </div>
                </div>

                {/* User Details Card */}
                <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
                    <div className="card-body">
                        <div className="flex mb-4">
                            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-yellow-400 text-black border-2 border-base-100 shadow-md">Detalles del Usuario</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconUser size={30} />
                                <input type="text" value={user.firstName} readOnly className="input input-ghost w-full text-base-content" />
                            </label>
                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconMail size={30} />
                                <input type="text" value={user.email} readOnly className="input input-ghost w-full text-base-content" />
                            </label>

                            {user.profile?.lastName && (
                                <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                    <IconUser size={30} />
                                    <div className="flex flex-col w-full">
                                        <span className="text-xs text-base-content/60">Apellido</span>
                                        <input type="text" value={user.profile.lastName} readOnly className="input input-ghost w-full text-base-content" />
                                    </div>
                                </label>
                            )}

                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
                                <IconUserCheck size={30} />
                                <div className="flex flex-col w-full">
                                    <span className="text-xs text-base-content/60">Rol</span>
                                    <input type="text" value={user.role === "student" ? "Estudiante" : user.role === "teacher" ? "Profesor" : "Administrador"} readOnly className="input input-ghost w-full text-base-content" />
                                </div>
                            </label>

                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2 text-xs">
                                <IconKey size={30} />
                                <div className="flex flex-col w-full">
                                    <span className="text-xs text-base-content/60">ID del Usuario</span>
                                    <input type="text" value={user._id.toString()} readOnly className="input input-ghost input-sm w-full text-xs text-base-content font-mono" />
                                </div>
                            </label>

                            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2">
                                <IconCalendar size={30} />
                                <div className="flex flex-col w-full">
                                    <span className="text-xs text-base-content/60">Miembro desde</span>
                                    <input type="text" value={new Date(user.createdAt).toLocaleDateString()} readOnly className="input input-ghost w-full text-base-content" />
                                </div>
                            </label>

                            {user.profile?.bio && (
                                <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2">
                                    <div className="flex flex-col w-full">
                                        <span className="text-xs text-base-content/60">Biografía</span>
                                        <textarea value={user.profile.bio} readOnly className="textarea textarea-ghost w-full text-base-content" rows={3} />
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses */}
                {user.enrolledCourses && user.enrolledCourses.length > 0 && (
                    <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
                        <div className="card-body">
                            <div className="flex mb-4 items-center gap-2">
                                <IconBook size={24} />
                                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-blue-400 text-black border-2 border-base-100 shadow-md">Cursos Inscritos ({user.enrolledCourses.length})</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {user.enrolledCourses.map((course: any) => {
                                    const courseId = course._id?.toString() || course.id;
                                    return (
                                        <div key={courseId} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="card-body p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h2 className="card-title text-lg">{course.title}</h2>
                                                        {course.description && <p className="text-sm text-base-content/70">{course.description}</p>}
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
                )}

                {/* Created Courses (only for teachers/admins) */}
                {user.createdCourses && user.createdCourses.length > 0 && (
                    <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
                        <div className="card-body">
                            <div className="flex mb-4 items-center gap-2">
                                <IconSchool size={24} />
                                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-green-400 text-black border-2 border-base-100 shadow-md">Cursos Creados ({user.createdCourses.length})</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {user.createdCourses.map((course: any) => {
                                    const courseId = course._id?.toString() || course.id;
                                    return (
                                        <div key={courseId} className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="card-body p-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h2 className="card-title text-lg">{course.title}</h2>
                                                        {course.description && <p className="text-sm text-base-content/70">{course.description}</p>}
                                                    </div>
                                                    <Link href={`/mycourses/${courseId}`} className="btn btn-info btn-sm">Gestionar</Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        return (
            <div className="flex flex-col items-center m-4 p-4">
                <div className="alert alert-error">
                    <p>Error al cargar el perfil. Por favor intenta más tarde.</p>
                </div>
            </div>
        );
    }
}