import { redirect } from "next/navigation";

export default async function MyCoursePage({ params }: { params: Promise<{ courseid: string; resourceid: string }> }) {
  const { courseid, resourceid } = await params;

  redirect(`/mycourses/${courseid}/resources/${resourceid}`);
}