"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

interface UpdateProfileInput {
  firstName: string;
  email: string;
  lastName?: string;
  bio?: string;
}

export async function updateProfile(data: UpdateProfileInput) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }

  await connectDB();

  // Buscamos rigurosamente al usuario dueño de la sesión actual por seguridad
  const currentUser = await User.findOne({ email: session.user.email });
  if (!currentUser) {
    throw new Error("Usuario no encontrado");
  }

  // Modificamos estrictamente solo los campos permitidos
  currentUser.firstName = data.firstName;
  currentUser.email = data.email;
  
  if (!currentUser.profile) {
    currentUser.profile = {};
  }
  
  currentUser.profile.lastName = data.lastName;
  currentUser.profile.bio = data.bio;

  await currentUser.save();

  // Forzamos a Next.js a refrescar los datos de la página SSR en el cliente
  revalidatePath("/account/profile");

  return { success: true };
}