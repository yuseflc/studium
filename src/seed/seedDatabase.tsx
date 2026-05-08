import User from '@/models/User';
import Course from '@/models/Course';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import { connectDB } from '@/lib/database';



/**
 * MongoDB Seed Function: Initialize database with sample data
 * Run this function to populate MongoDB with initial data for development/testing
 */
export async function seedDatabase() {
    try {
        await connectDB();

        // Check if data already exists
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log('Database already seeded, skipping...');
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

        // Create sample courses
        const course = await Course.create({
            title: 'Desarrollo Web Full Stack',
            description: 'Aprende a crear aplicaciones web modernas con React y Node.js',
            ownerId: teacher._id,
            status: 'active',
            subjects: [
                {
                    title: 'Fundamentos de JavaScript',
                    description: 'Conceptos básicos del lenguaje',
                    order: 1,
                    units: [
                        {
                            title: 'Variables y Tipos de Datos',
                            content: 'Aprende sobre var, let, const y los tipos de datos en JavaScript',
                            order: 1,
                            resources: [
                                {
                                    title: 'Documentación de MDN',
                                    type: 'link',
                                    url: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
                                    description: 'Referencia oficial de JavaScript',
                                },
                            ],
                        },
                    ],
                    taskIds: [],
                },
            ],
            enrolledStudents: [student1._id, student2._id],
        });

        // Create sample tasks
        const task = await Task.create({
            title: 'Primer Proyecto: Calculadora',
            description: 'Crea una calculadora simple con HTML, CSS y JavaScript',
            type: 'project',
            courseId: course._id,
            subjectId: course.subjects[0]._id,
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
        console.log(`✅ Created 1 course with students enrolled`);
        console.log(`✅ Created 1 task with sample submissions`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}