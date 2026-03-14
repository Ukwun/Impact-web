'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useEvents } from '@/hooks/useEvents';
import Link from 'next/link';
import { BookOpen, Calendar, Award, TrendingUp, Clock, Users } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useCourses(3);
  const { events, loading: eventsLoading } = useEvents(3);

  const stats = [
    { icon: BookOpen, label: 'Courses Enrolled', value: '5', color: 'primary' },
    { icon: Clock, label: 'Hours Learned', value: '24.5h', color: 'secondary' },
    { icon: Award, label: 'Certificates', value: '2', color: 'green' },
    { icon: TrendingUp, label: 'Progress', value: '68%', color: 'blue' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-400">
          Continue your learning journey and track your progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            primary: 'from-primary-500 to-primary-600',
            secondary: 'from-secondary-500 to-secondary-600',
            green: 'from-green-500 to-green-600',
            blue: 'from-blue-500 to-blue-600',
          };

          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-dark-500 to-dark-600 rounded-2xl p-6 border-2 border-dark-400 hover:border-primary-500 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[stat.color]} flex items-center justify-center mb-4`}>
                <Icon className="text-white" size={24} />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">My Courses</h2>
            <Link href="/dashboard/courses" className="text-primary-400 hover:text-primary-300 font-semibold text-sm">
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {coursesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-dark-500 rounded-lg h-24 animate-pulse"></div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/dashboard/courses/${course.id}`}
                  className="bg-gradient-to-r from-dark-500 to-dark-600 rounded-lg p-6 border-2 border-dark-400 hover:border-primary-500 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-primary-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {course.instructor}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-dark-400 rounded-full h-2 mb-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '68%' }}
                    ></div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{course.lessonCount} lessons</span>
                    <span>•</span>
                    <span>{Math.ceil(course.duration / 60)}h total</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400">No courses yet. Explore our course library!</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white mb-6">Upcoming Events</h2>

          <div className="space-y-4">
            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-dark-500 rounded-lg h-20 animate-pulse"></div>
                ))}
              </div>
            ) : events.length > 0 ? (
              events.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-lg p-4 border-2 border-primary-500/40 hover:border-primary-500 transition-all duration-300"
                >
                  <h3 className="font-bold text-white text-sm mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Calendar size={14} />
                    <span>
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No upcoming events</p>
            )}
          </div>

          <Link
            href="/dashboard/events"
            className="w-full mt-6 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition-colors duration-300 text-center"
          >
            View All Events
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-dark-500 to-dark-600 rounded-2xl p-8 border-2 border-dark-400">
        <h2 className="text-2xl font-black text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-dark-400">
            <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center">
              <Award size={20} className="text-primary-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Certificate Earned</p>
              <p className="text-sm text-gray-400">Completed Financial Literacy course</p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pb-4 border-b border-dark-400">
            <div className="w-12 h-12 rounded-full bg-secondary-600/20 flex items-center justify-center">
              <BookOpen size={20} className="text-secondary-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Course Enrolled</p>
              <p className="text-sm text-gray-400">Joined Digital Skills Bootcamp</p>
              <p className="text-xs text-gray-500 mt-1">5 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
              <Users size={20} className="text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Joined Circle</p>
              <p className="text-sm text-gray-400">Connected with mentorship circle</p>
              <p className="text-xs text-gray-500 mt-1">1 week ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
