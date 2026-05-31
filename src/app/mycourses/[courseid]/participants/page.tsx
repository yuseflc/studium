/* Archivo: src\app\mycourses\[courseid]\participants\page.tsx
  Descripción: Página de gestión de participantes: lista, invitaciones y permisos. */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/config/auth.config';
import { connectDB } from '@/lib/database/database';
import { User, Course } from '@/models/index';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ParticipantsTable, ParticipantsHeader, ParticipantsSkeleton } from '@/components/ui/participants';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

/** Shape of a User document after .populate() + .lean() */
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  email: string;
}

interface Participant {
  _id: string;
  firstName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  enrolledAt?: Date;
}

export default async function ParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseid: string }>;
  searchParams: Promise<{
    search?: string;
    role?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  await connectDB();

  // 1️⃣ AUTENTICACIÓN
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/login');

  const currentUser = await User.findById(session.user.id).lean();
  if (!currentUser) redirect('/auth/login');

  // 2️⃣ PARÁMETROS
  const { courseid } = await params;
  const filters = await searchParams;

  // 3️⃣ VALIDAR CURSO
  if (!courseid.match(/^[0-9a-fA-F]{24}$/)) notFound();

  const course = await Course.findById(courseid)
    .populate({
      path: 'ownerId',
      select: 'firstName email',
    })
    .populate({
      path: 'teachers',
      select: 'firstName email',
    })
    .populate({
      path: 'enrolledStudents',
      select: 'firstName email',
    })
    .lean();

  if (!course) notFound();

  // 4️⃣ RBAC - VERIFICAR ACCESO
  const owner = course.ownerId as PopulatedUser | null;
  const teachers = (course.teachers || []) as PopulatedUser[];
  const enrolledStudents = (course.enrolledStudents || []) as PopulatedUser[];

  const isOwner = owner?._id?.toString() === session.user.id;
  const isTeacher = teachers.some((t) => t._id?.toString() === session.user.id);
  const isEnrolled = enrolledStudents.some((s) => s._id?.toString() === session.user.id);
  const canAccess = isOwner || isTeacher || isEnrolled || currentUser.role === 'admin';

  if (!canAccess) notFound();

  // 5️⃣ COMPILAR LISTA DE PARTICIPANTES
  const rawParticipants: Participant[] = [];

  // Agregar propietario
  if (owner?._id) {
    rawParticipants.push({
      _id: owner._id.toString(),
      firstName: owner.firstName || 'Unknown',
      email: owner.email || '',
      role: 'teacher',
      enrolledAt: course.createdAt,
    });
  }

  // Agregar profesores adicionales
  teachers.forEach((teacher) => {
    if (teacher._id) {
      rawParticipants.push({
        _id: teacher._id.toString(),
        firstName: teacher.firstName || 'Unknown',
        email: teacher.email || '',
        role: 'teacher',
        enrolledAt: course.createdAt,
      });
    }
  });

  // Agregar estudiantes
  enrolledStudents.forEach((student) => {
    if (student._id) {
      rawParticipants.push({
        _id: student._id.toString(),
        firstName: student.firstName || 'Unknown',
        email: student.email || '',
        role: 'student',
        enrolledAt: course.updatedAt,
      });
    }
  });

  // Deduplicar por _id (por si el propietario también figura en teachers)
  const seen = new Set<string>();
  const participants = rawParticipants.filter((p) => {
    if (seen.has(p._id)) return false;
    seen.add(p._id);
    return true;
  });

  // 6️⃣ APLICAR FILTROS
  let filtered = participants;

  // Búsqueda
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }

  // Filtro por rol
  if (filters.role && ['student', 'teacher'].includes(filters.role)) {
    filtered = filtered.filter((p) => p.role === filters.role);
  }

  // 7️⃣ ORDENAMIENTO
  if (filters.sort === 'name-asc') {
    filtered.sort((a, b) => a.firstName.localeCompare(b.firstName));
  } else if (filters.sort === 'name-desc') {
    filtered.sort((a, b) => b.firstName.localeCompare(a.firstName));
  } else if (filters.sort === 'role') {
    filtered.sort((a, b) => a.role.localeCompare(b.role));
  }

  // 8️⃣ PAGINACIÓN (50 por página)
  const pageSize = 50;
  const pageNum = Math.max(0, (parseInt(filters.page ?? '1', 10) || 1) - 1);
  const paginatedList = filtered.slice(pageNum * pageSize, (pageNum + 1) * pageSize);

  // 9️⃣ ESTADÍSTICAS
  const teacherCount = filtered.filter((p) => p.role === 'teacher').length;
  const studentCount = filtered.filter((p) => p.role === 'student').length;


  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="rounded-lg bg-base-200 p-6 shadow-md">
          <h1 className="text-3xl font-bold text-base-content">Participantes</h1>
          <p className="mt-2 text-sm text-base-content/70">
            {course.title || 'Curso'}
            <span className="ml-3 inline-block rounded bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'participante' : 'participantes'}
            </span>
          </p>
        </div>

        {/* ROL INFO */}
        <div className="rounded-lg bg-info/10 p-4 text-info">
          <p className="text-sm font-medium">
            {isOwner
              ? '👨‍🏫 Propietario del curso - Acceso total'
              : isTeacher
                ? '👨‍🏫 Profesor - Acceso total'
                : '👨‍🎓 Estudiante - Solo lectura'}
          </p>
        </div>

        {/* FILTROS */}
        <ParticipantsHeader
          isTeacher={isOwner || isTeacher}
          participantCount={filtered.length}
          courseId={courseid}
          currentSort={filters.sort}
          currentRole={filters.role}
          currentSearch={filters.search}
        />

        {/* TABLA */}
        {paginatedList.length > 0 ? (
          <Suspense fallback={<ParticipantsSkeleton />}>
            <ParticipantsTable
              participants={paginatedList}
              isTeacher={isOwner || isTeacher}
              courseId={courseid}
            />
          </Suspense>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-base-300 p-12 text-center">
            <p className="text-lg font-semibold text-base-content/60">
              {filters.search
                ? 'No se encontraron resultados'
                : 'No hay participantes'}
            </p>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-base-200 p-4">
            <p className="text-sm font-medium text-base-content/70">Profesores</p>
            <p className="mt-1 text-2xl font-bold text-primary">{teacherCount}</p>
          </div>
          <div className="rounded-lg bg-base-200 p-4">
            <p className="text-sm font-medium text-base-content/70">Estudiantes</p>
            <p className="mt-1 text-2xl font-bold text-secondary">{studentCount}</p>
          </div>
          <div className="rounded-lg bg-base-200 p-4">
            <p className="text-sm font-medium text-base-content/70">Total</p>
            <p className="mt-1 text-2xl font-bold text-base-content">
              {filtered.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
