"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { X, Send, Loader } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  recipientName: string;
  recipientEmail?: string;
  context?: {
    type: "student" | "teacher" | "parent";
    subject?: string;
  };
  onClose: () => void;
  onSendMessage: (
    message: string,
    recipientEmail: string
  ) => Promise<void>;
}

export function MessageModal({
  isOpen,
  recipientName,
  recipientEmail,
  context,
  onClose,
  onSendMessage,
}: MessageModalProps) {
  const [subject, setSubject] = useState(context?.subject || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: errorToast } = useToast();

  if (!isOpen || !recipientEmail) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      errorToast("Error", "Message cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullMessage = subject ? `${subject}\n\n${message}` : message;
      await onSendMessage(fullMessage, recipientEmail);
      success("Message Sent", `Your message to ${recipientName} has been sent`);
      setSubject("");
      setMessage("");
      onClose();
    } catch (err) {
      errorToast(
        "Error",
        err instanceof Error ? err.message : "Failed to send message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextLabel = {
    student: "Student",
    teacher: "Teacher",
    parent: "Parent",
  }[context?.type || "student"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-dark-800 border border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h2 className="text-xl font-bold text-white">Send Message</h2>
            <p className="text-sm text-gray-400 mt-1">
              {contextLabel} • {recipientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Subject (Optional)
            </label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Question about Assignment 3"
              className="w-full"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none"
              rows={5}
            />
            <p className="text-xs text-gray-400 mt-1">
              {message.length} characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-6 border-t border-dark-600 bg-dark-900/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={isSubmitting || !message.trim()}
            className="flex-1 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
