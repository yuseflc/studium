import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbars/Navbar";

export const metadata: Metadata = {
  title: "Studium UI | Catálogo",
  description: "Catálogo de cursos",
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-base-100">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
