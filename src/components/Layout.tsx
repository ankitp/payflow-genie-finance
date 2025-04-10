
import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-finance-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
      <footer className="py-4 px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AEPL Payments Dashboard • Finance Manager
        </div>
      </footer>
    </div>
  );
};

export default Layout;
