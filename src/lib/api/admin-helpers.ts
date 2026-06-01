/* Archivo: src\lib\api\admin-helpers.ts
   Descripción: Helpers de consulta a la base de datos para el panel de administración. */

import { User, Organization } from "@/models/index";
import { IUser, UserPlan } from "@/models/User";
import { IOrganization } from "@/models/Organization";
import mongoose from "mongoose";

// ── Tipos serializados (sin ObjectId, listos para Client Components) ──────────

export interface AdminUserRow {
  _id: string;
  firstName: string;
  email: string;
  role: IUser["role"];
  plan: UserPlan;
  active: boolean;
  banned: boolean;
  organization: { _id: string; name: string } | null;
  createdAt: string;
}

export interface AdminOrgRow {
  _id: string;
  name: string;
  description: string | null;
  members: { _id: string; firstName: string; email: string }[];
  createdBy: { firstName: string; email: string } | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrgs: number;
  activeUsers: number;
  bannedUsers: number;
}

// ── Tipos internos de populate ────────────────────────────────────────────────

interface PopMember {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  email: string;
}

interface PopulatedOrg extends Omit<IOrganization, "members" | "createdBy"> {
  members: PopMember[];
  createdBy: PopMember | null;
}

interface PopulatedUserRow {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  email: string;
  role: IUser["role"];
  plan: UserPlan;
  active: boolean;
  banned?: boolean;
  organization: { _id: mongoose.Types.ObjectId; name: string } | null;
  createdAt: Date;
}

// ── Consultas ─────────────────────────────────────────────────────────────────

/**
 * Lista todos los usuarios (incluyendo inactivos) con su organización.
 * Requiere connectDB() antes de llamar.
 */
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const users = (await User.find({})
    .setOptions({ skipActiveFilter: true })
    .select("_id firstName email role plan active banned organization createdAt")
    .populate("organization", "name")
    .lean()) as unknown as PopulatedUserRow[];

  return users.map((u) => ({
    _id: String(u._id),
    firstName: u.firstName,
    email: u.email,
    role: u.role as IUser["role"],
    plan: u.plan as UserPlan,
    active: u.active,
    banned: u.banned ?? false,
    organization: u.organization
      ? { _id: String(u.organization._id), name: u.organization.name }
      : null,
    createdAt: new Date(u.createdAt).toLocaleDateString("es-ES"),
  }));
}

/**
 * Lista todas las organizaciones con sus miembros populados.
 * Requiere connectDB() antes de llamar.
 */
export async function getAdminOrganizations(): Promise<AdminOrgRow[]> {
  const orgs = (await Organization.find({})
    .populate("members", "firstName email")
    .populate("createdBy", "firstName email")
    .lean()) as unknown as PopulatedOrg[];

  return orgs.map((org) => ({
    _id: String(org._id),
    name: org.name,
    description: org.description ?? null,
    members: org.members.map((m) => ({
      _id: String(m._id),
      firstName: m.firstName,
      email: m.email,
    })),
    createdBy: org.createdBy
      ? { firstName: org.createdBy.firstName, email: org.createdBy.email }
      : null,
    createdAt: new Date(org.createdAt).toLocaleDateString("es-ES"),
  }));
}

/**
 * Estadísticas globales para la página de resumen del admin.
 * Requiere connectDB() antes de llamar.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const [totalUsers, totalOrgs, activeUsers, bannedUsers] = await Promise.all([
    User.countDocuments({}),
    Organization.countDocuments({}),
    User.countDocuments({ active: true }),
    User.countDocuments({ banned: true }),
  ]);

  return { totalUsers, totalOrgs, activeUsers, bannedUsers };
}
