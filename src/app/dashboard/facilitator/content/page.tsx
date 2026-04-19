"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useFacilitatorContent } from "@/hooks/useFetchData";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Archive,
  Loader,
  AlertCircle,
  BookOpen,
  FileText,
  Video,
} from "lucide-react";

interface CourseContent {
  id: string;
  title: string;
  description: string;
  type: "course" | "module" | "lesson";
  itemCount?: number;
  isPublished: boolean;
  lastModified: string;
}

interface ContentPage {
  courses: CourseContent[];
  modules: CourseContent[];
  lessons: CourseContent[];
}

export default function FacilitatorContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"courses" | "modules" | "lessons">(
    (searchParams.get("tab") as any) || "courses"
  );

  // Use the content hook with selected tab
  const { 
    data: content, 
    loading, 
    error, 
    refetch 
  } = useFacilitatorContent(activeTab);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDelete = async (id: string, type: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/${type}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh content using the hook's refetch
        await refetch();
      }
    } catch (err) {
      console.error("Error deleting content:", err);
    }
  };

  const items =
    activeTab === "courses"
      ? content?.courses
      : activeTab === "modules"
        ? content?.modules
        : content?.lessons;

  return (
    <div
      className={`space-y-8 pb-12 transition-all duration-700 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
          Manage Content 📚
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          Create, edit, and organize your courses, modules, and lessons
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-dark-600">
        {["courses", "modules", "lessons"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="primary" size="lg" className="gap-2" onClick={() => router.push("/dashboard/courses/new")}>
          <Plus className="w-5 h-5" />
          Create {activeTab.slice(0, -1)}
        </Button>
        <Button variant="secondary" size="lg" className="gap-2" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {/* Content List */}
      {loading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading {activeTab}...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400">Error Loading Content</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button onClick={() => refetch()} className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    {item.type === "course" ? (
                      <BookOpen className="w-6 h-6 text-primary-500" />
                    ) : item.type === "lesson" ? (
                      <FileText className="w-6 h-6 text-secondary-500" />
                    ) : (
                      <Video className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
                {item.isPublished && (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-300 rounded">
                    Published
                  </span>
                )}
              </div>

              {item.itemCount && (
                <p className="text-xs text-gray-400 mb-4">
                  {item.itemCount} {item.type === "course" ? "lessons" : "items"}
                </p>
              )}

              <p className="text-xs text-gray-500 mb-4">
                Last modified: {item.lastModified}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => router.push(`/dashboard/${activeTab}/${item.id}/edit`)}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => router.push(`/dashboard/${activeTab}/${item.id}`)}
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <button
                  className="p-2 hover:bg-red-500/20 rounded border border-dark-600 text-gray-400 hover:text-red-400 transition-colors"
                  onClick={() => handleDelete(item.id, activeTab)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-dark-600/50 rounded-full">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-300">No {activeTab} yet</h3>
            <p className="text-sm text-gray-400">
              Create your first {activeTab.slice(0, -1)} to get started
            </p>
            <Button
              variant="primary"
              className="gap-2 mx-auto"
              onClick={() => router.push("/dashboard/courses/new")}
            >
              <Plus className="w-4 h-4" />
              Create {activeTab.slice(0, -1)}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
