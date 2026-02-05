import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in their child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
// Fix: Use React.Component to ensure props and state are correctly inherited and recognized by the TypeScript compiler
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // Fix: Access state from this.state which is managed by React.Component
    const { hasError } = this.state;
    // Fix: Access children from this.props which is inherited from React.Component
    const { children } = this.props;

    if (hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-gray-100 max-w-lg text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Oops! Something went wrong.</h1>
            <p className="text-gray-500 font-medium leading-relaxed mb-10">
              The marketplace encountered an unexpected glitch. Our engineers have been notified.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl"
            >
              <RefreshCw className="w-5 h-5" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    // Standard fix for React Error #525: explicitly return null if children is undefined/null
    return children ?? null;
  }
}
