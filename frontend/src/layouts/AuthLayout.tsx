import React from 'react';
import { Button } from '../components/ui';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'BookYourService',
  subtitle = '',
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                BY
              </div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                Home
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                Pricing
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                Help
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {subtitle && (
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600">{subtitle}</p>
              </div>
            )}
            {children}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2025 BookYourService. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="/help" className="text-sm text-gray-500 hover:text-gray-900">
                Help Center
              </a>
              <a href="/support" className="text-sm text-gray-500 hover:text-gray-900">
                Contact Support
              </a>
              <a href="/faq" className="text-sm text-gray-500 hover:text-gray-900">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
