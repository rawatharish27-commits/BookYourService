/**
 * UI Modal Component
 */
import React from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', actions }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-[3rem] w-full ${sizes[size]} shadow-3xl animate-slideUp max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white rounded-t-[3rem] p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#0A2540] italic">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold hover:bg-slate-200 transition-all"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
        {actions && (
          <div className="sticky bottom-0 bg-white rounded-b-[3rem] p-6 border-t border-slate-100">
            <div className="flex gap-4 justify-end">{actions}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

