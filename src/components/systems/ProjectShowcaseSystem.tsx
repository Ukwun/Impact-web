/**
 * Project/Showcase System Component
 * Portfolio and capstone project management with peer review
 * ImpactApp Platform - April 23, 2026
 */

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ========================================================================
// TYPES
// ========================================================================

interface StudentProject {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  status: "PLANNING" | "IN_DEVELOPMENT" | "REVIEW" | "SHOWCASED" | "ARCHIVED";
  startDate: string;
  dueDate: string;
  completionDate?: string;
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  collaborators: Collaborator[];
  thumbnail?: string;
  files: ProjectFile[];
  description_full: string;
  learningOutcomes: string[];
  techniquesUsed: string[];
  grade?: number;
  feedback?: ProjectFeedback;
  views: number;
  likes: number;
  isLiked: boolean;
  isFeatured: boolean;
  visibility: "PRIVATE" | "COURSE_ONLY" | "PUBLIC";
}

interface Collaborator {
  id: string;
  name: string;
  role: string; // e.g., "Designer", "Developer", "Researcher"
  avatar?: string;
}

interface ProjectFile {
  id: string;
  type: "VIDEO" | "IMAGE" | "DOCUMENT" | "CODE" | "INTERACTIVE" | "PRESENTATION";
  title: string;
  url: string;
  fileSize: string;
  uploadedDate: string;
  description?: string;
}

interface ProjectFeedback {
  overallGrade: number;
  rubricScores: RubricScore[];
  instructorComments: string;
  peerReviews: PeerReview[];
  suggestedImprovements: string[];
}

interface RubricScore {
  criteria: string;
  maxPoints: number;
  earnedPoints: number;
  feedback?: string;
}

interface PeerReview {
  reviewerId: string;
  reviewerName: string;
  date: string;
  rating: number; // 1-5
  comment: string;
  helpful: number; // votes
}

interface ProjectShowcase {
  id: string;
  name: string;
  description: string;
  type: "COURSE_SHOWCASE" | "SCHOOL_SHOWCASE" | "THEMATIC_SHOWCASE" | "ACHIEVEMENT_GALLERY";
  startDate: string;
  endDate: string;
  featuredProjects: StudentProject[];
  participantCount: number;
  viewCount: number;
  status: "PLANNING" | "LIVE" | "CLOSED" | "ARCHIVED";
  theme?: string;
  requirements?: string[];
}

interface Portfolio {
  studentId: string;
  profileUrl: string;
  bio: string;
  skills: string[];
  completedProjects: StudentProject[];
  currentProjects: StudentProject[];
  showcases: ProjectShowcase[];
  stats: {
    totalProjects: number;
    skillsDeveloped: number;
    likeCount: number;
    viewCount: number;
  };
  collaborationScore: number; // 0-100
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: string;
  replies: Comment[];
  likes: number;
  isLiked: boolean;
}

interface ProjectSystemData {
  projects: StudentProject[];
  portfolio: Portfolio;
  showcases: ProjectShowcase[];
  recommendations: StudentProject[];
  comments: Comment[];
}

// ========================================================================
// MAIN COMPONENT
// ========================================================================

