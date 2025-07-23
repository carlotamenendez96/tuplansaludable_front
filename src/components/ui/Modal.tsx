import React from 'react';
import Card from './Card';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-base">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-text-base"
            aria-label="Cerrar modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;