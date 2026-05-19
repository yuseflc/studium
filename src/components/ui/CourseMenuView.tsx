import Link from "next/link";
import { CURSOS } from "@/seed/data";
import { IconArrowUpRight } from "@tabler/icons-react";
import CreateCourseModalWrapper from "@/components/ui/CreateCourseModalWrapper";
import { ICourse } from "@/models/Course";
import Course from "@/models/Course";
import { connectDB } from "@/lib/database/database";


export default async function CoursesView({ isTeacher }: { isTeacher?: boolean }) {
  let courses: ICourse[] = [];

  try {
    await connectDB();
    // Obtener cursos de MongoDB
    const dbCourses = await Course.find({}).lean() as ICourse[];
    // Combinar con cursos del seed
    courses = [...dbCourses, ...CURSOS];
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Fallback a seed data
    courses = CURSOS;
  }

  return (
    <main className="p-8 bg-base-100 min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Catálogo de cursos</h1>
        {isTeacher && <CreateCourseModalWrapper />}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 relative z-10">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-base-content/60">
            <p>No hay cursos disponibles aún</p>
          </div>
        ) : (
          courses.map((c: ICourse, index: number) => {
            const courseId = c._id?.toString() || `temp-${index}`;
            return (
              <Link key={courseId} href={`/mycourses/${courseId}`} className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all group relative flex flex-col z-20 hover:z-30 focus-within:z-30">
                <div className="relative">
                  <figure className="aspect-video relative overflow-hidden rounded-t-xl">
                    <img
                      src={"https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60"}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform"
                    />
                    {/* Overlay para facilitar lectura del nombre */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    <div className="absolute top-2 right-2 opacity-0 border border-white group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2 group-hover:translate-y-0 translate-y-2 bg-black/50 p-1.5 rounded-full">
                      <IconArrowUpRight size={20} className="text-white" />
                    </div>
                  </figure>

                  <span className="badge absolute -bottom-3 left-20 text-xs min-[1280px]:max-[1300px]:text-[5px] min-[1300px]:max-[1550px]:text-[7px] font-bold uppercase tracking-widest drop-shadow-md z-40">
                    Ignacio Miguel Mateos
                  </span>

                  {/* Avatar movido fuera del figure para evitar recortes y problemas de z-index */}
                  <div className="absolute -bottom-8 left-2 w-16 h-16 rounded-full border-4 border-base-100 overflow-hidden z-30 bg-base-300 shadow-lg">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                      alt="Ignacio Miguel Mateos"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="card-body p-4 pt-10 flex flex-col relative">
                  <h2 className="card-title text-lg leading-tight flex-grow">{c.title}</h2>
                  <p className="text-sm text-base-content/70">{c.description}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}