'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-dark-800 border border-dark-600">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger-50 rounded-lg">
                <AlertTriangle size={24} className="text-danger-600" />
              </div>
              <h2 className="text-xl font-bold text-text-500">{title}</h2>
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="p-1 hover:bg-dark-700 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Message */}
          <p className="text-gray-300 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-dark-700 hover:bg-dark-600"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 bg-danger-600 hover:bg-danger-700 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
