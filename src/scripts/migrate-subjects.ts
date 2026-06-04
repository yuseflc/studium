/* Archivo: src\scripts\migrate-subjects.ts
  Descripción: Script para migrar y normalizar las materias del esquema de datos entre versiones. */

// Script de migración: traslada datos de la colección legacy 'subjects' a la nueva estructura
// Ejecutar con --dry-run para revisar cambios sin aplicarlos
import mongoose from "mongoose";
import Course from "../models/Course";
import Unit from "../models/Unit";
import Task from "../models/Task";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const shouldDelete = process.argv.includes("--delete");

  console.log("Connecting to DB...");
  // Intentar cargar el archivo .env del proyecto si las variables de entorno no están configuradas
  let MONGODB_URI = process.env.MONGODB_URI_PROD || process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const envPath = path.resolve(__dirname, '..', '..', '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const [k, ...rest] = trimmed.split('=');
          const v = rest.join('=').trim();
          if (k === 'MONGODB_URI_PROD' && v) MONGODB_URI = v;
          if (!MONGODB_URI && k === 'MONGODB_URI' && v) MONGODB_URI = v;
          if (!MONGODB_URI && k === 'MONGODB_URI_LOCAL' && v) MONGODB_URI = v;
        }
      }
    } catch (e) {
      // Ignorar error si el archivo .env no existe o no es legible
    }
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not set in environment or .env file");
  }
  await mongoose.connect(String(MONGODB_URI), {
    bufferCommands: false,
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  });

  if (!mongoose.connection.db) {
    throw new Error("Mongoose connection established but database reference is missing");
  }

  // Leer la colección legacy 'subjects' directamente para no depender del modelo Subject
  const subjects = await mongoose.connection.db
    .collection('subjects')
    .find({})
    .toArray();
  console.log(`Found ${subjects.length} subjects`);

  let totalUnitsMoved = 0;
  let totalTasksUpdated = 0;

  for (const subj of subjects) {
    const subjectId = subj._id;
    const courseId = subj.courseId;
    const unitIds = subj.unitIds || [];
    const taskIds = subj.taskIds || [];

    if (unitIds.length > 0) {
      // Añadir las unidades al array unitIds del curso correspondiente
      if (!dryRun) {
        await Course.updateOne(
          { _id: courseId },
          {
            $addToSet: { unitIds: { $each: unitIds } },
            $pull: { subjectIds: subjectId },
          }
        );
      }
      totalUnitsMoved += unitIds.length;
      console.log(`Subject ${subjectId} -> added ${unitIds.length} units to course ${courseId}`);
    } else {
      console.log(`Subject ${subjectId} has no units`);
    }

    // Reasignar las tareas del subject a la primera unidad disponible del curso
    if (taskIds.length > 0) {
      const targetUnitId = unitIds.length > 0 ? unitIds[0] : null;
      for (const tId of taskIds) {
        const task = await Task.findById(tId);
        if (!task) continue;
        if (!task.unitId && targetUnitId) {
          if (!dryRun) {
            task.unitId = targetUnitId;
            await task.save();
          }
          totalTasksUpdated++;
          console.log(`Assigned task ${tId} to unit ${String(targetUnitId)}`);
        }
      }
    }

    // Eliminar el documento subject tras la migración si se pasa el flag --delete
    if (shouldDelete) {
      console.log(`Would delete subject ${subjectId} (already handled or subject model removed)`);
    }
  }

  console.log(`Migration summary: units moved: ${totalUnitsMoved}, tasks reassigned: ${totalTasksUpdated}`);
  if (dryRun) console.log("Dry run: no changes were written.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
