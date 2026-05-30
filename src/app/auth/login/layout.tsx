import Navbar from '@/components/ui/navbars/Navbar';
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-base-300">
      <Navbar />
      {children}
    </div>
  );
}