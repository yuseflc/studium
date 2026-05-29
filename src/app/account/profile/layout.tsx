import CourseNavbar from "@/components/ui/Navbars/CourseNavbar";

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
