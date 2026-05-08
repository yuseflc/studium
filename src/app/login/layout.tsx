import Navbar from '@/components/ui/Navbars/Navbar';
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="min-h-screen w-full"
      style={{
        backgroundColor: 'light' ? '#F8FAFC' : '#0F172A'
      }}
    >
      <Navbar />
      {children}
    </div>
  );
}