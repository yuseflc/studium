import CourseNavbar from "@/components/ui/navbars/CourseNavbar";

export default function DetailedCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <CourseNavbar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