export default function ProjectShowcaseSystem() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemData, setSystemData] = useState<ProjectSystemData | null>(null);
  const [activeView, setActiveView] = useState<"gallery" | "my-projects" | "portfolio" | "showcases" | "create">("gallery");
  const [selectedProject, setSelectedProject] = useState<StudentProject | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest");

  useEffect(() => {
    loadProjectData();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadProjectData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/projects/system");

      if (response.data.success) {
        setSystemData(response.data.data);
      } else {
        setError("Unable to load project system");
      }
    } catch (err) {
      console.error("Error loading project data:", err);
      setError("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleLikeProject = async (projectId: string) => {
    try {
      await axios.post(`/api/projects/${projectId}/like`);
      await loadProjectData();
    } catch (err) {
      console.error("Error liking project:", err);
    }
  };

  const handlePostComment = async () => {
    if (!selectedProject || !commentText.trim()) return;

    try {
      await axios.post(`/api/projects/${selectedProject.id}/comments`, {
        text: commentText,
      });
      setCommentText("");
      await loadProjectData();
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment");
    }
  };

  const handleStartPeerReview = (projectId: string) => {
    router.push(`/projects/${projectId}/review`);
  };

  const handleViewPortfolio = (studentId: string) => {
    router.push(`/portfolio/${studentId}`);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading project showcase...</p>
        </div>
      </div>
    );
  }

  if (!systemData) {
    return null;
  }

  const { projects, portfolio, showcases, recommendations, comments } = systemData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎨 Project Showcase</h1>
              <p className="text-gray-600 mt-1">Showcase your work, collaborate, and inspire others</p>
            </div>
            <button
              onClick={() => setActiveView("create")}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold"
              data-button="create-project"
            >
              + New Project
            </button>
          </div>

          {/* Portfolio Stats */}
          {portfolio && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Projects" value={portfolio.stats.totalProjects} icon="📁" />
              <StatCard label="Views" value={portfolio.stats.viewCount} icon="👁️" />
              <StatCard label="Likes" value={portfolio.stats.likeCount} icon="❤️" />
              <StatCard label="Skills" value={portfolio.stats.skillsDeveloped} icon="⭐" />
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "gallery", label: "Gallery", icon: "🖼️" },
              { id: "my-projects", label: "My Projects", icon: "📁" },
              { id: "portfolio", label: "Portfolio", icon: "👤" },
              { id: "showcases", label: "Showcases", icon: "🎭" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  activeView === tab.id
                    ? "bg-pink-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                data-button={`tab-${tab.id}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* GALLERY VIEW */}
        {activeView === "gallery" && (
          <div className="space-y-8">
            {/* Search & Filter */}
            <div className="flex gap-4 flex-col md:flex-row">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-600"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-600"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            {/* Featured Projects */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ Featured</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {projects
                  .filter((p) => p.isFeatured)
                  .slice(0, 3)
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={() => setSelectedProject(project)}
                      onLike={() => handleLikeProject(project.id)}
                    />
                  ))}
              </div>
            </section>

            {/* All Projects */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter((p) => !p.isFeatured && p.visibility !== "PRIVATE")
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={() => setSelectedProject(project)}
                      onLike={() => handleLikeProject(project.id)}
                    />
                  ))}
              </div>
            </section>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Recommended for You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.slice(0, 3).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={() => setSelectedProject(project)}
                      onLike={() => handleLikeProject(project.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* MY PROJECTS VIEW */}
        {activeView === "my-projects" && (
          <div className="space-y-6">
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-600"
            >
              <option value="ALL">All Projects</option>
              <option value="PLANNING">Planning</option>
              <option value="IN_DEVELOPMENT">In Development</option>
              <option value="REVIEW">Under Review</option>
              <option value="SHOWCASED">Showcased</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio?.completedProjects
                .filter((p) => filterStatus === "ALL" || p.status === filterStatus)
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={() => setSelectedProject(project)}
                    onLike={() => handleLikeProject(project.id)}
                    isOwner
                  />
                ))}
            </div>

            {portfolio?.currentProjects && portfolio.currentProjects.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Currently Working On</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.currentProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={() => setSelectedProject(project)}
                      onLike={() => handleLikeProject(project.id)}
                      isOwner
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO VIEW */}
        {activeView === "portfolio" && portfolio && (
          <section className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-32 h-32 rounded-full bg-pink-200"></div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Your Portfolio</h2>
                  <p className="text-gray-600 mt-2">{portfolio.bio}</p>
                  <div className="flex gap-4 mt-4">
                    <StatItem label="Projects" value={portfolio.stats.totalProjects} />
                    <StatItem label="Collaboration" value={`${portfolio.collaborationScore}%`} />
                    <StatItem label="Skills" value={portfolio.stats.skillsDeveloped} />
                  </div>
                </div>
              </div>

              {/* Skills */}
              {portfolio.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Skills Developed</h3>
                  <div className="flex flex-wrap gap-3">
                    {portfolio.skills.map((skill, idx) => (
                      <SkillTag key={idx} skill={skill} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Featured Work */}
            {portfolio.completedProjects.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Featured Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.completedProjects
                    .filter((p) => p.isFeatured)
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={() => setSelectedProject(project)}
                        onLike={() => handleLikeProject(project.id)}
                      />
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* SHOWCASES VIEW */}
        {activeView === "showcases" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Showcases</h2>
            {showcases.map((showcase) => (
              <ShowcaseCard key={showcase.id} showcase={showcase} />
            ))}
          </section>
        )}

        {/* CREATE PROJECT VIEW */}
        {activeView === "create" && (
          <section className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project Title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-600"
              />
              <textarea
                placeholder="Project Description"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-600"
              ></textarea>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-600">
                <option>Select a Course</option>
              </select>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-600">
                <option>BEGINNER</option>
                <option>INTERMEDIATE</option>
                <option>ADVANCED</option>
              </select>
              <button
                className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 font-semibold"
                data-button="submit-project"
              >
                Create Project
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onLike={() => handleLikeProject(selectedProject.id)}
          onStartReview={() => handleStartPeerReview(selectedProject.id)}
        />
      )}
    </div>
  );
}

// ========================================================================
// SUB-COMPONENTS
// ========================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border-b-2 border-pink-600 shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface ProjectCardProps {
  project: StudentProject;
  onSelect: () => void;
  onLike: () => void;
  isOwner?: boolean;
}

function ProjectCard({ project, onSelect, onLike, isOwner }: ProjectCardProps) {
  const statusColor = {
    PLANNING: "bg-blue-100 text-blue-800",
    IN_DEVELOPMENT: "bg-yellow-100 text-yellow-800",
    REVIEW: "bg-purple-100 text-purple-800",
    SHOWCASED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
  }[project.status];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer">
      {/* Thumbnail */}
      <div
        className="h-40 bg-gradient-to-br from-pink-400 to-rose-600"
        onClick={onSelect}
      ></div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 flex-1">{project.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor}`}>
            {project.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">{project.courseName}</p>
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>

        {/* Owner */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
          <div className="w-6 h-6 rounded-full bg-pink-200"></div>
          <span className="text-sm text-gray-600">{project.owner.name}</span>
        </div>

        {/* Stats & Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-3 text-sm text-gray-600">
            <span>👁️ {project.views}</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className="cursor-pointer hover:text-pink-600"
            >
              {project.isLiked ? "❤️" : "🤍"} {project.likes}
            </span>
          </div>
        </div>

        <button
          onClick={onSelect}
          className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-semibold"
          data-button="view-project"
        >
          View Project
        </button>
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface SkillTagProps {
  skill: string;
}

function SkillTag({ skill }: SkillTagProps) {
  return (
    <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-semibold">
      {skill}
    </span>
  );
}

interface ShowcaseCardProps {
  showcase: ProjectShowcase;
}

function ShowcaseCard({ showcase }: ShowcaseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{showcase.name}</h3>
          <p className="text-gray-600">{showcase.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            showcase.status === "LIVE"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {showcase.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
        <StatItem label="Projects" value={showcase.participantCount} />
        <StatItem label="Views" value={showcase.viewCount} />
        <StatItem label="Type" value={showcase.type.replace("_", " ")} />
      </div>

      <button
        className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-semibold"
        data-button="view-showcase"
      >
        View Showcase →
      </button>
    </div>
  );
}

interface ProjectDetailModalProps {
  project: StudentProject;
  onClose: () => void;
  onLike: () => void;
  onStartReview: () => void;
}

function ProjectDetailModal({
  project,
  onClose,
  onLike,
  onStartReview,
}: ProjectDetailModalProps) {
  const [commentText, setCommentText] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b flex justify-between items-start p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="text-gray-600">{project.courseName}</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
            <p className="text-gray-700">{project.description_full}</p>
          </div>

          {/* Learning Outcomes */}
          {project.learningOutcomes.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Learning Outcomes</h4>
              <ul className="list-disc list-inside space-y-1">
                {project.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="text-gray-700">
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Techniques Used */}
          {project.techniquesUsed.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Techniques Used</h4>
              <div className="flex flex-wrap gap-2">
                {project.techniquesUsed.map((tech, idx) => (
                  <SkillTag key={idx} skill={tech} />
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {project.files.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Project Files</h4>
              <div className="space-y-2">
                {project.files.map((file) => (
                  <FileItem key={file.id} file={file} />
                ))}
              </div>
            </div>
          )}

          {/* Grade & Feedback */}
          {project.grade !== undefined && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-lg font-bold text-blue-900 mb-2">
                Grade: {project.grade}%
              </p>
              {project.feedback?.instructorComments && (
                <p className="text-blue-800">{project.feedback.instructorComments}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onLike}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 font-semibold"
              data-button="like-project"
            >
              {project.isLiked ? "❤️" : "🤍"} Like ({project.likes})
            </button>
            <button
              onClick={onStartReview}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
              data-button="peer-review"
            >
              Review Project
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 font-semibold"
              data-button="close-modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FileItemProps {
  file: ProjectFile;
}

function FileItem({ file }: FileItemProps) {
  const typeIcon = {
    VIDEO: "🎥",
    IMAGE: "🖼️",
    DOCUMENT: "📄",
    CODE: "💻",
    INTERACTIVE: "🎮",
    PRESENTATION: "📊",
  }[file.type];

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
    >
      <span className="text-2xl">{typeIcon}</span>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{file.title}</p>
        <p className="text-xs text-gray-600">{file.fileSize}</p>
      </div>
      <span className="text-gray-400">→</span>
    </a>
  );
}
