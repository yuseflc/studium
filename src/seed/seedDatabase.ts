import User from '@/models/User';
import Course from '@/models/Course';
import Subject from '@/models/Subject';
import Unit from '@/models/Unit';
import Resource from '@/models/Resource';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import { connectDB } from '@/lib/database/database';

/**
 * MongoDB Seed Function: Initialize database with sample data
 * Run this function to populate MongoDB with initial data for development/testing
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

        // Check if data already exists
        const existingCourses = await Course.countDocuments();
        if (existingCourses > 0) {
            console.log('Database already has courses, skipping seed...');
            return;
        }

        console.log('Seeding database...');

        // Create sample users
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

        // Create sample course
        const course = await Course.create({
            title: 'Desarrollo Web Full Stack',
            description: 'Aprende a crear aplicaciones web modernas con React y Node.js',
            ownerId: teacher._id,
            status: 'active',
            subjectIds: [],
            enrolledStudents: [student1._id, student2._id],
        });

        // Create sample subject
        const subject = await Subject.create({
            courseId: course._id,
            title: 'Fundamentos de JavaScript',
            description: 'Conceptos básicos del lenguaje',
            order: 1,
            unitIds: [],
            taskIds: [],
        });

        // Add subject to course
        await Course.findByIdAndUpdate(
            course._id,
            { $push: { subjectIds: subject._id } },
            { new: true }
        );

        // Create sample unit
        const unit = await Unit.create({
            subjectId: subject._id,
            courseId: course._id,
            title: 'Variables y Tipos de Datos',
            content: 'Aprende sobre var, let, const y los tipos de datos en JavaScript',
            order: 1,
            resourceIds: [],
        });

        // Add unit to subject
        await Subject.findByIdAndUpdate(
            subject._id,
            { $push: { unitIds: unit._id } },
            { new: true }
        );

        // Create sample resource
        const resource = await Resource.create({
            unitId: unit._id,
            courseId: course._id,
            title: 'Documentación de MDN',
            type: 'link',
            url: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
            description: 'Referencia oficial de JavaScript',
        });

        // Add resource to unit
        await Unit.findByIdAndUpdate(
            unit._id,
            { $push: { resourceIds: resource._id } },
            { new: true }
        );

        // Create sample tasks
        const task = await Task.create({
            title: 'Primer Proyecto: Calculadora',
            description: 'Crea una calculadora simple con HTML, CSS y JavaScript',
            type: 'project',
            courseId: course._id,
            subjectId: subject._id,
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
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            allowLateSubmission: true,
            active: true,
        });

        // Add task to subject
        await Subject.findByIdAndUpdate(
            subject._id,
            { $push: { taskIds: task._id } },
            { new: true }
        );

        // Create sample submissions
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