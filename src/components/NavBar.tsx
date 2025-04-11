
import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavBar = () => {
  return (
    <header className="bg-white shadow border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-brand-700 font-bold text-xl">Whiteboard Coach</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/practice">
              <Button variant="ghost">Practice</Button>
            </Link>
            <div className="ml-3 relative">
              <div>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <UserCircle className="h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
