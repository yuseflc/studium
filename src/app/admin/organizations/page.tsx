/* Archivo: src\app\admin\organizations\page.tsx
   Descripción: Página de gestión de organizaciones educativas del panel de administración. */

import { connectDB } from "@/lib/database/database";
import { getAdminOrganizations } from "@/lib/api/admin-helpers";
import AdminOrgsClient from "./AdminOrgsClient";

export default async function AdminOrganizationsPage() {
  await connectDB();
  const orgs = await getAdminOrganizations();
  return <AdminOrgsClient orgs={orgs} />;
}
