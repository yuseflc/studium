import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/config/auth.config";
import { connectDB } from "@/lib/database/database";
import { Course } from "@/models/index";
import { validateCourseAccess } from "@/app/actions/courseActions";
import { getCourseFullStructure } from "@/lib/api/course-helpers";
import ResourceCreationForm from "@/components/ui/resources/ResourceCreationForm";

export const dynamic = "force-dynamic";

type ResourceCreationPageProps = {
  params: Promise<{ courseid: string }>;
  searchParams?: Promise<{ unitId?: string }>;
};

export default async function ResourceCreationPage({ params, searchParams }: ResourceCreationPageProps) {
  const { courseid } = await params;
  const { unitId } = searchParams ? await searchParams : { unitId: undefined };

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const hasAccess = await validateCourseAccess(courseid);
  if (!hasAccess) {
    redirect("/mycourses");
  }

  await connectDB();

  const course = await Course.findById(courseid).select("title description ownerId teachers").lean();
  if (!course) {
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

  const selectedUnit = serializedUnits.find((unit) => unit._id === unitId) || serializedUnits[0];

  return (
    <ResourceCreationForm
      courseId={courseid}
      courseTitle={course.title}
      courseDescription={course.description}
      units={serializedUnits}
      initialUnitId={selectedUnit?._id}
    />
  );
}
