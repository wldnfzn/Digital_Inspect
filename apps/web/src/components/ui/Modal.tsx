import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({ open, onClose, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} animate-slideUp overflow-hidden flex flex-col max-h-[90vh]`}>
        {children}
      </div>
    </div>
  );
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, onClose }) => (
  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
    <h3 className="text-xl font-semibold text-gray-900">{children}</h3>
    {onClose && (
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 -mr-1 rounded-lg hover:bg-gray-100">
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    )}
  </div>
);

const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => (
  <div className={`p-6 overflow-y-auto flex-1 ${className}`}>
    {children}
  </div>
);

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
