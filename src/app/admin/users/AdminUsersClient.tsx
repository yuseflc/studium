/* Archivo: src\app\admin\users\AdminUsersClient.tsx
   Descripción: Componente cliente para la gestión de usuarios en el panel de administración. */

"use client";

import { useState, useTransition } from "react";
import { updateUserAction, deleteUserAction } from "@/app/actions/adminActions";
import { IconBan, IconCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import type { AdminUserRow } from "@/lib/api/admin-helpers";
import type { IUser, UserPlan } from "@/models/User";
import DeleteUserDialog from "./DeleteUserDialog";
import BanUserDialog from "./BanUserDialog";

const ROLES: IUser["role"][] = ["student", "teacher", "admin"];
const PLANS: UserPlan[] = ["free", "student", "basic", "premium", "education"];

export default function AdminUsersClient({ users: initial }: { users: AdminUserRow[] }) {
  // Lista de usuarios y estado de edición inline
  const [users, setUsers] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ role: IUser["role"]; plan: UserPlan }>({ role: "student", plan: "free" });
  const [isPending, startTransition] = useTransition();

  // Estado de ban y diálogo de confirmación
  const [isBanPending, startBanTransition] = useTransition();
  const [banTarget, setBanTarget] = useState<AdminUserRow | null>(null);

  // Estado de eliminación y diálogo de confirmación
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const [error, setError] = useState<string | null>(null);

  function startEdit(user: AdminUserRow) {
    setEditing(user._id);
    setForm({ role: user.role, plan: user.plan });
  }

  function handleSave(userId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await updateUserAction(userId, { role: form.role, plan: form.plan });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: form.role, plan: form.plan } : u))
        );
        setEditing(null);
      } catch {
        setError("Error al guardar los cambios.");
      }
    });
  }

  function handleBanConfirm(userId: string) {
    const target = banTarget;
    setError(null);
    startBanTransition(async () => {
      try {
        await updateUserAction(userId, { banned: !target?.banned });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, banned: !target?.banned } : u))
        );
        setBanTarget(null);
      } catch {
        setError("Error al cambiar el estado del usuario.");
        setBanTarget(null);
      }
    });
  }

  function handleDeleteConfirm(userId: string) {
    setError(null);
    startDeleteTransition(async () => {
      try {
        await deleteUserAction(userId);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setDeleteTarget(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al eliminar el usuario.");
        setDeleteTarget(null);
      }
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-base-content mb-6">Gestión de Usuarios</h2>

      {error && (
        <div className="alert alert-error mb-4 text-sm">{error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-base-content/60">
              <th>Usuario</th>
              <th>Rol</th>
              <th>Plan</th>
              <th>Organización</th>
              <th>Estado</th>
              <th>Registrado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={user.banned ? "opacity-50" : ""}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{user.firstName}</span>
                    <span className="text-xs text-base-content/50">{user.email}</span>
                  </div>
                </td>

                {/* Rol */}
                <td>
                  {editing === user._id ? (
                    <select
                      className="select select-sm select-bordered"
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as IUser["role"] }))}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span className="badge badge-soft badge-primary badge-sm capitalize">{user.role}</span>
                  )}
                </td>

                {/* Plan */}
                <td>
                  {editing === user._id ? (
                    <select
                      className="select select-sm select-bordered"
                      value={form.plan}
                      onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value as UserPlan }))}
                    >
                      {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span className="badge badge-soft badge-secondary badge-sm capitalize">{user.plan}</span>
                  )}
                </td>

                <td>
                  <span className="text-xs text-base-content/70">
                    {user.organization?.name ?? <span className="opacity-40">—</span>}
                  </span>
                </td>

                <td>
                  {user.banned ? (
                    <span className="badge badge-soft badge-error badge-sm">Baneado</span>
                  ) : (
                    <span className="badge badge-soft badge-success badge-sm">Activo</span>
                  )}
                </td>

                <td className="text-xs text-base-content/50">{user.createdAt}</td>

                <td>
                  <div className="flex justify-end gap-2">
                    {editing === user._id ? (
                      <>
                        <button
                          className="btn btn-success btn-xs"
                          disabled={isPending}
                          onClick={() => handleSave(user._id)}
                        >
                          <IconCheck size={14} /> Guardar
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setEditing(null)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => startEdit(user)}
                          title="Editar rol y plan"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          className={`btn btn-ghost btn-xs ${user.banned ? "text-success" : "text-warning"}`}
                          disabled={isBanPending}
                          onClick={() => setBanTarget(user)}
                          title={user.banned ? "Desbanear usuario" : "Banear usuario"}
                        >
                          <IconBan size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          disabled={isDeletePending}
                          onClick={() => setDeleteTarget(user)}
                          title="Eliminar usuario"
                        >
                          <IconTrash size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BanUserDialog
        user={banTarget}
        isPending={isBanPending}
        onConfirm={handleBanConfirm}
        onClose={() => setBanTarget(null)}
      />
      <DeleteUserDialog
        user={deleteTarget}
        isPending={isDeletePending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
