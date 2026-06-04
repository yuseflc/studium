/* Archivo: src\seed\seedDatabase.ts
    Descripción: Script para poblar la base de datos con datos de ejemplo usados en desarrollo. */

// Seed script: crea datos iniciales para desarrollo y pruebas locales
// Úsalo para poblar la base de datos con usuarios, cursos y entregas
import User from '@/models/User';
import Course from '@/models/Course';
// El modelo Subject está deprecado; el seed crea Units directamente
import Unit from '@/models/Unit';
import Resource from '@/models/Resource';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import { connectDB } from '@/lib/database/database';

/**
 * Puebla la base de datos con datos de ejemplo para desarrollo y pruebas.
 * Ejecutar sólo en entornos locales; no usar en producción.
 */
export async function seedDatabase() {
    try {
        await connectDB();

        // Limpiar datos existentes (opcional, pero ayuda si quieres que use los del seed)
        // await User.deleteMany({});
        // await Course.deleteMany({});
        // await Subject.deleteMany({});
        // await Unit.deleteMany({});
        // await Resource.deleteMany({});
        // await Task.deleteMany({});

        // Verificar si ya existen datos para no duplicar el seed
        const existingCourses = await Course.countDocuments();
        if (existingCourses > 0) {
            console.log('Database already has courses, skipping seed...');
            return;
        }

        console.log('Seeding database...');

        // Crear usuarios de ejemplo (un profesor y dos estudiantes)
        const teacher = await User.create({
            email: 'teacher@studium.com',
            firstName: 'Juan',
            password: 'securePassword123',
            role: 'teacher',
            active: true,
            profile: {
                lastName: 'García',
                bio: 'Profesor de desarrollo web',
            },
        });

        const student1 = await User.create({
            email: 'student1@studium.com',
            firstName: 'María',
            password: 'securePassword123',
            role: 'student',
            active: true,
            profile: {
                lastName: 'López',
                bio: 'Estudiante de desarrollo',
            },
        });

        const student2 = await User.create({
            email: 'student2@studium.com',
            firstName: 'Carlos',
            password: 'securePassword123',
            role: 'student',
            active: true,
            profile: {
                lastName: 'Martínez',
            },
        });

        // Crear curso de ejemplo con los estudiantes ya inscritos
        const course = await Course.create({
            title: 'Desarrollo Web Full Stack',
            description: 'Aprende a crear aplicaciones web modernas con React y Node.js',
            ownerId: teacher._id,
            status: 'active',
            subjectIds: [],
            enrolledStudents: [student1._id, student2._id],
        });

        // Crear unidad de ejemplo
        const unit = await Unit.create({
            courseId: course._id,
            title: 'Fundamentos de JavaScript',
            content: 'Conceptos básicos del lenguaje',
            order: 1,
            resourceIds: [],
            taskIds: [],
        });

        // Asegurar que course.unitIds incluya la unidad creada
        await Course.findByIdAndUpdate(course._id, { $addToSet: { unitIds: unit._id } });

        // Crear recurso de ejemplo enlazado a la unidad
        const resource = await Resource.create({
            unitId: unit._id,
            courseId: course._id,
            title: 'Documentación de MDN',
            type: 'link',
            url: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
            description: 'Referencia oficial de JavaScript',
        });

        // Añadir el recurso a la lista de recursos de la unidad
        await Unit.findByIdAndUpdate(
            unit._id,
            { $push: { resourceIds: resource._id } },
            { new: true }
        );

        // Crear tarea de ejemplo con fechas de inicio y entrega
        const task = await Task.create({
            title: 'Primer Proyecto: Calculadora',
            description: 'Crea una calculadora simple con HTML, CSS y JavaScript',
            type: 'project',
            courseId: course._id,
            unitId: unit._id,
            createdById: teacher._id,
            maxPoints: 100,
            criteria: [
                {
                    description: 'Funcionalidad correcta',
                    weight: 60,
                },
                {
                    description: 'Diseño y UX',
                    weight: 40,
                },
            ],
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // hace 7 días
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // en 7 días
            allowLateSubmission: true,
            active: true,
        });

        // Añadir la tarea a la lista de tareas de la unidad
        await Unit.findByIdAndUpdate(unit._id, { $addToSet: { taskIds: task._id } }, { new: true });

        // Crear entregas de ejemplo para los estudiantes
        await Submission.create({
            taskId: task._id,
            studentId: student1._id,
            content: 'He completado la calculadora con todas las operaciones básicas',
            submissionStatus: 'submitted',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        });

        await Submission.create({
            taskId: task._id,
            studentId: student2._id,
            content: 'Entrega en progreso',
            submissionStatus: 'pending',
        });

        console.log('✅ Database seeded successfully');
        console.log(`✅ Created ${[teacher, student1, student2].length} users`);
        console.log(`✅ Created 1 course with 1 subject, 1 unit, 1 resource, and 1 task`);
        console.log(`✅ Created sample submissions`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}