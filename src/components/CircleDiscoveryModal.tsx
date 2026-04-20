import React, { useState, useMemo } from 'react';
import { Search, Users, Zap, X } from 'lucide-react';

interface Circle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  focusAreas: string[];
  recentActivity: string;
  joined: boolean;
}

interface CircleDiscoveryModalProps {
  isOpen: boolean;
  circles: Circle[];
  onClose: () => void;
  onJoinCircle: (circleId: string) => Promise<void>;
}

const CircleDiscoveryModal: React.FC<CircleDiscoveryModalProps> = ({
  isOpen,
  circles,
  onClose,
  onJoinCircle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [...new Set(circles.map(c => c.category))];
  }, [circles]);

  const filteredCircles = useMemo(() => {
    return circles.filter(circle => {
      const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circle.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || circle.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [circles, searchTerm, selectedCategory]);

  const handleJoinClick = async (e: React.MouseEvent, circleId: string) => {
    e.stopPropagation();
    setJoiningId(circleId);
    try {
      await onJoinCircle(circleId);
      setSelectedCircle(null);
    } finally {
      setJoiningId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Explore Professional Circles</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search circles, topics, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Circles Grid */}
          {selectedCircle ? (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setSelectedCircle(null)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Circles
              </button>

              {/* Circle Detail View */}
              <div className="border rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedCircle.name}
                    </h3>
                    <p className="text-gray-600 text-lg mb-4">
                      {selectedCircle.description}
                    </p>
                  </div>
                  {!selectedCircle.joined && (
                    <button
                      onClick={(e) => handleJoinClick(e, selectedCircle.id)}
                      disabled={joiningId === selectedCircle.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {joiningId === selectedCircle.id ? 'Joining...' : 'Join Circle'}
                    </button>
                  )}
                  {selectedCircle.joined && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Joined
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-gray-500 text-sm font-medium">Category</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedCircle.category}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-gray-500 text-sm font-medium">Members</div>
                    <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {selectedCircle.memberCount}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-gray-500 text-sm font-medium">Recent Activity</div>
                    <div className="text-lg font-bold text-gray-900">
                      {selectedCircle.recentActivity}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">Focus Areas</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedCircle.focusAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCircles.map(circle => (
                <div
                  key={circle.id}
                  onClick={() => setSelectedCircle(circle)}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {circle.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {circle.description}
                      </p>
                    </div>
                    {circle.joined && (
                      <div className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Joined
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {circle.category}
                    </span>
                    <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {circle.memberCount}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last activity: {circle.recentActivity}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredCircles.length === 0 && !selectedCircle && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No circles found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircleDiscoveryModal;
