import { Dialog } from '@headlessui/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  title = 'Confirm',
  description = 'Are you sure?',
  onConfirm,
  confirmText = 'Yes',
  cancelText = 'Cancel'
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 relative z-10 space-y-4">
        <Dialog.Title className="text-lg font-bold">{title}</Dialog.Title>
        <Dialog.Description className="text-gray-600">{description}</Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300">{cancelText}</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </Dialog>
  );
}
