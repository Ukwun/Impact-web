"use client";

import { useSearchParams } from "next/navigation";
import LessonPlayer from "@/components/lms/LessonPlayer";
import { useLesson } from "@/hooks/useLMS";
import { Card } from "@/components/ui/Card";
import { AlertCircle, Loader } from "lucide-react";

export default function LessonPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("id") || "lesson_1";

  const { lesson, loading, error } = useLesson(lessonId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-300">Loading lesson...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-text-500 mb-2">Lesson</h1>
          <p className="text-gray-300">Error loading lesson</p>
        </div>
        <Card className="p-6 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-900">Failed to Load Lesson</h3>
              <p className="text-red-700 mt-1">{error || "Lesson not found"}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-text-500 mb-2">
          {lesson.title}
        </h1>
        <p className="text-gray-300">Duration: {lesson.duration} minutes</p>
      </div>
      <LessonPlayer lesson={lesson} />
    </div>
  );
}
