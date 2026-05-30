import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import mongoose from "mongoose";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { Course, Resource, User } from "@/models/index";
import { getCourseFullStructure } from "@/lib/api/course-helpers";
import ResourceCreationForm from "@/components/ui/resources/ResourceCreationForm";

export const dynamic = "force-dynamic";

type ResourceEditPageProps = {
  params: Promise<{ courseid: string; resourceId: string }>;
};

export default async function ResourceEditPage({ params }: ResourceEditPageProps) {
  const { courseid, resourceId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  await connectDB();

  const currentUser = await User.findOne({ email: session.user.email }).lean();
  if (!currentUser) {
    redirect("/auth/login");
  }

  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    notFound();
  }

  const course = await Course.findById(courseid).select("ownerId teachers title description").lean();
  if (!course) {
    notFound();
  }

  const currentUserId = currentUser._id.toString();
  const isOwner = String(course.ownerId) === currentUserId;
  const isTeacher = Array.isArray(course.teachers) && course.teachers.some((teacherId: any) => String(teacherId) === currentUserId);

  if (!isOwner && !isTeacher) {
    redirect(`/mycourses/${courseid}/resources/${resourceId}`);
  }

  const resource = await Resource.findById(resourceId).lean();
  if (!resource || resource.courseId.toString() !== courseid) {
    notFound();
  }

  const structure = await getCourseFullStructure(courseid);
  if (!structure?.units?.length) {
    notFound();
  }

  const serializedUnits = structure.units.map((unit) => ({
    _id: String(unit._id),
    title: unit.title,
    content: unit.content,
    order: unit.order,
  }));

  const selectedUnit = serializedUnits.find((unit) => unit._id === String(resource.unitId)) || serializedUnits[0];

  return (
    <ResourceCreationForm
      mode="edit"
      resourceId={String(resource._id)}
      backHref={`/mycourses/${courseid}/resources/${resourceId}`}
      backLabel="Volver a la vista previa"
      courseId={courseid}
      courseTitle={course.title}
      courseDescription={course.description}
      units={serializedUnits}
      initialUnitId={selectedUnit?._id}
      initialTitle={resource.title}
      initialDescription={resource.type === "text" ? "" : resource.description || ""}
      initialContent={resource.type === "text" ? (resource.content || resource.description || "") : ""}
      initialResourceMode={resource.type}
      initialResourceUrl={resource.url || ""}
    />
  );
}
