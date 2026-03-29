import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/ui/Toast';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Brainstormer - Turn Ideas into Developer Documentation',
  description: 'Structured brainstorming tool that guides you through discovery and generates complete developer documentation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
