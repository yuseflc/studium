"use client";

import { useState, useTransition } from "react";
import {
  createOrganizationAction,
  updateOrganizationAction,
  addMemberToOrganizationAction,
  removeMemberFromOrganizationAction,
  deleteOrganizationAction,
} from "@/app/actions/adminActions";
import { IconPlus, IconTrash, IconUserMinus, IconUserPlus, IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import UserSearchSelector from "./UserSearchSelector";
import type { AdminOrgRow } from "@/lib/api/admin-helpers";

export default function AdminOrgsClient({ orgs: initial }: { orgs: AdminOrgRow[] }) {
  const [orgs, setOrgs] = useState<AdminOrgRow[]>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Formulario nueva org
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Edición de org
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string }>({ name: "", description: "" });

  // Qué org tiene abierto el selector de usuario
  const [addingMemberTo, setAddingMemberTo] = useState<string | null>(null);

  function startEditOrg(org: AdminOrgRow) {
    setEditingOrg(org._id);
    setEditForm({ name: org.name, description: org.description ?? "" });
  }

  function handleSaveOrg(orgId: string) {
    if (!editForm.name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateOrganizationAction(orgId, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
        });
        setOrgs((prev) =>
          prev.map((o) =>
            o._id === orgId
              ? { ...o, name: editForm.name.trim(), description: editForm.description.trim() || null }
              : o
          )
        );
        setEditingOrg(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al guardar los cambios.");
      }
    });
  }

  function handleCreateOrg() {
    if (!newName.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await createOrganizationAction({ name: newName.trim(), description: newDesc.trim() || undefined });
        setNewName("");
        setNewDesc("");
        setShowCreate(false);
        window.location.reload();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al crear la organización.");
      }
    });
  }

  function handleAddMember(orgId: string, user: AdminOrgRow["members"][number]) {
    setError(null);
    setAddingMemberTo(null);
    startTransition(async () => {
      try {
        await addMemberToOrganizationAction(orgId, user._id);
        setOrgs((prev) =>
          prev.map((o) =>
            o._id === orgId
              ? { ...o, members: [...o.members, { _id: user._id, firstName: user.firstName, email: user.email }] }
              : o
          )
        );
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al añadir el miembro.");
      }
    });
  }

  function handleRemoveMember(orgId: string, userId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await removeMemberFromOrganizationAction(orgId, userId);
        setOrgs((prev) =>
          prev.map((o) =>
            o._id === orgId ? { ...o, members: o.members.filter((m) => m._id !== userId) } : o
          )
        );
      } catch {
        setError("Error al eliminar el miembro.");
      }
    });
  }

  function handleDeleteOrg(orgId: string) {
    if (!confirm("¿Eliminar esta organización? Los miembros perderán su asignación.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteOrganizationAction(orgId);
        setOrgs((prev) => prev.filter((o) => o._id !== orgId));
      } catch {
        setError("Error al eliminar la organización.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-base-content">Organizaciones</h2>
        <button
          className="btn btn-primary btn-sm gap-2"
          onClick={() => setShowCreate((v) => !v)}
        >
          <IconPlus size={16} />
          Nueva organización
        </button>
      </div>

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {/* Formulario crear */}
      {showCreate && (
        <div className="card bg-base-100 border border-base-300 shadow-sm p-5 mb-6">
          <h3 className="font-bold mb-4">Nueva organización educativa</h3>
          <div className="flex flex-col gap-3">
            <input
              className="input input-bordered"
              placeholder="Nombre de la organización *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered"
              placeholder="Descripción (opcional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                disabled={isPending || !newName.trim()}
                onClick={handleCreateOrg}
              >
                Crear
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de organizaciones */}
      <div className="space-y-4">
        {orgs.length === 0 && (
          <p className="text-base-content/50 text-sm">No hay organizaciones todavía.</p>
        )}

        {orgs.map((org) => (
          <div key={org._id} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                {editingOrg === org._id ? (
                  <div className="flex flex-col gap-2 flex-1">
                    <input
                      className="input input-sm input-bordered w-full font-bold"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Nombre *"
                      autoFocus
                    />
                    <input
                      className="input input-sm input-bordered w-full text-sm"
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Descripción (opcional)"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold">{org.name}</h3>
                    {org.description && (
                      <p className="text-sm text-base-content/60 mt-0.5">{org.description}</p>
                    )}
                    <p className="text-xs text-base-content/40 mt-1">
                      Creada el {org.createdAt}
                      {org.createdBy && ` por ${org.createdBy.firstName}`}
                    </p>
                  </div>
                )}

                <div className="flex gap-1 shrink-0">
                  {editingOrg === org._id ? (
                    <>
                      <button
                        className="btn btn-success btn-xs gap-1"
                        disabled={isPending || !editForm.name.trim()}
                        onClick={() => handleSaveOrg(org._id)}
                      >
                        <IconCheck size={13} /> Guardar
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => setEditingOrg(null)}
                      >
                        <IconX size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => startEditOrg(org)}
                        title="Editar organización"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        disabled={isPending}
                        onClick={() => handleDeleteOrg(org._id)}
                        title="Eliminar organización"
                      >
                        <IconTrash size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Miembros */}
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                  Miembros ({org.members.length})
                </p>
                {org.members.length === 0 ? (
                  <p className="text-xs text-base-content/40">Sin miembros asignados.</p>
                ) : (
                  <ul className="space-y-1">
                    {org.members.map((m) => (
                      <li
                        key={m._id}
                        className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <span>
                          <span className="font-semibold">{m.firstName}</span>{" "}
                          <span className="text-base-content/50 text-xs">{m.email}</span>
                        </span>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          disabled={isPending}
                          onClick={() => handleRemoveMember(org._id, m._id)}
                          title="Quitar de la organización"
                        >
                          <IconUserMinus size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Selector de usuario con búsqueda */}
                {addingMemberTo === org._id ? (
                  <UserSearchSelector
                    onSelect={(user) => handleAddMember(org._id, user)}
                    onCancel={() => setAddingMemberTo(null)}
                  />
                ) : (
                  <button
                    className="btn btn-s mt-3 gap-1"
                    onClick={() => setAddingMemberTo(org._id)}
                  >
                    <IconUserPlus size={13} />
                    Añadir miembro
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
