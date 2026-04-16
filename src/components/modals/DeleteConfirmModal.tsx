"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Loader } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName: string;
  isLoading?: boolean;
  type?: "danger" | "warning";
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
  type = "danger",
}: DeleteConfirmModalProps) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const isDanger = type === "danger";
  const borderColor = isDanger ? "border-red-500/30" : "border-yellow-500/30";
  const bgColor = isDanger ? "bg-red-500/10" : "bg-yellow-500/10";
  const textColor = isDanger ? "text-red-300" : "text-yellow-300";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`gap-2 ${isDanger ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"}`}
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}>
          <div className="flex gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDanger ? "text-red-400" : "text-yellow-400"}`} />
            <div>
              <h3 className={`font-semibold ${isDanger ? "text-red-300" : "text-yellow-300"}`}>
                {message}
              </h3>
              <p className={`text-sm mt-2 ${isDanger ? "text-red-200" : "text-yellow-200"}`}>
                Item: <span className="font-mono font-semibold">{itemName}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-dark-600 rounded-lg border border-dark-500">
          <p className="text-sm text-gray-300">
            ⚠️ This action {isDanger ? "cannot be undone" : "may be reversible"}. Please confirm you want to proceed.
          </p>
        </div>
      </div>
    </Modal>
  );
};
