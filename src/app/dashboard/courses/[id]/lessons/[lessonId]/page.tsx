'use client';

import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, Maximize, Download, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

export default function LessonViewerPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const lessonId = params?.lessonId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState('');

  // Mock lesson data
  const lesson = {
    id: lessonId,
    title: 'Budgeting 101',
    module: 'Module 1: Money Basics',
    duration: 50,
    completed: false,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/big_buck_bunny.mp4',
    description:
      'Learn fundamental budgeting principles including the 50/30/20 rule, tracking expenses, and setting financial goals.',
    materials: [
      { id: 1, name: 'Budgeting Template.xlsx', size: '245 KB' },
      { id: 2, name: 'Lesson Slides.pdf', size: '1.2 MB' },
      { id: 3, name: 'Resource Guide.pdf', size: '890 KB' },
    ],
    keyPoints: [
      '50/30/20 budgeting rule explained',
      'How to track expenses effectively',
      'Creating realistic financial goals',
      'Tools and apps for budget management',
    ],
  };

  // Navigation
  const lessons = [
    { id: 1, title: 'What is Money?', module: 'Module 1', completed: true },
    { id: 2, title: 'Budgeting 101', module: 'Module 1', completed: false },
    { id: 3, title: 'Saving Strategies', module: 'Module 1', completed: false },
    { id: 4, title: 'Introduction to Investing', module: 'Module 2', completed: false },
  ];

  const currentLessonIndex = lessons.findIndex((l) => l.id === parseInt(lessonId as string));
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Container */}
            <div className="bg-black rounded-xl overflow-hidden aspect-video relative group">
              <video
                ref={videoRef}
                src={lesson.videoUrl}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
              />

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                {/* Top Controls */}
                <div className="flex justify-between items-center">
                  <div></div>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.requestFullscreen();
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-white/20"
                  >
                    <Maximize size={20} className="text-white" />
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div
                    onClick={handleProgressClick}
                    className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all"
                  >
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlayPause}
                        className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause size={24} className="text-white" />
                        ) : (
                          <Play size={24} className="text-white" />
                        )}
                      </button>

                      {/* Volume Control */}
                      <div className="flex items-center gap-2">
                        <Volume2 size={20} className="text-white" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-1 bg-white/30 rounded-full cursor-pointer"
                        />
                      </div>

                      <span className="text-white text-sm font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <button className="px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
                      <span className="text-white text-sm font-bold">1x</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              {!isPlaying && (
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                >
                  <Play size={64} className="text-white fill-white" />
                </button>
              )}
            </div>

            {/* Lesson Info */}
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">{lesson.module}</p>
                <h1 className="text-3xl font-black text-white">{lesson.title}</h1>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">{lesson.description}</p>

              {/* Key Points */}
              <div className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg p-6 border border-dark-400">
                <h3 className="font-bold text-white mb-4">Key Points</h3>
                <ul className="space-y-3">
                  {lesson.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="min-w-fit px-2 py-1 bg-primary-600/30 text-primary-400 rounded text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Materials */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Lesson Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.materials.map((material) => (
                  <button
                    key={material.id}
                    className="p-4 bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg border border-dark-400 hover:border-primary-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {material.name}
                        </p>
                        <p className="text-xs text-gray-400">{material.size}</p>
                      </div>
                      <Download size={20} className="text-gray-400 group-hover:text-primary-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {previousLesson && (
                <Link
                  href={`/dashboard/courses/${courseId}/lessons/${previousLesson.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-dark-500 border border-dark-400 rounded-lg text-white hover:border-primary-500 hover:bg-dark-400 transition-all"
                >
                  <ChevronLeft size={20} />
                  Previous: {previousLesson.title}
                </Link>
              )}

              {nextLesson && (
                <Link
                  href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg text-white font-bold hover:shadow-lg hover:shadow-primary-600/50 transition-all"
                >
                  Next: {nextLesson.title}
                  <ChevronRight size={20} />
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Discussion Section */}
            <div className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg border border-dark-400 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={20} className="text-primary-400" />
                <h3 className="font-bold text-white">Lesson Discussion</h3>
              </div>
              <input
                type="text"
                placeholder="Ask a question..."
                className="w-full px-4 py-2 bg-dark-700 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
              />
              <button className="w-full mt-3 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                Post Question
              </button>

              <div className="mt-4 space-y-3 border-t border-dark-400 pt-4">
                <div className="space-y-1">
                  <p className="font-semibold text-white text-sm">Sarah M.</p>
                  <p className="text-gray-300 text-sm">What's the best way to automate budgeting?</p>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white text-sm">John A.</p>
                  <p className="text-gray-300 text-sm">The 50/30/20 rule really changed my perspective.</p>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
              </div>
            </div>

            {/* Your Notes */}
            <div className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg border border-dark-400 p-6">
              <h3 className="font-bold text-white mb-4">Your Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lesson..."
                className="w-full h-32 px-4 py-2 bg-dark-700 border border-dark-400 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none"
              />
              <button className="w-full mt-3 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                Save Notes
              </button>
            </div>

            {/* Lesson Progress */}
            <div className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg border border-dark-400 p-6">
              <h3 className="font-bold text-white mb-4">Your Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-300">Watched</span>
                    <span className="font-bold text-white">36%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '36%' }}></div>
                  </div>
                </div>

                <button className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
