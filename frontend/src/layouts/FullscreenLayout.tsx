import React from 'react';
import { Button } from '../components/ui';
import { Home } from 'lucide-react';

interface FullscreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHome?: boolean;
}

export const FullscreenLayout: React.FC<FullscreenLayoutProps> = ({
  children,
  title = 'BookYourService',
  showHome = true,
}) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                BY
              </div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            </div>
            {showHome && (
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600" asChild>
                <a href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
