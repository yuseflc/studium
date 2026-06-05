/* Archivo: src\app\actions\adminActions.ts
   Descripción: Server Actions para la gestión de usuarios y organizaciones por parte de administradores. */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { User, Organization } from "@/models/index";
import { IUser, UserPlan } from "@/models/User";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("No autenticado");
  await connectDB();
  const user = await User.findById(session.user.id)
    .setOptions({ skipActiveFilter: true })
    .select("role")
    .lean();
  if (!user || user.role !== "admin") throw new Error("Acceso denegado");
  return session.user.id;
}

// ── Usuarios ────────────────────────────────────────────────────────────────

export async function updateUserAction(
  userId: string,
  data: { role?: IUser["role"]; plan?: UserPlan; banned?: boolean; active?: boolean }
) {
  await requireAdmin();
  await User.findByIdAndUpdate(userId, data);
  revalidatePath("/admin/users");
}

export async function createUserAction(data: {
  email: string;
  firstName: string;
  password: string;
  role: IUser["role"];
  plan: UserPlan;
}) {
  await requireAdmin();
  await User.create(data);
  revalidatePath("/admin/users");
}

export async function searchAvailableUsersAction(query: string, page: number) {
  await requireAdmin();
  const PAGE_SIZE = 10;
  const skip = (page - 1) * PAGE_SIZE;

  const filter: Record<string, unknown> = { organization: { $in: [null, undefined] } };
  if (query.trim()) {
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { firstName: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .setOptions({ skipActiveFilter: true })
      .select("_id firstName email")
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => ({ _id: String(u._id), firstName: u.firstName, email: u.email })),
    total,
    pages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function deleteUserAction(userId: string) {
  const adminId = await requireAdmin();
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("ID inválido");
  if (userId === adminId) throw new Error("No puedes eliminarte a ti mismo");

  const user = await User.findById(userId).select("organization role").lean();
  if (!user) throw new Error("Usuario no encontrado");
  if (user.role === "admin") throw new Error("No se puede eliminar a otro administrador");

  // Si pertenece a una organización, eliminarlo de sus miembros
  if (user.organization) {
    await Organization.findByIdAndUpdate(user.organization, { $pull: { members: userId } });
  }

  await User.findByIdAndDelete(userId);
  revalidatePath("/admin/users");
}

// ── Organizaciones ───────────────────────────────────────────────────────────

export async function updateOrganizationAction(
  orgId: string,
  data: { name?: string; description?: string }
) {
  await requireAdmin();
  if (!mongoose.Types.ObjectId.isValid(orgId)) throw new Error("ID inválido");
  await Organization.findByIdAndUpdate(orgId, data);
  revalidatePath("/admin/organizations");
}

export async function createOrganizationAction(data: {
  name: string;
  description?: string;
}) {
  const adminId = await requireAdmin();
  await Organization.create({ ...data, createdBy: adminId, members: [] });
  revalidatePath("/admin/organizations");
}

export async function addMemberToOrganizationAction(orgId: string, userId: string) {
  await requireAdmin();
  if (
    !mongoose.Types.ObjectId.isValid(orgId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) throw new Error("ID inválido");

  await Organization.findByIdAndUpdate(orgId, { $addToSet: { members: userId } });
  await User.findByIdAndUpdate(userId, {
    organization: orgId,
    role: "teacher" satisfies IUser["role"],
    plan: "student" satisfies UserPlan,
  });
  revalidatePath("/admin/organizations");
  revalidatePath("/admin/users");
}

export async function removeMemberFromOrganizationAction(orgId: string, userId: string) {
  await requireAdmin();
  await Organization.findByIdAndUpdate(orgId, { $pull: { members: userId } });
  await User.findByIdAndUpdate(userId, { $unset: { organization: "" } });
  revalidatePath("/admin/organizations");
  revalidatePath("/admin/users");
}

export async function deleteOrganizationAction(orgId: string) {
  await requireAdmin();
  const org = await Organization.findById(orgId);
  if (!org) throw new Error("Organización no encontrada");
  await User.updateMany({ organization: orgId }, { $unset: { organization: "" } });
  await Organization.findByIdAndDelete(orgId);
  revalidatePath("/admin/organizations");
}
