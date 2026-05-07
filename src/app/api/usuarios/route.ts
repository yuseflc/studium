import { connectDB } from "@/lib/database";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, nombre, contraseña, rol = "estudiante" } = body;

    // Validación básica
    if (!email || !nombre || !contraseña) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, nombre y contraseña son requeridos",
        },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return NextResponse.json(
        { success: false, message: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      email,
      nombre,
      contraseña, // En producción, hasher la contraseña con bcrypt
      rol,
    });

    await nuevoUsuario.save();

    // No retornar la contraseña
    const usuarioCreado = nuevoUsuario.toObject();
    delete usuarioCreado.contraseña;

    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
        usuario: usuarioCreado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error al crear usuario",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let query = {};
    if (email) {
      query = { email };
    }

    const usuarios = await User.find(query)
      .select("-contraseña") // Excluir contraseña
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: usuarios.length,
        usuarios,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error al obtener usuarios",
      },
      { status: 500 }
    );
  }
}
