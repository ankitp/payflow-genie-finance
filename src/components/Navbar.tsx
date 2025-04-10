
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database, FileText } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="w-full bg-white shadow-sm py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-finance-primary flex items-center gap-2">
          <img 
            src="/lovable-uploads/c14a1156-f01e-480b-8654-b5b8e7f2779a.png" 
            alt="Abhaya Exports Logo" 
            className="h-10 w-auto" 
          />
          AEPL Payments Dashboard
        </Link>
        <div className="flex space-x-2">
          <Button
            variant={location.pathname === "/" ? "default" : "outline"}
            className={location.pathname === "/" ? "bg-finance-primary" : ""}
            asChild
          >
            <Link to="/" className="flex items-center gap-1">
              <FileText size={16} />
              Payment Generator
            </Link>
          </Button>
          <Button
            variant={location.pathname === "/beneficiaries" ? "default" : "outline"}
            className={location.pathname === "/beneficiaries" ? "bg-finance-primary" : ""}
            asChild
          >
            <Link to="/beneficiaries" className="flex items-center gap-1">
              <Database size={16} />
              Beneficiaries
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
