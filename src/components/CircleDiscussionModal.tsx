import React, { useState, useMemo } from 'react';
import { MessageSquare, ThumbsUp, User, X, Send } from 'lucide-react';

interface Discussion {
  id: string;
  author: string;
  authorRole?: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: number;
  isLiked: boolean;
  tags: string[];
}

interface CircleDiscussionModalProps {
  isOpen: boolean;
  circleName?: string;
  discussions: Discussion[];
  onClose: () => void;
  onPostDiscussion: (title: string, content: string, tags: string[]) => Promise<void>;
  onLikeDiscussion?: (discussionId: string) => Promise<void>;
}

const CircleDiscussionModal: React.FC<CircleDiscussionModalProps> = ({
  isOpen,
  circleName,
  discussions,
  onClose,
  onPostDiscussion,
  onLikeDiscussion,
}) => {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const sortedDiscussions = useMemo(() => {
    const sorted = [...discussions];
    if (sortBy === 'popular') {
      sorted.sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [discussions, sortBy]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePostDiscussion = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setIsPosting(true);
    try {
      await onPostDiscussion(title, content, tags);
      setTitle('');
      setContent('');
      setTags([]);
      setView('list');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (discussionId: string) => {
    if (onLikeDiscussion) {
      await onLikeDiscussion(discussionId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {circleName} {view === 'create' && '→ Start Discussion'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {view === 'list' && (
            <div className="space-y-6">
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setView('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Start Discussion
                </button>

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      sortBy === 'popular'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Popular
                  </button>
                </div>
              </div>

              {/* Discussions List */}
              <div className="space-y-4">
                {sortedDiscussions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No discussions yet. Start one!</p>
                  </div>
                ) : (
                  sortedDiscussions.map(discussion => (
                    <div
                      key={discussion.id}
                      onClick={() => {
                        setSelectedDiscussion(discussion);
                        setView('detail');
                      }}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-500 mb-1">
                            {discussion.author}
                            {discussion.authorRole && (
                              <span className="ml-2 inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                                {discussion.authorRole}
                              </span>
                            )}
                          </p>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {discussion.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {discussion.content}
                          </p>

                          <div className="flex gap-2 mb-3 flex-wrap">
                            {discussion.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-4 text-sm text-gray-500">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(discussion.id);
                              }}
                              className={`flex items-center gap-1 hover:text-gray-700 transition-colors ${
                                discussion.isLiked ? 'text-red-600' : ''
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              {discussion.likes}
                            </button>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {discussion.replies} replies
                            </span>
                            <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {view === 'create' && (
            <div className="space-y-6">
              <button
                onClick={() => setView('list')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Discussions
              </button>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Discussion Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or insights..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePostDiscussion}
                  disabled={isPosting || !title.trim() || !content.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isPosting ? 'Posting...' : 'Post Discussion'}
                </button>
                <button
                  onClick={() => setView('list')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {view === 'detail' && selectedDiscussion && (
            <div className="space-y-6">
              <button
                onClick={() => setView('list')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Discussions
              </button>

              <div className="border-b pb-6">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {selectedDiscussion.author}
                      {selectedDiscussion.authorRole && (
                        <span className="ml-2 inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                          {selectedDiscussion.authorRole}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {selectedDiscussion.title}
                </h2>

                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {selectedDiscussion.content}
                </p>

                <div className="flex gap-2 flex-wrap mb-4">
                  {selectedDiscussion.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={() => handleLike(selectedDiscussion.id)}
                  className={`flex items-center gap-2 text-lg font-bold transition-colors ${
                    selectedDiscussion.isLiked
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  {selectedDiscussion.likes}
                </button>
                <div className="flex items-center gap-2 text-lg font-bold text-gray-500">
                  <MessageSquare className="w-5 h-5" />
                  {selectedDiscussion.replies}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircleDiscussionModal;
