/* Archivo: src\models\Organization.ts
  Descripción: Modelo de datos `Organization` — organizaciones educativas con miembros. */

// Modelo Organization: esquema Mongoose para organizaciones educativas
import mongoose from "mongoose";

// Interfaz para la organización
export interface IOrganization {
  _id: mongoose.Types.ObjectId;
  name: string; // Nombre de la organización
  description?: string; // Descripción
  logoUrl?: string; // URL del logotipo
  members: mongoose.Types.ObjectId[]; // Miembros (usuarios)
  createdBy: mongoose.Types.ObjectId; // Admin que la creó
  createdAt: Date;
  updatedAt: Date;
}

// Esquema de la organización
const OrganizationSchema = new mongoose.Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, "El nombre de la organización es requerido"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [120, "El nombre no puede exceder 120 caracteres"],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    logoUrl: {
      type: String,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índices
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ members: 1 });
OrganizationSchema.index({ createdBy: 1 });

// Prevenir que se sobrescriba el modelo si ya existe
export default mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
