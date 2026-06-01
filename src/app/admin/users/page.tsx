/* Archivo: src\app\admin\users\page.tsx
   Descripción: Página de gestión de usuarios del panel de administración. */

import { connectDB } from "@/lib/database/database";
import { getAdminUsers } from "@/lib/api/admin-helpers";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  await connectDB();
  const users = await getAdminUsers();
  return <AdminUsersClient users={users} />;
}
