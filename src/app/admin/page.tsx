/* Archivo: src\app\admin\page.tsx
   Descripción: Página de resumen del panel de administración. */

import { connectDB } from "@/lib/database/database";
import { getAdminStats } from "@/lib/api/admin-helpers";
import Link from "next/link";
import { IconUsers, IconBuilding, IconUserCheck, IconUserOff } from "@tabler/icons-react";

export default async function AdminPage() {
  await connectDB();
  const { totalUsers, totalOrgs, activeUsers, bannedUsers } = await getAdminStats();

  const stats = [
    { label: "Total usuarios", value: totalUsers, icon: IconUsers, href: "/admin/users", color: "text-primary" },
    { label: "Organizaciones", value: totalOrgs, icon: IconBuilding, href: "/admin/organizations", color: "text-secondary" },
    { label: "Usuarios activos", value: activeUsers, icon: IconUserCheck, href: "/admin/users", color: "text-success" },
    { label: "Usuarios baneados", value: bannedUsers, icon: IconUserOff, href: "/admin/users", color: "text-error" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-base-content mb-6">Resumen</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <div className={`mb-3 ${color}`}>
              <Icon size={28} />
            </div>
            <p className="text-3xl font-extrabold text-base-content">{value}</p>
            <p className="text-sm text-base-content/60 mt-1">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
