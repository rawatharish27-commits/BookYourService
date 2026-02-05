import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LogOut, User as UserIcon, Shield, Briefcase, Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getHomeLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case Role.CLIENT: return '/client';
      case Role.PROVIDER: return '/provider';
      case Role.ADMIN: return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getHomeLink()} className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">BookYourService</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isAuthenticated && user && (
              <>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  {user.role === Role.ADMIN && <Shield className="w-4 h-4" />}
                  {user.role === Role.PROVIDER && <Briefcase className="w-4 h-4" />}
                  {user.role === Role.CLIENT && <UserIcon className="w-4 h-4" />}
                  {user.name}
                </span>

                {user.role === Role.CLIENT && (
                  <Link to="/client/bookings" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    My Bookings
                  </Link>
                )}

                {user.role === Role.PROVIDER && (
                  <>
                     <Link to="/provider" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/provider/bookings" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                      Bookings
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
          
           <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
        </div>
      </div>
      
       {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 pb-2">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {isAuthenticated && user ? (
              <>
                <div className="text-sm font-bold text-gray-800 mb-2">Hello, {user.name}</div>
                 {user.role === Role.CLIENT && (
                  <Link to="/client/bookings" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                    My Bookings
                  </Link>
                )}
                 {user.role === Role.PROVIDER && (
                  <>
                    <Link to="/provider" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                      Dashboard
                    </Link>
                    <Link to="/provider/bookings" className="block text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium">
                      Bookings
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
                <div className="text-gray-500">Please login to continue</div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};