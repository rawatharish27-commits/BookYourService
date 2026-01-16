import React, { useState } from 'react';
import { Menu, X, DollarSign, Calendar, Briefcase, User, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui';

interface ProviderLayoutProps {
  children: React.ReactNode;
}

export const ProviderLayout: React.FC<ProviderLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const providerMenuItems = [
    { name: 'Dashboard', icon: DollarSign, path: '/provider/dashboard' },
    { name: 'Booking Requests', icon: Calendar, path: '/provider/requests' },
    { name: 'My Jobs', icon: Briefcase, path: '/provider/jobs' },
    { name: 'Earnings', icon: DollarSign, path: '/provider/earnings' },
    { name: 'Profile', icon: User, path: '/provider/profile' },
    { name: 'Settings', icon: Settings, path: '/provider/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
            SP
          </div>
          <h1 className="text-lg font-semibold text-gray-900">BookYourService</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-gray-900">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 left-0 bottom-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
              SP
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">BookYour</h1>
              <p className="text-xs text-gray-500">Service Provider</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {providerMenuItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg group transition-all duration-200"
            >
              <item.icon className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Jane Smith</p>
              <p className="text-xs text-gray-500">Service Provider</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-purple-600 hover:bg-purple-50 hover:text-purple-700">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                  SP
                </div>
                <h1 className="text-lg font-semibold text-gray-900">BookYourService</h1>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600 hover:text-gray-900">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              {providerMenuItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 text-gray-400" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                  JD
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                  <p className="text-xs text-gray-500">Service Provider</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start text-purple-600 hover:bg-purple-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                SP
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BookYourService</h1>
                <p className="text-sm text-gray-500">Provider Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                Help
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                Support
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                  JD
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Jane Smith</p>
                  <p className="text-xs text-gray-500">Service Provider</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
