import Link from "next/link";
import { CURSOS } from "@/seed/data";
import CreateCourseModal from "@/components/ui/CreateCourseModal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB, User } from "@/lib/database";

export default async function CourseCatalogPage() {
    let isTeacher = false;

    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
            await connectDB();
            const user = await User.findOne({ email: session.user.email });
            if (user) {
                isTeacher = user.role === "teacher";
            }
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }

    return (
        <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Catálogo de cursos</h1>
                {isTeacher && <CreateCourseModal />}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {CURSOS.map((c: any) => (
                    <div key={c.id} className="card bg-base-100 shadow-sm border border-base-200">
                        <figure className="aspect-video overflow-hidden">
                            <img
                                src={c.imagen}
                                alt={c.nombre}
                                className="w-full h-full object-cover"
                            />
                        </figure>
                        <div className="card-body p-4">
                            <h2 className="card-title text-lg leading-tight">{c.nombre}</h2>
                            <p className="text-xs text-base-content/80 line-clamp-2">{c.descripcion}</p>
                            <div className="card-actions justify-end mt-2">
                                <Link href={`/mycourses/${c.id}`} className="btn btn-primary btn-sm">
                                    Ver curso
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}