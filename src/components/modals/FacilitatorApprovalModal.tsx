"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, CheckCircle, XCircle, Mail } from "lucide-react";

interface PendingFacilitator {
  id: string;
  name: string;
  email: string;
  qualification: string;
  experience: number;
  bio?: string;
  submittedAt: string;
  status: "pending";
}

interface Props {
  isOpen: boolean;
  facilitators: PendingFacilitator[];
  onClose: () => void;
  onApprove?: (facilitatorId: string, feedback: string) => Promise<void>;
  onReject?: (facilitatorId: string, feedback: string) => Promise<void>;
  isProcessing?: boolean;
}

export function FacilitatorApprovalModal({
  isOpen,
  facilitators,
  onClose,
  onApprove,
  onReject,
  isProcessing = false,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  if (!isOpen) return null;

  const selected = facilitators.find((f) => f.id === selectedId);

  const handleApprove = async () => {
    if (!selectedId || !onApprove) return;
    try {
      await onApprove(selectedId, feedback);
      setSelectedId(null);
      setFeedback("");
    } catch (error) {
      console.error("Error approving facilitator:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedId || !onReject) return;
    try {
      await onReject(selectedId, feedback);
      setSelectedId(null);
      setFeedback("");
    } catch (error) {
      console.error("Error rejecting facilitator:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-96 overflow-hidden bg-dark-800 border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h3 className="text-lg font-bold text-white">
              Pending Facilitator Approvals
            </h3>
            <p className="text-sm text-gray-400">
              {facilitators.length} applicant{facilitators.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-4 p-6 overflow-y-auto">
          {/* Facilitator List */}
          <div className="space-y-2">
            {facilitators.map((facilitator) => (
              <button
                key={facilitator.id}
                onClick={() => {
                  setSelectedId(facilitator.id);
                  setAction(null);
                  setFeedback("");
                }}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedId === facilitator.id
                    ? "bg-primary-500/20 border-primary-500"
                    : "bg-dark-700 border-dark-600 hover:border-primary-500"
                }`}
              >
                <p className="font-semibold text-white text-sm">{facilitator.name}</p>
                <p className="text-xs text-gray-400">{facilitator.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {facilitator.experience} years experience
                </p>
              </button>
            ))}
          </div>

          {/* Details Panel */}
          {selected ? (
            <div className="bg-dark-700 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-bold text-white mb-3">{selected.name}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400">Email</p>
                    <div className="flex items-center gap-2 text-white">
                      <Mail className="w-4 h-4" />
                      {selected.email}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400">Qualification</p>
                    <p className="text-white">{selected.qualification}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Experience</p>
                    <p className="text-white">{selected.experience} years</p>
                  </div>
                  {selected.bio && (
                    <div>
                      <p className="text-gray-400">Bio</p>
                      <p className="text-white text-xs">{selected.bio}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">Applied</p>
                    <p className="text-white text-xs">
                      {new Date(selected.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decision Section */}
              {action ? (
                <div className="space-y-3 pt-4 border-t border-dark-600">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={`Add ${action === "approve" ? "approval" : "rejection"} feedback...`}
                    className="w-full h-20 bg-dark-600 text-white border border-dark-500 rounded px-3 py-2 focus:outline-none focus:border-primary-500 text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant={action === "approve" ? "primary" : "danger"}
                      className="flex-1"
                      onClick={action === "approve" ? handleApprove : handleReject}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `${action === "approve" ? "Approve" : "Reject"}`}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setAction(null);
                        setFeedback("");
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-4 border-t border-dark-600">
                  <Button
                    variant="primary"
                    className="flex-1 gap-2"
                    onClick={() => setAction("approve")}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 gap-2"
                    onClick={() => setAction("reject")}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-dark-700 rounded-lg p-4 flex items-center justify-center">
              <p className="text-center text-gray-400">
                Select a facilitator to review their application
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
