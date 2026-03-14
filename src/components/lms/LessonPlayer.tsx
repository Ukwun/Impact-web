"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  ChevronDown,
  CheckCircle,
  Clock,
  Download,
  Share2,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

interface LessonPlayerProps {
  lesson: {
    id: string;
    title: string;
    instructor?: string;
    duration: number;
    description: string;
    videoUrl: string;
    materials: Array<{ name: string; url: string }>;
  };
}

export default function LessonPlayer({ lesson }: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [liked, setLiked] = useState(false);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Video Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
          <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
            {/* Video Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-all transform hover:scale-110 shadow-md"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white ml-1" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-1 bg-gray-700 rounded-full cursor-pointer overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{ width: `${(currentTime / lesson.duration) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:text-primary-400 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </button>
                  <Volume2 className="w-6 h-6 text-white cursor-pointer hover:text-primary-400 transition-colors" />
                  <span className="text-white text-sm font-semibold">
                    {Math.floor(currentTime)}:{String(Math.floor((currentTime % 1) * 60)).padStart(2, "0")} /{" "}
                    {Math.floor(lesson.duration)}:00
                  </span>
                </div>
                <Maximize className="w-6 h-6 text-white cursor-pointer hover:text-primary-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-text-500 mb-2">
                    {lesson.title}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    By <span className="font-semibold">{lesson.instructor}</span> •{" "}
                    <span className="font-semibold">{lesson.duration} minutes</span>
                  </p>
                </div>
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                  Video Lesson
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked
                    ? "bg-primary-100 text-primary-700"
                    : "hover:bg-dark-700/50 text-gray-300"
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                {liked ? "Liked" : "Like"}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-300">
                <MessageCircle className="w-5 h-5" />
                Comment
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-300">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </Card>

        {/* Resources */}
        {lesson.materials.length > 0 && (
          <Card className="p-6">
            <h3 className="font-bold text-lg text-text-500 mb-4">Materials</h3>
            <div className="space-y-2">
              {lesson.materials.map((material, idx) => (
                <a
                  key={idx}
                  href={material.url}
                  className="flex items-center gap-3 p-3 hover:bg-dark-700/50 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-text-500 flex-1">{material.name}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Notes Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text-500">Lesson Notes</h3>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
            >
              {showNotes ? "Hide" : "Show"}
            </button>
          </div>
          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes during the lesson..."
              className="w-full h-32 p-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
            ></textarea>
          )}
        </Card>

        {/* Lesson Progress */}
        <Card className="p-6 bg-dark-700/50 border-2 border-primary-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary-600" />
              <h3 className="font-bold text-text-500">Lesson Progress</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-text-500">Video Watched</span>
                  <span className="text-sm font-bold text-primary-600">
                    {Math.round((currentTime / lesson.duration) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    style={{ width: `${(currentTime / lesson.duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <Button variant="primary" size="sm" className="w-full">
              Complete Lesson
            </Button>
          </div>
        </Card>

        {/* What's Next */}
        <Card className="p-6">
          <h3 className="font-bold text-text-500 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="p-3 bg-dark-700/30 rounded-lg border border-blue-500/50">
              <p className="text-sm font-semibold text-blue-900">Quiz: Module 3 Concepts</p>
              <p className="text-xs text-blue-800 mt-1">10 questions • 15 minutes</p>
            </div>
            <Button variant="light" className="w-full justify-start gap-2" size="sm">
              <Clock className="w-4 h-4" />
              Start Quiz
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <ChevronDown className="w-4 h-4" />
              Next Lesson
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
