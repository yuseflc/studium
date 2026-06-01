"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/userActions";
import { 
  IconUser, 
  IconMail, 
  IconUserCheck, 
  IconKey, 
  IconCalendar, 
  IconEdit, 
  IconDeviceFloppy, 
  IconX 
} from "@tabler/icons-react";

interface EditProfileFormProps {
  user: {
    _id: string;
    firstName: string;
    email: string;
    role: "student" | "teacher" | "admin";
    createdAt: Date;
    profile?: {
      lastName?: string;
      bio?: string;
    };
  };
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(user.firstName);
  const [email, setEmail] = useState(user.email);
  const [lastName, setLastName] = useState(user.profile?.lastName || "");
  const [bio, setBio] = useState(user.profile?.bio || "");

  const getRoleLabel = (role: string) => {
    if (role === "teacher") return "Profesor";
    if (role === "admin") return "Administrador";
    return "Estudiante";
  };

  const handleSave = async () => {
    if (!firstName.trim() || !email.trim()) {
      alert("El nombre y el correo son obligatorios.");
      return;
    }

    try {
      setLoading(true);
      await updateProfile({
        firstName,
        email,
        lastName: lastName.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      alert("Hubo un error al guardar los cambios.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.firstName);
    setEmail(user.email);
    setLastName(user.profile?.lastName || "");
    setBio(user.profile?.bio || "");
    setIsEditing(false);
  };

  // Estilos comunes para los inputs editables (borde amarillo al enfocar)
  const editInputClass =
    "input input-bordered w-full border-base-300 bg-base-100 focus:border-warning focus:outline-none";

  return (
    <div className="card w-full border border-base-200 bg-base-100 shadow-sm">
      <div className="card-body gap-5 p-6">

        {/* Cabecera de sección */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconUser size={18} />
            </span>
            <h2 className="text-lg font-bold text-base-content">Detalles del usuario</h2>
          </div>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline gap-1.5">
              <IconEdit size={16} /> Editar perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn btn-warning gap-1.5">
                <IconDeviceFloppy size={18} /> {loading ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={handleCancel} disabled={loading} className="btn btn-error btn-outline gap-1.5">
                <IconX size={18} /> Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Grid de campos */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

          {/* Campo: Nombre */}
          <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-base-content/50">
              <IconUser size={14} /> Nombre
            </div>
            {isEditing ? (
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} className={editInputClass} aria-label="Nombre" />
            ) : (
              <p className="break-words text-base text-base-content">{firstName}</p>
            )}
          </div>

          {/* Campo: Correo Electrónico */}
          <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-base-content/50">
              <IconMail size={14} /> Email
            </div>
            {isEditing ? (
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className={editInputClass} aria-label="Email" />
            ) : (
              <p className="break-words text-base text-base-content">{email}</p>
            )}
          </div>

          {/* Campo: Apellido */}
          {(user.profile?.lastName || isEditing) && (
            <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-base-content/50">
                <IconUser size={14} /> Apellido
              </div>
              {isEditing ? (
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} className={editInputClass} aria-label="Apellido" />
              ) : (
                <p className="break-words text-base text-base-content">{lastName}</p>
              )}
            </div>
          )}

          {/* Campo: Rol (no editable) */}
          <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-base-content/50">
              <IconUserCheck size={14} /> Rol
            </div>
            {isEditing ? (
              <input type="text" value={getRoleLabel(user.role)} disabled className={editInputClass} aria-label="Rol" />
            ) : (
              <p className="break-words text-base text-base-content">{getRoleLabel(user.role)}</p>
            )}
          </div>

          {/* Campo: ID único (no editable) */}
          <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 md:col-span-2">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-base-content/50">
              <IconKey size={14} /> ID del usuario
            </div>
            {isEditing ? (
              <input type="text" value={user._id} disabled className={`${editInputClass} font-mono text-sm`} aria-label="ID del usuario" />
            ) : (
              <p className="break-all font-mono text-sm text-base-content/80">{user._id}</p>
            )}
          </div>

          {/* Campo: Miembro desde (no editable) */}
          <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 md:col-span-2">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-base-content/50">
              <IconCalendar size={14} /> Miembro desde
            </div>
            {isEditing ? (
              <input type="text" value={new Date(user.createdAt).toLocaleDateString("es-ES")} disabled className={editInputClass} aria-label="Miembro desde" />
            ) : (
              <p className="text-base text-base-content">{new Date(user.createdAt).toLocaleDateString("es-ES")}</p>
            )}
          </div>

          {/* Campo: Biografía */}
          {(user.profile?.bio || isEditing) && (
            <div className="rounded-xl border border-base-200 bg-base-200/40 px-4 py-3 md:col-span-2">
              <div className="mb-1.5 text-xs font-medium text-base-content/50">Biografía</div>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  className="textarea textarea-bordered min-h-[90px] w-full resize-none border-base-300 bg-base-100 focus:border-warning focus:outline-none"
                  rows={3}
                  aria-label="Biografía"
                />
              ) : (
                <p className="whitespace-pre-line break-words text-base leading-relaxed text-base-content">{bio}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}