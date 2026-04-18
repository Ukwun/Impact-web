'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  tierName: string;
  memberCount: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  tierName,
  memberCount,
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
              <h2 className="text-xl font-bold text-text-500">Delete Tier</h2>
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
          <div className="mb-6 space-y-3">
            <p className="text-gray-300">
              Are you sure you want to delete the <span className="font-bold">{tierName}</span> membership tier?
            </p>
            
            {memberCount > 0 && (
              <div className="p-3 bg-danger-50 border border-danger-300 rounded-lg">
                <p className="text-danger-700 text-sm">
                  <span className="font-bold">⚠️ Warning:</span> This tier has {memberCount} active member{memberCount !== 1 ? 's' : ''}. Please reassign or deactivate all members before deleting this tier.
                </p>
              </div>
            )}

            <p className="text-gray-400 text-sm">
              This action cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-dark-700 hover:bg-dark-600"
              disabled={loading || memberCount > 0}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 bg-danger-600 hover:bg-danger-700 flex items-center justify-center gap-2"
              disabled={loading || memberCount > 0}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Tier'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
