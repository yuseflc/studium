import type { Metadata } from "next";
import Sidebar from "./Sidebar";
import CourseNavbar from "@/components/ui/Navbars/CourseNavbar";
export const metadata: Metadata = {
  title: "Studium UI | Catálogo",
  description: "Catálogo de cursos",
};

export default async function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-full flex flex-col bg-base-100 h-screen overflow-hidden">
        <div>
          <CourseNavbar />
        </div>
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
  );
}
