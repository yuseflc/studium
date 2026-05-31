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

  return (
    <div className="card mb-5 bg-base-100 shadow-lg border-2 border-base-200 w-full max-w-3xl">
      <div className="card-body p-5">
        
        {/* Cabecera equilibrada */}
        <div className="flex justify-between items-center mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-yellow-400 text-black border-2 border-base-100 shadow-md">
            Detalles del Usuario
          </span>
          
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline gap-1.5 font-bold">
              <IconEdit size={16} /> Editar Perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn btn-sm btn-success text-white gap-1.5 font-bold">
                <IconDeviceFloppy size={16} /> {loading ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={handleCancel} disabled={loading} className="btn btn-sm btn-ghost gap-1.5 font-bold">
                <IconX size={16} /> Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Grid de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          
          {/* Campo: Nombre */}
          <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2">
            <IconUser size={22} className="text-base-content/60 shrink-0" />
            <div className="flex flex-col w-full">
              {isEditing && <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Nombre</span>}
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing || loading}
                className={`input input-md h-9 w-full text-base p-0 bg-transparent text-base-content focus:outline-none disabled:bg-transparent ${isEditing ? "border-b border-base-300 rounded-none focus:border-primary" : "border-none"}`}
                aria-label="Nombre"
              />
            </div>
          </div>

          {/* Campo: Correo Electrónico */}
          <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2">
            <IconMail size={22} className="text-base-content/60 shrink-0" />
            <div className="flex flex-col w-full">
              {isEditing && <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Email</span>}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing || loading}
                className={`input input-md h-9 w-full text-base p-0 bg-transparent text-base-content focus:outline-none disabled:bg-transparent ${isEditing ? "border-b border-base-300 rounded-none focus:border-primary" : "border-none"}`}
                aria-label="Email"
              />
            </div>
          </div>

          {/* Campo: Apellido */}
          {(user.profile?.lastName || isEditing) && (
            <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2">
              <IconUser size={22} className="text-base-content/60 shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Apellido</span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing || loading}
                  className={`input input-md h-9 w-full text-base p-0 bg-transparent text-base-content focus:outline-none disabled:bg-transparent ${isEditing ? "border-b border-base-300 rounded-none focus:border-primary" : "border-none"}`}
                  aria-label="Apellido"
                />
              </div>
            </div>
          )}

          {/* Campo: Rol */}
          <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2 opacity-80">
            <IconUserCheck size={22} className="text-base-content/60 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Rol</span>
              <input
                type="text"
                value={getRoleLabel(user.role)}
                readOnly
                className="input input-md h-9 w-full text-base p-0 bg-transparent text-base-content border-none cursor-not-allowed"
                aria-label="Rol"
              />
            </div>
          </div>

          {/* Campo: ID único */}
          <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2 col-span-1 md:col-span-2 opacity-75">
            <IconKey size={22} className="text-base-content/60 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">ID del Usuario</span>
              <input
                type="text"
                value={user._id}
                readOnly
                className="input input-sm h-8 w-full text-sm p-0 bg-transparent text-base-content font-mono border-none cursor-not-allowed"
                aria-label="ID de usuario"
              />
            </div>
          </div>

          {/* Campo: Miembro desde */}
          <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-xl px-4 py-2 col-span-1 md:col-span-2 opacity-80">
            <IconCalendar size={22} className="text-base-content/60 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-1">Miembro desde</span>
              <input
                type="text"
                value={new Date(user.createdAt).toLocaleDateString("es-ES")}
                readOnly
                className="input input-md h-9 w-full text-base p-0 bg-transparent text-base-content border-none cursor-not-allowed"
                aria-label="Fecha de registro"
              />
            </div>
          </div>

          {/* Campo: Biografía */}
          {(user.profile?.bio || isEditing) && (
            <div className="bg-base-200 border border-base-300 rounded-xl px-4 py-3 col-span-1 md:col-span-2">
              <div className="flex flex-col w-full">
                <span className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider leading-none mb-2">Biografía</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing || loading}
                  className={`textarea w-full text-base bg-transparent text-base-content focus:outline-none disabled:bg-transparent min-h-[80px] resize-y ${isEditing ? "textarea-bordered bg-base-100 p-2" : "border-none p-0"}`}
                  rows={3}
                  aria-label="Biografía"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}