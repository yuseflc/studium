import CourseNavbar from "@/components/ui/navbars/CourseNavbar";

export default function ProfilePageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CourseNavbar />
      {children}
    </>
  );
}
