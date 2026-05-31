/* Archivo: src\models\User.ts
  Descripción: Modelo de datos `User` (esquema Mongoose) con campos básicos y métodos relacionados. */

// Modelo User: esquema Mongoose y tipos para usuarios de la aplicación
// Incluye roles, perfiles y utilidades como comparación de contraseña
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Interfaz para el perfil del usuario
export interface IProfile {
  lastName?: string; // Apellido
  profilePicture?: string; // URL de la foto de perfil
  bio?: string; // Biografía
}

// Interfaz para cuentas de terceros (por ahora deshabilitado)

export interface IThirdParty {
  provider: "google" | "github" | string; // Proveedor externo
  externalId: string; // ID del usuario en el proveedor externo
  accessToken?: string; // Token de acceso
  refreshToken?: string; // Token de refresco
  expiresAt?: Date; // Fecha de expiración del token
  email?: string; // Email del proveedor (puede diferir del email principal)
  name?: string; // Nombre del proveedor
  profilePicture?: string; // Foto de perfil del proveedor
  connectedAt: Date; // Fecha de conexión
}


// Interfaz para el usuario
export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string; // Correo electrónico
  firstName: string; // Nombre
  password: string; // Contraseña
  role: "student" | "teacher" | "admin"; // Rol: estudiante, profesor, administrador
  active: boolean; // Activo
  profile: IProfile; // Perfil
  enrolledCourses: mongoose.Types.ObjectId[]; // Cursos donde el usuario está inscrito (estudiante)
  createdCourses: mongoose.Types.ObjectId[]; // Cursos creados por el usuario (profesor/admin)
  thirdparty?: IThirdParty[]; // Cuentas de terceros vinculadas (Google, GitHub, etc.)
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
  comparePassword?(candidatePassword: string): Promise<boolean>; // Método para comparar contraseñas
  addThirdParty?(thirdPartyData: IThirdParty): IThirdParty; // Método para agregar cuenta de terceros
  removeThirdParty?(provider: string): boolean; // Método para remover cuenta de terceros
  getThirdParty?(provider: string): IThirdParty | null; // Método para obtener cuenta de terceros
  hasThirdParty?(provider: string): boolean; // Método para verificar si tiene cuenta de terceros
}

