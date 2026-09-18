import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'default',
  loading = false,
}) => {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="p-6 flex flex-col items-center text-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
          variant === 'danger' ? 'bg-error-container' : 'bg-primary-container'
        }`}>
          <span className={`material-symbols-outlined text-[28px] ${
            variant === 'danger' ? 'text-error' : 'text-primary'
          }`}>
            {variant === 'danger' ? 'delete_forever' : 'help'}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
      </div>
      <Modal.Footer>
        <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'destructive' : 'primary'}
          size="md"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
