"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUniversityPrograms } from "@/hooks/useFetchData";
import { Pagination } from "@/components/dashboard/Pagination";
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Clock,
  Star,
  Loader,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // in weeks
  enrolled: boolean;
  progress?: number;
  students: number;
  rating: number;
  modules: number;
}

interface UniversityData {
  programs: Program[];
  completedPrograms: number;
  totalProgress: number;
}

export default function UniversityProgramsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState<"all" | "enrolled" | "available">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Use the university programs hook with selected filter
  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useUniversityPrograms(filter);

  useEffect(() => {
    setIsVisible(true);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter]);

  const programs = data?.programs || [];
  const filteredPrograms =
    filter === "enrolled"
      ? programs.filter((p) => p.enrolled)
      : filter === "available"
        ? programs.filter((p) => !p.enrolled)
        : programs;

  const getDifficultyColor = (difficulty: "beginner" | "intermediate" | "advanced") => {
    switch (difficulty) {
      case "beginner":
        return "bg-primary-100 text-primary-700 border border-primary-200";
      case "intermediate":
        return "bg-secondary-100 text-secondary-700 border border-secondary-200";
      case "advanced":
        return "bg-red-100 text-red-700 border border-red-200";
    }
  };

  return (
    <div
      className={`space-y-8 pb-12 transition-all duration-700 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
          University Programs 🎓
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          Explore specialized programs designed for university students
        </p>
      </div>

      {/* Progress Summary */}
      {data && !loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Programs Enrolled</h3>
                <BookOpen className="w-5 h-5 text-primary-500" />
              </div>
              <p className="text-3xl font-bold text-white">{programs.filter((p) => p.enrolled).length}</p>
              <p className="text-xs text-gray-400 mt-2">
                {data.completedPrograms} completed
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Overall Progress</h3>
                <TrendingUp className="w-5 h-5 text-secondary-500" />
              </div>
              <p className="text-3xl font-bold text-white">{data.totalProgress}%</p>
              <div className="w-full h-2 bg-dark-600 rounded mt-2">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded"
                  style={{ width: `${data.totalProgress}%` }}
                />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">Available Programs</h3>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-white">
                {programs.filter((p) => !p.enrolled).length}
              </p>
              <p className="text-xs text-gray-400 mt-2">Ready to explore</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {["all", "enrolled", "available"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(f as any)}
                className="capitalize"
              >
                {f === "all" ? "All Programs" : f}
              </Button>
            ))}
          </div>

          {/* Programs Grid */}
          {filteredPrograms.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPrograms
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((program) => (
              <Card
                key={program.id}
                className="overflow-hidden flex flex-col hover:shadow-xl transition-all"
              >
                {/* Header with Gradient */}
                <div className="relative h-32 bg-gradient-to-br from-primary-500 to-secondary-400 overflow-hidden p-6">
                  <div className="absolute inset-0 opacity-20 bg-pattern"></div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(program.difficulty)}`}>
                      {program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                    {program.description}
                  </p>

                  {/* Program Info */}
                  <div className="flex gap-4 text-xs text-gray-400 mb-4 pb-4 border-b border-dark-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {program.students} students
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {program.duration} weeks
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {program.modules} modules
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(program.rating)
                              ? "fill-current"
                              : "fill-none stroke-2"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white">{program.rating}</span>
                  </div>

                  {/* Progress or CTA */}
                  {program.enrolled && program.progress !== undefined ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-300">Progress</span>
                        <span className="text-xs font-bold text-primary-600">{program.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          style={{ width: `${program.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : null}

                  {/* Button */}
                  <Button
                    variant={program.enrolled ? "outline" : "primary"}
                    size="sm"
                    className="w-full justify-center mt-auto"
                    onClick={() =>
                      router.push(
                        program.enrolled
                          ? `/dashboard/learn?programId=${program.id}`
                          : `/dashboard/university/programs/${program.id}`
                      )
                    }
                  >
                    {program.enrolled ? (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    ) : (
                      <>
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredPrograms.length / pageSize)}
                totalItems={filteredPrograms.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          ) : (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <BookOpen className="w-12 h-12 text-gray-500 mx-auto opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-300">
                    No programs found
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {filter === "enrolled"
                      ? "You haven't enrolled in any programs yet"
                      : "All programs are currently enrolled"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : loading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading programs...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400">Error Loading Programs</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button onClick={() => refetch()} className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
