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

  // Estados locales del formulario
  const [firstName, setFirstName] = useState(user.firstName);
  const [email, setEmail] = useState(user.email);
  const [lastName, setLastName] = useState(user.profile?.lastName || "");
  const [bio, setBio] = useState(user.profile?.bio || "");

  // Traducción de roles directamente en el componente cliente para evitar problemas de serialización
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

  return (
    <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
      <div className="card-body">
        
        <div className="flex justify-between items-center mb-4">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-yellow-400 text-black border-2 border-base-100 shadow-md">
            Detalles del Usuario
          </span>
          
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline gap-1">
              <IconEdit size={16} /> Editar Perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn btn-sm btn-success text-white gap-1">
                <IconDeviceFloppy size={16} /> {loading ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={handleCancel} disabled={loading} className="btn btn-sm btn-ghost gap-1">
                <IconX size={16} /> Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          
          <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
            <IconUser size={30} />
            <div className="flex flex-col w-full">
              {isEditing && <span className="text-xs text-base-content/60">Nombre</span>}
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing || loading}
                className={`input w-full text-base-content ${isEditing ? "input-bordered bg-base-100" : "input-ghost"}`}
                aria-label="Nombre"
              />
            </div>
          </label>

          <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
            <IconMail size={30} />
            <div className="flex flex-col w-full">
              {isEditing && <span className="text-xs text-base-content/60">Email</span>}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing || loading}
                className={`input w-full text-base-content ${isEditing ? "input-bordered bg-base-100" : "input-ghost"}`}
                aria-label="Email"
              />
            </div>
          </label>

          {(user.profile?.lastName || isEditing) && (
            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2">
              <IconUser size={30} />
              <div className="flex flex-col w-full">
                <span className="text-xs text-base-content/60">Apellido</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing || loading}
                  className={`input w-full text-base-content ${isEditing ? "input-bordered bg-base-100" : "input-ghost"}`}
                  aria-label="Apellido"
                />
              </div>
            </label>
          )}

          <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 opacity-75">
            <IconUserCheck size={30} />
            <div className="flex flex-col w-full">
              <span className="text-xs text-base-content/60">Rol (No editable)</span>
              <input
                type="text"
                value={getRoleLabel(user.role)}
                readOnly
                className="input input-ghost w-full text-base-content cursor-not-allowed"
                aria-label="Rol"
              />
            </div>
          </label>

          <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2 text-xs opacity-75">
            <IconKey size={30} />
            <div className="flex flex-col w-full">
              <span className="text-xs text-base-content/60">ID del Usuario (No editable)</span>
              <input
                type="text"
                value={user._id}
                readOnly
                className="input input-ghost input-sm w-full text-xs text-base-content font-mono cursor-not-allowed"
                aria-label="ID de usuario"
              />
            </div>
          </label>

          <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2 opacity-75">
            <IconCalendar size={30} />
            <div className="flex flex-col w-full">
              <span className="text-xs text-base-content/60">Miembro desde (No editable)</span>
              <input
                type="text"
                value={new Date(user.createdAt).toLocaleDateString("es-ES")}
                readOnly
                className="input input-ghost w-full text-base-content cursor-not-allowed"
                aria-label="Fecha de registro"
              />
            </div>
          </label>

          {(user.profile?.bio || isEditing) && (
            <label className="card card-side bg-base-200 border border-base-300 p-4 items-center gap-2 col-span-2">
              <div className="flex flex-col w-full">
                <span className="text-xs text-base-content/60">Biografía</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing || loading}
                  className={`textarea w-full text-base-content ${isEditing ? "textarea-bordered bg-base-100" : "textarea-ghost"}`}
                  rows={3}
                  aria-label="Biografía"
                />
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}