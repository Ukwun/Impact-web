"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X, TrendingUp, Award, Clock, CheckCircle2 } from "lucide-react";

interface MenteeProgress {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  completionPercentage: number;
  gradesAverage: number;
  lastActivityDate: string;
  milestones: {
    id: string;
    name: string;
    completed: boolean;
    dueDate: string;
  }[];
  strengths: string[];
  areasForImprovement: string[];
}

interface Props {
  isOpen: boolean;
  mentee: MenteeProgress | null;
  onClose: () => void;
}

export function MenteeProgressModal({ isOpen, mentee, onClose }: Props) {
  if (!isOpen || !mentee) return null;

  const completionColor =
    mentee.completionPercentage >= 80
      ? "text-success-400"
      : mentee.completionPercentage >= 50
        ? "text-warning-400"
        : "text-danger-400";

  const completedMilestones = mentee.milestones.filter((m) => m.completed).length;
  const totalMilestones = mentee.milestones.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-96 overflow-y-auto bg-dark-800 border-dark-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600 sticky top-0 bg-dark-800">
          <div>
            <h3 className="text-lg font-bold text-white">{mentee.name}</h3>
            <p className="text-sm text-gray-400">{mentee.courseName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Overview */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-info-500" />
              Course Progress
            </h4>
            <div className="space-y-4">
              {/* Completion Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Overall Completion</span>
                  <span className={`text-lg font-bold ${completionColor}`}>{mentee.completionPercentage}%</span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-info-500 to-info-400 h-full transition-all"
                    style={{ width: `${mentee.completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Grade Average */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Average Grade</span>
                  <span className="text-lg font-bold text-white">{mentee.gradesAverage.toFixed(1)}%</span>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                Last activity: {new Date(mentee.lastActivityDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-success-500" />
              Milestones ({completedMilestones}/{totalMilestones})
            </h4>
            <div className="space-y-2">
              {mentee.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                  <CheckCircle2
                    className={`w-5 h-5 flex-shrink-0 ${
                      milestone.completed ? "text-success-500" : "text-gray-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className={milestone.completed ? "text-gray-400 line-through" : "text-white text-sm"}>
                      {milestone.name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-success-400 mb-2 text-sm">Strengths</h5>
              <ul className="space-y-1">
                {mentee.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-gray-400">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-warning-400 mb-2 text-sm">Areas for Improvement</h5>
              <ul className="space-y-1">
                {mentee.areasForImprovement.map((area, i) => (
                  <li key={i} className="text-sm text-gray-400">
                    • {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-dark-600">
            <Button variant="primary" className="w-full">
              Schedule Mentoring Session
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
