import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from 'react-hot-toast';
import ThemeToggle from '../ThemeToggle';
import Debug from '../Debug';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <Header />
      <main className="flex-grow relative">
        <div className="container mx-auto px-4 py-8 relative z-10">
          {children}
        </div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
      </main>
      <Footer />
      <ThemeToggle />
      <Debug />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'glass !text-white',
          style: {
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#fff',
              secondary: 'rgba(0, 0, 0, 0.3)',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#fff',
              secondary: 'rgba(255, 0, 0, 0.3)',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout; 