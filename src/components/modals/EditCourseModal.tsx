"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import { Loader } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty?: string;
  duration?: number;
  level?: string;
  estimatedHours?: number;
  maxStudents?: number;
}

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onSuccess?: () => void;
}

export const EditCourseModal = ({
  isOpen,
  onClose,
  course,
  onSuccess,
}: EditCourseModalProps) => {
  const mapDifficultyToLevel = (difficulty?: string) => {
    switch ((difficulty || "").toUpperCase()) {
      case "INTERMEDIATE":
        return "Intermediate";
      case "ADVANCED":
        return "Advanced";
      default:
        return "Beginner";
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
    level: "Beginner",
    estimatedHours: "4",
  });

  // Populate form when course changes
  useEffect(() => {
    if (course && isOpen) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "Technology",
        level: course.level || mapDifficultyToLevel(course.difficulty),
        estimatedHours: (
          course.estimatedHours ||
          (typeof course.duration === 'number' ? Math.ceil(course.duration / 60) : 4)
        ).toString(),
      });
    }
  }, [course, isOpen]);

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

    if (!course) return;

    // Validation
    if (!formData.title.trim()) {
      error("Validation Error", "Course title is required");
      return;
    }

    if (!formData.description.trim()) {
      error("Validation Error", "Course description is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.level.toUpperCase(),
          duration: parseInt(formData.estimatedHours || "4", 10) * 60,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update course");
      }

      success("Course Updated", `"${formData.title}" has been updated successfully`);
      onClose();
      onSuccess?.();
    } catch (err) {
      error("Error", err instanceof Error ? err.message : "Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Course: ${course?.title || ""}`}
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
            {isLoading ? "Updating..." : "Update Course"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Course Title *
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Advanced Python Programming"
            required
          />
        </div>

        {/* Course Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what students will learn in this course..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-dark-600 border-2 border-dark-500 text-gray-100 placeholder-gray-400 focus:ring-2 focus:border-primary-500 focus:ring-primary-500 resize-none"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Category
          </label>
          <Select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Arts">Arts</option>
            <option value="Science">Science</option>
          </Select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Course Level
          </label>
          <Select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </Select>
        </div>

        {/* Estimated Duration */}
        <div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Estimated Duration (hours)
            </label>
            <Input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleInputChange}
              min="1"
              max="200"
            />
          </div>
        </div>

        {/* Info Message */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            ℹ️ Changes will be applied immediately. Students in this course will see updated information.
          </p>
        </div>
      </form>
    </Modal>
  );
};
