import React, { useState, useMemo } from 'react';
import { User, MessageSquare, Trophy, FileText, X, Search } from 'lucide-react';

interface CircleMember {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  contributions: number;
  discussions: number;
  joinedDate: string;
  bio: string;
}

interface CircleMembersModalProps {
  isOpen: boolean;
  circleName?: string;
  members: CircleMember[];
  onClose: () => void;
  onMessageMember?: (memberId: string) => Promise<void>;
}

const CircleMembersModal: React.FC<CircleMembersModalProps> = ({
  isOpen,
  circleName,
  members,
  onClose,
  onMessageMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'active'>('recent');

  const allExpertise = useMemo(() => {
    const expertise = new Set<string>();
    members.forEach(m => m.expertise.forEach(e => expertise.add(e)));
    return Array.from(expertise).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesExpertise = !selectedExpertise || member.expertise.includes(selectedExpertise);
      return matchesSearch && matchesExpertise;
    });
  }, [members, searchTerm, selectedExpertise]);

  const sortedMembers = useMemo(() => {
    const sorted = [...filteredMembers];
    if (sortBy === 'active') {
      sorted.sort((a, b) => (b.contributions + b.discussions) - (a.contributions + a.discussions));
    } else {
      sorted.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
    }
    return sorted;
  }, [filteredMembers, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {circleName} Members
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {selectedMember ? (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Members
              </button>

              {/* Member Detail View */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
                <div className="flex gap-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-12 h-12 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                      {selectedMember.name}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      {selectedMember.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(selectedMember.joinedDate).toLocaleDateString()}
                    </p>
                  </div>

                  {onMessageMember && (
                    <button
                      onClick={() => onMessageMember(selectedMember.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 h-fit"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  )}
                </div>

                <p className="text-gray-700 mb-6">
                  {selectedMember.bio}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedMember.contributions}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                      <FileText className="w-4 h-4" />
                      Contributions
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedMember.discussions}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                      <MessageSquare className="w-4 h-4" />
                      Discussions
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.floor((selectedMember.contributions + selectedMember.discussions) / 3)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                      <Trophy className="w-4 h-4" />
                      Score
                    </div>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3">Expertise</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedMember.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members by name, title, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedExpertise(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedExpertise === null
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Expertise
                  </button>
                  {allExpertise.map(expertise => (
                    <button
                      key={expertise}
                      onClick={() => setSelectedExpertise(expertise)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedExpertise === expertise
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {expertise}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Recently Joined
                  </button>
                  <button
                    onClick={() => setSortBy('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      sortBy === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Most Active
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                {sortedMembers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No members found</p>
                  </div>
                ) : (
                  sortedMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
                    >
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-8 h-8 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {member.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {member.title}
                          </p>

                          <div className="flex gap-4 text-sm text-gray-700 mb-2">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {member.contributions} contributions
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {member.discussions} discussions
                            </span>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {member.expertise.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {member.expertise.length > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{member.expertise.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircleMembersModal;
