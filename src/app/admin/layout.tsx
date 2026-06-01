/* Archivo: src\app\admin\layout.tsx
   Descripción: Layout protegido del panel de administración. Redirige si el usuario no es admin. */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User } from "@/models/index";
import { notFound } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export const metadata = { title: "Administración — Studium" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  await connectDB();
  const user = await User.findById(session.user.id)
    .setOptions({ skipActiveFilter: true })
    .select("role")
    .lean();
  if (!user || user.role !== "admin") notFound();

  return (
    <div className="flex min-h-screen bg-base-200">
      <AdminSidebar />
      {/* pt-14 en mobile para compensar la top bar fija */}
      <main className="flex-1 p-6 md:p-8 overflow-auto pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
}
