'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePublicResources } from '@/hooks/useFetchData';
import {
  BookOpen,
  HelpCircle,
  Video,
  FileText,
  Users,
  Lightbulb,
  Download,
  Loader,
  AlertCircle,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'guide' | 'video' | 'document' | 'tool';
  url?: string;
  downloadUrl?: string;
  views?: number;
}

interface ResourcesData {
  guides: Resource[];
  tutorials: Resource[];
  documents: Resource[];
  tools: Resource[];
}

export default function ResourcesPage() {
  const [isVisible, setIsVisible] = useState(false);

  // Use the public resources hook
  const { 
    data: resources, 
    loading, 
    error, 
    refetch 
  } = usePublicResources();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <BookOpen className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'document':
        return <FileText className="w-6 h-6" />;
      case 'tool':
        return <Lightbulb className="w-6 h-6" />;
      default:
        return <HelpCircle className="w-6 h-6" />;
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card className="p-6 flex flex-col hover:shadow-lg transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
          {getResourceIcon(resource.type)}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">{resource.title}</h3>
          <p className="text-xs text-gray-400 mt-1">{resource.category}</p>
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-4 flex-1">{resource.description}</p>
      {resource.views && (
        <p className="text-xs text-gray-500 mb-4">{resource.views.toLocaleString()} views</p>
      )}
      <div className="flex gap-2">
        {resource.url && (
          <Link href={resource.url} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Open
            </Button>
          </Link>
        )}
        {resource.downloadUrl && (
          <a href={resource.downloadUrl} download className="flex-1">
            <Button variant="secondary" size="sm" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </a>
        )}
        {!resource.url && !resource.downloadUrl && (
          <Button variant="outline" size="sm" className="w-full">
            Learn More
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div
      className={`space-y-8 pb-12 transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2">
          Learning Resources 📚
        </h1>
        <p className="text-base sm:text-lg text-gray-300">
          Access guides, tutorials, and tools to succeed on your learning journey
        </p>
      </div>

      {loading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-300">Loading resources...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 border-l-4 border-red-500 bg-dark-700/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400">Error Loading Resources</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button onClick={() => refetch()} className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      ) : resources ? (
        <>
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/dashboard/resources/library"
              className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-primary-600/50 transition-all group"
            >
              <BookOpen className="text-primary-100 group-hover:scale-110 transition-transform mb-4" size={40} />
              <h2 className="text-2xl font-black text-white mb-2">Learning Library</h2>
              <p className="text-primary-100">Access books, articles, and multimedia resources</p>
              <span className="inline-block mt-4 text-primary-200 font-semibold">Browse →</span>
            </Link>

            <Link
              href="/dashboard/resources/guides"
              className="bg-gradient-to-br from-secondary-600 to-secondary-700 rounded-2xl p-8 hover:shadow-lg hover:shadow-secondary-600/50 transition-all group"
            >
              <HelpCircle className="text-secondary-100 group-hover:scale-110 transition-transform mb-4" size={40} />
              <h2 className="text-2xl font-black text-white mb-2">Help & Guides</h2>
              <p className="text-secondary-100">Get help with learning and platform features</p>
              <span className="inline-block mt-4 text-secondary-200 font-semibold">View →</span>
            </Link>
          </div>

          {/* Guides Section */}
          {resources.guides.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Getting Started Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.guides.map((guide) => (
                  <ResourceCard key={guide.id} resource={guide} />
                ))}
              </div>
            </div>
          )}

          {/* Tutorials Section */}
          {resources.tutorials.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Video Tutorials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.tutorials.map((tutorial) => (
                  <ResourceCard key={tutorial.id} resource={tutorial} />
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {resources.documents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Documents & Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.documents.map((document) => (
                  <ResourceCard key={document.id} resource={document} />
                ))}
              </div>
            </div>
          )}

          {/* Tools Section */}
          {resources.tools.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Learning Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.tools.map((tool) => (
                  <ResourceCard key={tool.id} resource={tool} />
                ))}
              </div>
            </div>
          )}

          {/* Contact Support */}
          <Card className="p-8 bg-gradient-to-br from-dark-700 to-dark-800 border-primary-500/50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-500/20 rounded-lg">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Still need help?</h3>
                <p className="text-gray-300 mb-4">
                  Our support team is here to help you succeed. Reach out with any questions or concerns.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Link href="/dashboard/messages">
                    <Button variant="primary" size="sm">
                      Contact Support
                    </Button>
                  </Link>
                  <a href="mailto:support@impact.edu">
                    <Button variant="outline" size="sm">
                      Email Support
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
