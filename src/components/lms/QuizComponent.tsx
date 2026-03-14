"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Clock, AlertCircle, BarChart3 } from "lucide-react";

interface Question {
  id: string | number;
  question: string;
  type: "mcq" | "trueFalse" | "shortAnswer" | "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  points?: number;
}

interface QuizProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    duration?: number;
    totalQuestions?: number;
    passingScore: number;
    questions: Question[];
  };
}

export default function QuizComponent({ quiz }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState((quiz.duration || 30) * 60);

  const handleAnswer = (answer: string | number) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    return (
      <div className="max-w-2xl mx-auto">
        <Card className={`p-12 text-center ${passed ? "bg-dark-700/50 border-2 border-green-500 text-white" : "bg-dark-700/50 border-2 border-red-500 text-white"}`}>
          <div className="mb-6">
            {passed ? (
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            ) : (
              <AlertCircle className="w-20 h-20 text-red-600 mx-auto" />
            )}
          </div>

          <h2 className={`text-4xl font-black mb-2 ${passed ? "text-green-700" : "text-red-700"}`}>
            {passed ? "Great Job! 🎉" : "Keep Practicing 💪"}
          </h2>

          <p className={`text-lg font-semibold mb-6 ${passed ? "text-green-600" : "text-red-600"}`}>
            Your Score: {score}%
          </p>

          {/* Score Details */}
          <Card className="p-6 bg-dark-700/50 rounded-xl mb-6 border border-dark-600">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-300 font-semibold">Correct Answers</p>
                <p className="text-3xl font-black text-primary-600">
                  {Object.values(answers).filter((a, idx) => a === quiz.questions[idx]?.correctAnswer).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-300 font-semibold">Incorrect</p>
                <p className="text-3xl font-black text-danger-600">
                  {quiz.questions.length -
                    Object.values(answers).filter((a, idx) => a === quiz.questions[idx]?.correctAnswer).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-300 font-semibold">Passing Score</p>
                <p className="text-3xl font-black text-secondary-600">{quiz.passingScore}%</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3 mt-8">
            {passed && (
              <Button variant="primary" className="w-full justify-center">
                Continue to Next Lesson
              </Button>
            )}
            <Button variant="outline" className="w-full justify-center">
              Review Answers
            </Button>
            <Button variant="light" className="w-full justify-center">
              Retake Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isAnswered = currentQuestion in answers;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6 bg-dark-700/50 border-2 border-primary-500">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-text-500">{quiz.title}</h2>
            <p className="text-gray-300 text-sm">{quiz.description}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="font-bold text-primary-600">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            </div>
            <p className="text-xs text-gray-300 font-semibold">Time Left</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-3 bg-primary-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
                style={{
                  width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <span className="text-sm font-bold text-text-500 whitespace-nowrap">
            {currentQuestion + 1}/{quiz.questions.length}
          </span>
        </div>
      </Card>

      {/* Question */}
      <Card className="p-8">
        <h3 className="text-xl font-bold text-text-500 mb-6">
          Question {currentQuestion + 1}
        </h3>

        <p className="text-lg font-semibold text-text-500 mb-8">{question.question}</p>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {question.type === "mcq" && question.options && (
            <>
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all font-semibold ${
                    answers[currentQuestion] === idx
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-primary-300 bg-white text-text-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === idx
                          ? "border-primary-500 bg-primary-500"
                          : "border-gray-300"
                      }`}
                    >
                      {answers[currentQuestion] === idx && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </>
          )}

          {question.type === "trueFalse" && (
            <div className="grid grid-cols-2 gap-4">
              {["True", "False"].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-xl border-2 transition-all font-semibold ${
                    answers[currentQuestion] === idx
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-primary-300 bg-white text-text-500"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.type === "shortAnswer" && (
            <input
              type="text"
              value={(answers[currentQuestion] as string) || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <Button
            variant={isAnswered ? "primary" : "light"}
            onClick={handleNext}
            disabled={!isAnswered}
            className="gap-2"
          >
            {currentQuestion === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      </Card>

      {/* Question Navigator */}
      <Card className="p-6">
        <h4 className="font-bold text-text-500 mb-4">Questions</h4>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: quiz.questions.length }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-full aspect-square rounded-lg font-bold transition-all ${
                currentQuestion === idx
                  ? "bg-primary-500 text-white scale-110"
                  : idx in answers
                    ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
                    : "bg-gray-200 text-gray-300 hover:bg-gray-300"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
