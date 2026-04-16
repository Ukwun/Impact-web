"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Loader } from "lucide-react";

interface CreateTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateTierModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateTierModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monthlyFee: "0",
    yearlyFee: "0",
    maxCourses: "999",
    maxStudents: "999",
    benefits: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      error("Validation Error", "Tier name is required");
      return;
    }

    setIsLoading(true);

    try {
      const benefitsArray = formData.benefits
        .split(",")
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const response = await fetch("/api/admin/tiers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          monthlyFee: parseFloat(formData.monthlyFee),
          yearlyFee: parseFloat(formData.yearlyFee),
          maxCourses: parseInt(formData.maxCourses),
          maxStudents: parseInt(formData.maxStudents),
          benefits: benefitsArray,
          isActive: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tier");
      }

      success("Tier Created", `"${formData.name}" membership tier has been created`);

      // Reset form
      setFormData({
        name: "",
        description: "",
        monthlyFee: "0",
        yearlyFee: "0",
        maxCourses: "999",
        maxStudents: "999",
        benefits: "",
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      error("Error", err instanceof Error ? err.message : "Failed to create tier");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Membership Tier"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            {isLoading ? "Creating..." : "Create Tier"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tier Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Tier Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Premium Tier"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe this membership tier..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-dark-600 border-2 border-dark-500 text-gray-100 placeholder-gray-400 focus:ring-2 focus:border-primary-500 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Monthly Fee ($)
            </label>
            <Input
              type="number"
              name="monthlyFee"
              value={formData.monthlyFee}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Yearly Fee ($)
            </label>
            <Input
              type="number"
              name="yearlyFee"
              value={formData.yearlyFee}
              onChange={handleInputChange}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Max Courses
            </label>
            <Input
              type="number"
              name="maxCourses"
              value={formData.maxCourses}
              onChange={handleInputChange}
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Max Students
            </label>
            <Input
              type="number"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleInputChange}
              min="1"
            />
          </div>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Benefits (comma-separated)
          </label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleInputChange}
            placeholder="e.g., Access to all courses, Priority support, Certificate of completion"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-dark-600 border-2 border-dark-500 text-gray-100 placeholder-gray-400 focus:ring-2 focus:border-primary-500 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Info Message */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            ℹ️ Benefits should be comma-separated. They'll be displayed on the membership page.
          </p>
        </div>
      </form>
    </Modal>
  );
};
