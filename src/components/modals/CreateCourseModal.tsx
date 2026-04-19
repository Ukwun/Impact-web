"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import { Loader } from "lucide-react";

interface CourseData {
  id?: string;
  title: string;
  description: string;
  difficulty?: string;
  duration?: number;
  isPublished?: boolean;
  thumbnail?: string;
}

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: CourseData;
  mode?: 'create' | 'edit';
}

export const CreateCourseModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  mode = 'create',
}: CreateCourseModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();
  const [formData, setFormData] = useState<CourseData & { category: string; level: string; estimatedHours: string }>({
    title: "",
    description: "",
    category: "Technology",
    level: "Beginner",
    difficulty: "BEGINNER",
    estimatedHours: "4",
    duration: 240,
  });

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        id: initialData.id,
        title: initialData.title,
        description: initialData.description,
        category: "Technology",
        level: initialData.difficulty || "Beginner",
        difficulty: initialData.difficulty || "BEGINNER",
        duration: initialData.duration || 240,
        estimatedHours: String(initialData.duration ? Math.ceil(initialData.duration / 60) : 4),
        isPublished: initialData.isPublished,
        thumbnail: initialData.thumbnail,
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        category: "Technology",
        level: "Beginner",
        difficulty: "BEGINNER",
        estimatedHours: "4",
        duration: 240,
      });
    }
  }, [initialData, mode, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Update difficulty when level changes
      ...(name === 'level' && { difficulty: value.toUpperCase() }),
      // Update duration when estimatedHours changes
      ...(name === 'estimatedHours' && { duration: parseInt(value) * 60 }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const url = mode === 'edit' && formData.id ? '/api/courses/' + formData.id : '/api/courses';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty || "BEGINNER",
          duration: formData.duration || 240,
          language: "English",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${mode} course`);
      }

      const message = mode === 'edit' 
        ? `"${formData.title}" has been updated successfully`
        : `"${formData.title}" has been created successfully`;
      
      success(
        mode === 'edit' ? "Course Updated" : "Course Created",
        message
      );

      onClose();
      onSuccess?.();
    } catch (err) {
      error("Error", err instanceof Error ? err.message : `Failed to ${mode} course`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Course' : 'Create New Course'}
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
            {isLoading ? 'Saving...' : mode === 'edit' ? 'Update Course' : 'Create Course'}
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
            Difficulty Level
          </label>
          <Select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </Select>
        </div>

        {/* Duration */}
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
            placeholder="4"
          />
        </div>

        {/* Info Message */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            ℹ️ After {mode === 'edit' ? 'updating' : 'creating'} your course, you can add lessons and organize content.
          </p>
        </div>
      </form>
    </Modal>
  );
};
