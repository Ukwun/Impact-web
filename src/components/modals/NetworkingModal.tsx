"use client";

import { useState } from "react";
import { X, MapPin, Briefcase, MessageSquare, UserPlus, Link2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  expertise: string[];
  bio: string;
  avatar: string;
  isConnected: boolean;
  mutualConnections: number;
  lastActive: string;
}

interface Props {
  isOpen: boolean;
  members: Member[];
  onClose: () => void;
  onConnect: (memberId: string) => void;
  onMessage: (memberId: string) => void;
}

export function NetworkingModal({ isOpen, members, onClose, onConnect, onMessage }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [filterByExpertise, setFilterByExpertise] = useState<string | null>(null);

  if (!isOpen) return null;

  let filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesExpertise = !filterByExpertise || member.expertise.includes(filterByExpertise);

    return matchesSearch && matchesExpertise;
  });

  // Get all unique expertise tags
  const allExpertise = Array.from(new Set(members.flatMap((m) => m.expertise)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Network & Connect</h2>
            <p className="text-blue-100 text-sm mt-1">Build professional relationships with fellow members</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedMember ? (
            <div className="flex gap-6 p-6">
              {/* Sidebar Filters */}
              <div className="w-48 space-y-6 flex-shrink-0">
                {/* Search */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Search Members</label>
                  <input
                    type="text"
                    placeholder="Name, title, company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Expertise Filter */}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-3">Filter by Expertise</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allExpertise.map((expertise) => (
                      <button
                        key={expertise}
                        onClick={() => setFilterByExpertise(filterByExpertise === expertise ? null : expertise)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                          filterByExpertise === expertise
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {expertise}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Members Grid */}
              <div className="flex-1">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No members found matching your criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"></div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{member.name}</h4>
                            <p className="text-xs text-gray-600">{member.title}</p>
                            <p className="text-xs text-gray-500">{member.company}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {member.location}
                          </span>
                          {member.mutualConnections > 0 && (
                            <span className="flex items-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              {member.mutualConnections} mutual
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {member.expertise.slice(0, 2).map((exp) => (
                            <span key={exp} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {exp}
                            </span>
                          ))}
                          {member.expertise.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                              +{member.expertise.length - 2}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Member Detail View */
            <div className="p-6">
              <button
                onClick={() => setSelectedMember(null)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4 flex items-center gap-2"
              >
                ← Back to members
              </button>

              <div className="space-y-6">
                {/* Member Header */}
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedMember.name}</h3>
                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {selectedMember.title} at {selectedMember.company}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedMember.location}
                      </p>
                    </div>
                    {selectedMember.mutualConnections > 0 && (
                      <p className="text-sm text-blue-600 mt-2">
                        {selectedMember.mutualConnections} mutual connections
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700 leading-relaxed">{selectedMember.bio}</p>
                </div>

                {/* Expertise */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Expertise & Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.expertise.map((exp) => (
                      <span key={exp} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Active */}
                <p className="text-xs text-gray-500">Last active: {selectedMember.lastActive}</p>

                {/* CTAs */}
                <div className="flex gap-3">
                  {!selectedMember.isConnected ? (
                    <button
                      onClick={() => {
                        onConnect(selectedMember.id);
                        setSelectedMember(null);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Connect
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-200 text-gray-600 font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Link2 className="w-5 h-5" />
                      Connected
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onMessage(selectedMember.id);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
