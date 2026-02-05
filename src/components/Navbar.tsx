
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { LogOut, User as UserIcon, Shield, Briefcase, Menu, X, LayoutGrid, Info, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50';

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                 <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">BookYourService</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/')}`}>Home</Link>
            <Link to="/categories" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/categories')}`}>Category</Link>
            <Link to="/about" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/about')}`}>About Us</Link>
            <Link to="/privacy" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/privacy')}`}>Privacy</Link>

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                  {user.role === Role.ADMIN && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
                  {user.role === Role.PROVIDER && <Briefcase className="w-3.5 h-3.5 text-blue-600" />}
                  {user.role === Role.CLIENT && <UserIcon className="w-3.5 h-3.5 text-green-600" />}
                  {user.name}
                </span>

                {user.role === Role.CLIENT && (
                  <Link to="/client/bookings" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-indigo-200">
                    My Bookings
                  </Link>
                )}

                {user.role === Role.PROVIDER && (
                  <Link to="/provider" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-indigo-200">
                    Dashboard
                  </Link>
                )}

                {user.role === Role.ADMIN && (
                  <Link to="/admin" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md shadow-red-200">
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-gray-900 hover:text-indigo-600 font-bold text-sm px-4">Log In</Link>
                    <Link to="/login" className="bg-gray-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-200">
                        Sign Up
                    </Link>
                </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
          </div>
        </div>
      </div>
      
       {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl">
          <div className="px-4 py-6 space-y-4">
            <Link to="/" className="block text-gray-800 font-bold text-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/categories" className="block text-gray-800 font-bold text-lg" onClick={() => setIsMenuOpen(false)}>Category</Link>
            <Link to="/about" className="block text-gray-800 font-bold text-lg" onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link to="/privacy" className="block text-gray-800 font-bold text-lg" onClick={() => setIsMenuOpen(false)}>Privacy</Link>
            
            <div className="border-t border-gray-100 pt-4">
                {isAuthenticated && user ? (
                <>
                    <div className="text-sm text-gray-500 mb-2">Signed in as {user.name}</div>
                    {user.role === Role.CLIENT && (
                    <Link to="/client/bookings" className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold mb-3" onClick={() => setIsMenuOpen(false)}>
                        My Bookings
                    </Link>
                    )}
                    {user.role === Role.PROVIDER && (
                    <Link to="/provider" className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-bold mb-3" onClick={() => setIsMenuOpen(false)}>
                        Provider Dashboard
                    </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left text-red-600 font-bold py-2">Logout</button>
                </>
                ) : (
                    <div className="flex flex-col gap-3">
                        <Link to="/login" className="w-full text-center border border-gray-300 py-3 rounded-xl font-bold text-gray-700" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                        <Link to="/login" className="w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
