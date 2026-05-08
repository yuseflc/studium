import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbars/Navbar";
import Sidebar from "./Sidebar";

export const metadata: Metadata = {
  title: "Studium UI | Catálogo",
  description: "Catálogo de cursos",
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-base-100 h-screen overflow-hidden">
      <div className="border-b border-base-300 shadow-sm z-50">
        <Navbar />
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