// Esquema del usuario
const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "El correo electrónico es requerido"], // Correo requerido
      unique: true, // Debe ser único
      lowercase: true, // Convierte a minúsculas
      trim: true, // Elimina espacios al inicio y final
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor proporcione un correo electrónico válido", // Validación de formato
      ],
    },
    firstName: {
      type: String,
      required: [true, "El nombre es requerido"], // Nombre requerido
      trim: true, // Elimina espacios al inicio y final
      minlength: [2, "El nombre debe tener al menos 2 caracteres"], // Longitud mínima
      maxlength: [100, "El nombre no puede exceder 100 caracteres"], // Longitud máxima
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"], // Contraseña requerida
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"], // Longitud mínima
      select: false, // No devuelve la contraseña por defecto
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"], // Valores permitidos: estudiante, profesor, administrador
      default: "student", // Valor por defecto: estudiante
    },
    active: {
      type: Boolean,
      default: true, // Valor por defecto: true
    },
    profile: {
      lastName: {
        type: String,
        trim: true, // Elimina espacios al inicio y final
        maxlength: [100, "El apellido no puede exceder 100 caracteres"], // Longitud máxima
      },
      profilePicture: String, // URL de la foto de perfil
      bio: {
        type: String,
        maxlength: [500, "La biografía no puede exceder 500 caracteres"], // Longitud máxima
      },
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course", // Referencia al modelo Course
      },
    ],
    createdCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course", // Referencia al modelo Course
      },
    ],
    thirdparty: [
      {
        provider: {
          type: String,
          enum: ["google", "github"],
          required: true,
        },
        externalId: {
          type: String,
          required: true,
        },
        accessToken: String,
        refreshToken: String,
        expiresAt: Date,
        email: {
          type: String,
          lowercase: true,
          trim: true,
        },
        name: String,
        profilePicture: String,
        connectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Middleware pre-guardado: Encriptar contraseña antes de guardar
UserSchema.pre('save', async function () {
  if (this.isModified('password')) { // Si la contraseña fue modificada
    const salt = await bcrypt.genSalt(10); // Genera salt
    this.password = await bcrypt.hash(this.password, salt); // Encripta la contraseña
  }

  // Validar que no haya proveedores duplicados en thirdparty
  if (this.thirdparty && this.thirdparty.length > 0) {
    const providers = new Set();
    for (const tp of this.thirdparty) {
      if (providers.has(tp.provider)) {
        throw new Error(`No puede tener múltiples cuentas del proveedor: ${tp.provider}`);
      }
      providers.add(tp.provider);
    }
  }
});

// Middleware pre-búsqueda: Excluir usuarios desactivados por defecto
UserSchema.pre(/^find/, function (this: mongoose.Query<IUser[], IUser>) {
  this.where('active').equals(true); // Solo usuarios activos
});

// Virtual: Nombre completo
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.profile?.lastName || ''}`.trim(); // Concatena nombre y apellido
});

// Virtual: Cantidad de inscripciones
UserSchema.virtual('enrollmentCount').get(function () {
  return this.enrolledCourses?.length || 0; // Retorna la longitud del array de cursos inscritos
});

// Habilitar virtuales en toJSON
UserSchema.set('toJSON', { virtuals: true });

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password); // Compara la contraseña candidata con la almacenada
};

// Método para agregar una cuenta de terceros
UserSchema.methods.addThirdParty = function (thirdPartyData: IThirdParty): IThirdParty {
  // Verificar si el proveedor ya existe
  const existingIndex = this.thirdparty?.findIndex(
    (tp: IThirdParty) => tp.provider === thirdPartyData.provider
  );

  if (existingIndex !== undefined && existingIndex >= 0) {
    // Actualizar si ya existe
    this.thirdparty![existingIndex] = {
      ...this.thirdparty![existingIndex],
      ...thirdPartyData,
      connectedAt: this.thirdparty![existingIndex].connectedAt,
    };
    return this.thirdparty![existingIndex];
  }

  // Crear nuevo si no existe
  if (!this.thirdparty) {
    this.thirdparty = [];
  }
  this.thirdparty.push(thirdPartyData);
  return thirdPartyData;
};

// Método para remover una cuenta de terceros
UserSchema.methods.removeThirdParty = function (provider: string): boolean {
  if (!this.thirdparty) return false;
  const initialLength = this.thirdparty.length;
  this.thirdparty = this.thirdparty.filter((tp: IThirdParty) => tp.provider !== provider);
  return this.thirdparty.length < initialLength;
};

// Método para obtener una cuenta de terceros
UserSchema.methods.getThirdParty = function (provider: string): IThirdParty | null {
  if (!this.thirdparty) return null;
  return this.thirdparty.find((tp: IThirdParty) => tp.provider === provider) || null;
};

// Método para verificar si tiene una cuenta de terceros vinculada
UserSchema.methods.hasThirdParty = function (provider: string): boolean {
  if (!this.thirdparty) return false;
  return this.thirdparty.some((tp: IThirdParty) => tp.provider === provider);
};

// Índices para optimizar consultas
UserSchema.index({ email: 1 }); // Índice por correo electrónico
UserSchema.index({ role: 1 }); // Índice por rol
UserSchema.index({ enrolledCourses: 1 }); // Índice por cursos inscritos
UserSchema.index({ createdCourses: 1 }); // Índice por cursos creados
UserSchema.index({ active: 1, role: 1 }); // Índice compuesto por activo y rol
UserSchema.index({ "thirdparty.provider": 1, "thirdparty.externalId": 1 }); // Índice para búsquedas de terceros
UserSchema.index({ "thirdparty.provider": 1 }); // Índice por proveedor de terceros

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema); // Exporta el modelo User