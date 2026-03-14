"use client";

import { useSearchParams } from "next/navigation";
import QuizComponent from "@/components/lms/QuizComponent";
import { useQuiz } from "@/hooks/useLMS";
import { Card } from "@/components/ui/Card";
import { AlertCircle, Loader } from "lucide-react";

export default function QuizPage() {
  const searchParams = useSearchParams();
  const quizId = searchParams.get("id") || "quiz_1";

  const { quiz, loading, error } = useQuiz(quizId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-gray-300">Loading quiz...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-text-500 mb-2">Quiz</h1>
          <p className="text-gray-300">Error loading quiz</p>
        </div>
        <Card className="p-6 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-900">Failed to Load Quiz</h3>
              <p className="text-red-700 mt-1">{error || "Quiz not found"}</p>
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
          {quiz.title}
        </h1>
        <p className="text-gray-300">
          Passing Score: {quiz.passingScore}% | Total Points: {quiz.totalPoints}
        </p>
      </div>
      <QuizComponent quiz={quiz} />
    </div>
  );
}
