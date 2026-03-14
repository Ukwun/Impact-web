import { BookOpen } from "lucide-react";

export default function LearningPage() {
  return (
    <div className="container mx-auto px-6 py-24 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-black text-text-500">
          Explore Learning
        </h1>
        <p className="text-xl text-gray-300">
          Discover hundreds of courses, lessons, and learning materials curated by industry experts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Financial Literacy",
            courses: 25,
            students: 12000,
          },
          {
            title: "Entrepreneurship",
            courses: 18,
            students: 8500,
          },
          {
            title: "Leadership",
            courses: 15,
            students: 6300,
          },
          {
            title: "Digital Skills",
            courses: 22,
            students: 9800,
          },
          {
            title: "Professional Development",
            courses: 20,
            students: 7600,
          },
          {
            title: "Technical Training",
            courses: 18,
            students: 5400,
          },
        ].map((category) => (
          <div
            key={category.title}
            className="rounded-2xl bg-dark-700/50 border-2 border-dark-600 hover:border-primary-300 hover:shadow-xl p-8 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-text-500">
                {category.title}
              </h3>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <p>{category.courses} Courses</p>
              <p>{category.students.toLocaleString()} Students</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
