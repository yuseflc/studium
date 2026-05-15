import mongoose from "mongoose";

interface ISession {
    sessionToken: string;
    userId: mongoose.Types.ObjectId;
    expires: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const SessionSchema = new mongoose.Schema<ISession>(
    {
        sessionToken: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        expires: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Crear índice TTL para borrar sesiones expiradas automáticamente
SessionSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session ||
    mongoose.model<ISession>("Session", SessionSchema);
