import React from 'react';
import Dialog from './Dialog';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="420px"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--color-text)', lineHeight: 1.5 }}>{message}</p>
    </Dialog>
  );
}
