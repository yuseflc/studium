import React from 'react';
import Navbar from '@/components/ui/navbars/Navbar'; 

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-base-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}