/* Archivo: src\lib\task-assignment.ts
  Descripción: Lógica para asignación de tareas a participantes (reglas y utilidades). */

// Helpers para asignación automática de tareas y lógica relacionada
// Contiene rutinas que migran/reenlazan tareas entre cursos y unidades
import mongoose from "mongoose";
import { connectDB } from "@/lib/database/database";
import Course from "@/models/Course";
import Task from "@/models/Task";
import Submission from "@/models/Submission";
import Unit from "@/models/Unit";

export type AssignmentMode = "all" | "manual" | "filtered";
export type AssignmentFilterKind = "failing_average" | "below_threshold" | "failed_task";

export interface TaskCreationStudent {
  _id: string;
  firstName: string;
  email: string;
  profilePicture?: string;
  averageGrade: number | null;
  failedTaskCount: number;
  hasFailedTask: boolean;
}

export interface TaskCreationUnit {
  _id: string;
  title: string;
  content?: string;
  order?: number;
}

export interface TaskCreationContext {
  course: {
    _id: string;
    title: string;
    description?: string;
    ownerId: string;
    teachers: string[];
    enrolledStudents: string[];
  };
  units: TaskCreationUnit[];
  students: TaskCreationStudent[];
}

function toStringId(value: unknown) {
  return value ? String(value) : "";
}

export async function getTaskCreationContext(courseId: string): Promise<TaskCreationContext | null> {
  await connectDB();

  const course = await Course.findById(courseId)
    .populate({ path: "enrolledStudents", select: "firstName email profile.profilePicture" })
    .select("title description ownerId teachers enrolledStudents")
    .lean();

  if (!course) {
    return null;
  }

  const units = await Unit.find({ courseId })
    .sort({ order: 1 })
    .select("_id title content order")
    .lean();

  const tasks = await Task.find({ courseId })
    .select("_id")
    .lean();

  const taskIds = tasks.map((task) => task._id);
  const submissions = taskIds.length > 0
    ? await Submission.find({ taskId: { $in: taskIds } })
        .select("taskId studentId grade submissionStatus")
        .lean()
    : [];

  const submissionsByStudent = new Map<string, { grade: number | undefined; taskId: string }[]>();

  for (const submission of submissions) {
    const studentId = toStringId(submission.studentId);
    if (!studentId) continue;

    const bucket = submissionsByStudent.get(studentId) || [];
    bucket.push({
      grade: typeof submission.grade === "number" ? submission.grade : undefined,
      taskId: toStringId(submission.taskId),
    });
    submissionsByStudent.set(studentId, bucket);
  }

  const enrolledStudents = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
  const students: TaskCreationStudent[] = enrolledStudents.map((student: any) => {
    const studentId = toStringId(student?._id);
    const studentSubmissions = submissionsByStudent.get(studentId) || [];
    const gradedSubmissions = studentSubmissions.filter((submission) => typeof submission.grade === "number");
    const grades = gradedSubmissions.map((submission) => submission.grade as number);
    const averageGrade = grades.length > 0
      ? Number((grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(2))
      : null;
    const failedTaskCount = grades.filter((grade) => grade < 5).length;

    return {
      _id: studentId,
      firstName: student?.firstName || "Usuario",
      email: student?.email || "",
      profilePicture: student?.profile?.profilePicture,
      averageGrade,
      failedTaskCount,
      hasFailedTask: failedTaskCount > 0,
    };
  });

  return {
    course: {
      _id: toStringId(course._id),
      title: course.title,
      description: course.description,
      ownerId: toStringId(course.ownerId),
      teachers: Array.isArray(course.teachers) ? course.teachers.map((teacherId: any) => toStringId(teacherId)) : [],
      enrolledStudents: students.map((student) => student._id),
    },
    units: units.map((unit: any) => ({
      _id: toStringId(unit._id),
      title: unit.title,
      content: unit.content,
      order: unit.order,
    })),
    students,
  };
}

export function resolveAssignmentRecipients(
  students: TaskCreationStudent[],
  input: {
    assignmentMode: AssignmentMode;
    assignedStudentIds?: string[];
    assignmentFilterKind?: AssignmentFilterKind;
    assignmentThreshold?: number;
  }
) {
  const studentMap = new Map(students.map((student) => [student._id, student]));

  if (input.assignmentMode === "all") {
    return {
      studentIds: students.map((student) => student._id),
      label: "all",
    };
  }

  if (input.assignmentMode === "manual") {
    const validIds = (input.assignedStudentIds || []).filter((studentId) => studentMap.has(studentId));
    return {
      studentIds: Array.from(new Set(validIds)),
      label: "manual",
    };
  }

  if (input.assignmentFilterKind === "failing_average") {
    return {
      studentIds: students.filter((student) => student.averageGrade !== null && student.averageGrade < 5).map((student) => student._id),
      label: "failing_average",
    };
  }

  if (input.assignmentFilterKind === "below_threshold") {
    const threshold = typeof input.assignmentThreshold === "number" ? input.assignmentThreshold : 5;
    return {
      studentIds: students.filter((student) => student.averageGrade !== null && student.averageGrade < threshold).map((student) => student._id),
      label: "below_threshold",
    };
  }

  return {
    studentIds: students.filter((student) => student.hasFailedTask).map((student) => student._id),
    label: "failed_task",
  };
}