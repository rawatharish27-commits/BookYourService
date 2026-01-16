import React from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  id,
  name,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const togglePassword = () => setShowPassword(!showPassword);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          id={id}
          name={name}
          className={`
            block w-full rounded-lg border 
            ${icon ? 'pl-10' : 'pl-3'} 
            ${showPasswordToggle ? 'pr-10' : 'pr-3'} 
            py-2.5 text-gray-900 placeholder-gray-400
            focus:ring-4 focus:ring-blue-300 focus:border-blue-500
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${className}
          `}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 4 4 0 00-16 0zm-7 4a1 1 0 11-2 0V7a1 1 0 01-1 0H7a1 1 0 01-1 0v3zm10-5.66a1.2 1.2 0 11-1.7 1.2H9.8a1.2 1.2 0 11-1.7-1.2H4.6l-1.2 1.2a1.2 1.2 0 01-1.7 1.7h2.8v-2.4l-1.2-1.2a1.2 1.2 0 011.7-1.7h6.1a1.2 1.2 0 11-1.7 1.2h2.8v5.6l-1.2-1.2a1.2 1.2 0 01-1.7 1.7h6.1a1.2 1.2 0 11-1.7 1.2h6.1v1.7a1.2 1.2 0 01-1.7 1.2h-2.8a1.2 1.2 0 01-1.7 1.2l-1.2 1.2a1.2 1.2 0 01-1.7 1.7h6.1v2.6l-1.2 1.2a1.2 1.2 0 011.7 1.7h6.1v1.7a1.2 1.2 0 01-1.7 1.2l-1.2 1.2a1.2 1.2 0 01-1.7 1.7h6.1V8a2 2 0 110-4 0h-3z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
