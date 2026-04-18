"use client";

import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Financial Literacy: The Foundation of Economic Independence",
      excerpt: "Discover how understanding personal finance transforms economic opportunities and builds long-term wealth.",
      author: "ImpactKnowledge Team",
      date: "January 15, 2026",
      category: "Financial Education",
      color: "from-blue-500 to-purple-500"
    },
    {
      id: 2,
      title: "Entrepreneurship in Africa: Opportunities and Challenges",
      excerpt: "Explore the dynamic startup ecosystem across Africa and discover how aspiring entrepreneurs can navigate growth.",
      author: "Sarah Oladele",
      date: "January 10, 2026",
      category: "Entrepreneurship",
      color: "from-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "Investment for Impact: Aligning Returns with Purpose",
      excerpt: "Learn how impact investors are creating financial returns while driving meaningful social and environmental change.",
      author: "Kunle Akinwale",
      date: "January 5, 2026",
      category: "Impact Investing",
      color: "from-green-500 to-teal-500"
    },
    {
      id: 4,
      title: "Building Sustainable Ventures: The Circular Economy Model",
      excerpt: "Understand how circular economy principles create competitive advantages while reducing environmental impact.",
      author: "Amara Okafor",
      date: "December 28, 2025",
      category: "Sustainability",
      color: "from-emerald-500 to-cyan-500"
    },
    {
      id: 5,
      title: "The Future of Financial Services in Africa",
      excerpt: "Fintech innovation is transforming banking accessibility. Explore emerging trends shaping financial inclusion.",
      author: "ImpactKnowledge Research",
      date: "December 22, 2025",
      category: "FinTech",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 6,
      title: "Skills for Success: What Employers Are Looking For",
      excerpt: "Navigate the job market with insights on the most sought-after skills and how to develop them effectively.",
      author: "Grace Udeze",
      date: "December 15, 2025",
      category: "Career Development",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-dark-900 via-blue-900/30 to-dark-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Insights & Stories</span>
            </div>

            <h1 className="text-6xl font-black text-white leading-tight">
              ImpactKnowledge Blog
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed">
              Insights on financial literacy, entrepreneurship, impact investing, and building Africa's economic future.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-24 bg-dark-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="h-48 rounded-t-2xl bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-dark-700 group-hover:border-primary-500/30 transition-colors overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br ${post.color} opacity-10`}></div>
                </div>

                <div className="bg-dark-700 border-2 border-t-0 border-dark-700 group-hover:border-primary-500/30 transition-colors rounded-b-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-3 line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-dark-600">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="text-primary-400 group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-black text-white">Stay Updated</h2>
            <p className="text-lg text-white text-opacity-90">
              Subscribe to our newsletter for weekly insights on financial literacy, entrepreneurship, and impact investing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg bg-white text-dark-900 font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="px-8 py-3 bg-white text-blue-600 font-black rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-dark-900 border-t border-dark-700">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="text-primary-400 hover:text-primary-300 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
