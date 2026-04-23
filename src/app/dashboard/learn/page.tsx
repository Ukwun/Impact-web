"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { AUTH_TOKEN_KEY } from "@/lib/authStorage";
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
  Loader,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface EnrolledCourse {
  enrollmentId: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    difficulty: string;
    duration: number;
  };
  progress: number;
  isCompleted: boolean;
  totalLessons: number;
}

interface ApiCourse {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  instructor: string;
  rating: number;
  lessons: number;
  _count?: { enrollments: number };
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students: number;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
  enrolled: boolean;
  progress?: number;
  lessons: number;
}

export default function LearnPage() {
  const router = useRouter();
  const { success, error: errorToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const headers: any = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Fetch all courses
        const coursesRes = await fetch("/api/courses", { headers });
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");
        const coursesData = await coursesRes.json();
        const apiCourses: ApiCourse[] = coursesData.courses || [];

        // Fetch user's enrollments
        let enrolledCourseIds = new Set<string>();
        let enrollmentMap = new Map<string, { progress: number; totalLessons: number }>();
        
        try {
          const progressRes = await fetch("/api/progress", { headers });
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            const enrollments: EnrolledCourse[] = progressData.data?.enrollments || [];
            enrollments.forEach((e) => {
              enrolledCourseIds.add(e.course.id);
              enrollmentMap.set(e.course.id, {
                progress: e.progress,
                totalLessons: e.totalLessons,
              });
            });
          }
        } catch (err) {
          console.warn("Could not fetch user enrollments:", err);
        }

        // Merge API courses with enrollment data
        const mergedCourses: Course[] = apiCourses.map((apiCourse) => ({
          id: apiCourse.id,
          title: apiCourse.title,
          description: apiCourse.description,
          instructor: apiCourse.instructor || "Unknown Instructor",
          students: apiCourse._count?.enrollments || 0,
          duration: apiCourse.duration,
          difficulty: apiCourse.difficulty as "beginner" | "intermediate" | "advanced",
          rating: apiCourse.rating || 4.5,
          enrolled: enrolledCourseIds.has(apiCourse.id),
          progress: enrollmentMap.get(apiCourse.id)?.progress,
          lessons: apiCourse.lessons || 0,
        }));

        setCourses(mergedCourses);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load courses";
        setError(message);
        console.error("Error fetching courses:", message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      difficulty === "all" || course.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  const enrolledCourses = filteredCourses.filter(c => c.enrolled);
  const availableCourses = filteredCourses.filter(c => !c.enrolled);

  const handleContinue = (courseId: string) => {
    router.push(`/dashboard/courses/${courseId}`);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setPendingCourseId(courseId);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to enroll in course");
      }

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? {
                ...course,
                enrolled: true,
                progress: 0,
              }
            : course
        )
      );

      success("Enrollment successful", "You can now start this course.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Enrollment failed";
      errorToast("Enrollment failed", message);
    } finally {
      setPendingCourseId(null);
    }
  };

  const getDifficultyColor = (
    difficulty: "beginner" | "intermediate" | "advanced"
  ) => {
    switch (difficulty) {
      case "beginner":
        return "bg-primary-100 text-primary-700 border border-primary-200";
      case "intermediate":
        return "bg-secondary-100 text-secondary-700 border border-secondary-200";
      case "advanced":
        return "bg-danger-100 text-danger-700 border border-danger-200";
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all group">
      {/* Header with Gradient */}
      <div className="relative h-32 bg-gradient-to-br from-primary-500 to-secondary-400 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Title & Description */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-text-500 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Instructor */}
        <p className="text-xs text-gray-300 font-medium mb-4">
          👨‍🏫 {course.instructor}
        </p>

        {/* Course Info Row */}
        <div className="flex gap-4 text-xs text-gray-700 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-1.5 font-semibold">
            <Users className="w-4 h-4 text-primary-600" />
            {course.students.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <Clock className="w-4 h-4 text-primary-600" />
            {course.duration}m
          </div>
          <div className="flex items-center gap-1.5 font-semibold">
            <BookOpen className="w-4 h-4 text-primary-600" />
            {course.lessons} lessons
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex text-secondary-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(course.rating)
                    ? "fill-current"
                    : "fill-none stroke-2"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-text-500">{course.rating}</span>
        </div>

        {/* Progress or CTA */}
        {course.enrolled && course.progress !== undefined ? (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-500">Progress</span>
              <span className="text-xs font-bold text-primary-600">{course.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-dark-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        ) : null}

        {/* Button */}
        <Button
          variant={course.enrolled ? "outline" : "primary"}
          size="sm"
          className="w-full justify-center"
          disabled={pendingCourseId === course.id}
          onClick={() =>
            course.enrolled ? handleContinue(course.id) : handleEnroll(course.id)
          }
        >
          {pendingCourseId === course.id ? (
            <>
              <Loader className="w-4 h-4 mr-1.5 animate-spin" />
              Working...
            </>
          ) : course.enrolled ? (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          ) : (
            <>
              Enroll Now
              <Zap className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Learning Hub</h1>
            <p className="text-gray-300 font-medium">Explore courses and expand your skills</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-12 text-center">
          <Loader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-text-500 mb-2">Loading courses...</h3>
          <p className="text-gray-300">Please wait while we fetch the latest courses</p>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-12 text-center border border-danger-500 bg-danger-500/10">
          <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-danger-500 mb-2">Failed to load courses</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </Card>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-dark-700/50 border border-primary-500/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-primary-700 font-semibold">Total Courses</p>
                  <p className="text-2xl font-black text-primary-600">{courses.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-dark-700/50 border border-secondary-500/50">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-secondary-600" />
                <div>
                  <p className="text-xs text-secondary-700 font-semibold">You're Enrolled In</p>
                  <p className="text-2xl font-black text-secondary-600">{enrolledCourses.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-dark-700/50 border border-blue-500/50">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-700 font-semibold">Available Now</p>
                  <p className="text-2xl font-black text-blue-600">{availableCourses.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-text-500 mb-2">
                Search Courses
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <div className="w-full md:w-56">
              <label className="block text-sm font-bold text-text-500 mb-2">
                Difficulty Level
              </label>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
          </div>

          {/* Enrolled Courses Section */}
          {enrolledCourses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-text-500">My Learning Path</h2>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
                  {enrolledCourses.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {/* Available Courses Section */}
          {availableCourses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-text-500">Browse Courses</h2>
                <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-bold">
                  {availableCourses.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredCourses.length === 0 && courses.length > 0 && (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-500 mb-2">No courses found</h3>
              <p className="text-gray-300">Try adjusting your search filters</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
