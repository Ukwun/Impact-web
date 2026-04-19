"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { X, MessageSquare, Eye, Loader } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentDate: string;
  lastActivity?: string;
  submissionsCount?: number;
  averageGrade?: number;
}

interface StudentRosterModalProps {
  isOpen: boolean;
  className: string;
  students: Student[];
  isLoading?: boolean;
  onClose: () => void;
  onMessageStudent?: (studentId: string, studentName: string) => void;
  onViewStudent?: (studentId: string) => void;
}

export function StudentRosterModal({
  isOpen,
  className,
  students,
  isLoading = false,
  onClose,
  onMessageStudent,
  onViewStudent,
}: StudentRosterModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { success } = useToast();

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMessage = (studentId: string, studentName: string) => {
    onMessageStudent?.(studentId, studentName);
    success("Message", `Message window opened for ${studentName}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-dark-800 border border-dark-600 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <div>
            <h2 className="text-xl font-bold text-white">Class Roster</h2>
            <p className="text-sm text-gray-400 mt-1">{className}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-dark-600">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? "No students match your search" : "No students enrolled"}
            </div>
          ) : (
            <div className="divide-y divide-dark-600">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{student.name}</h3>
                      <p className="text-sm text-gray-400">{student.email}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        <span>
                          Enrolled:{" "}
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </span>
                        {student.submissionsCount !== undefined && (
                          <span>Submissions: {student.submissionsCount}</span>
                        )}
                        {student.averageGrade !== undefined && (
                          <span>
                            Avg Grade:{" "}
                            <span className="text-primary-400">
                              {student.averageGrade.toFixed(1)}%
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {onViewStudent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewStudent(student.id)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      )}
                      {onMessageStudent && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMessage(student.id, student.name)}
                          className="gap-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-600 bg-dark-900/50 flex justify-between text-sm text-gray-400">
          <span>{filteredStudents.length} of {students.length} students</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
