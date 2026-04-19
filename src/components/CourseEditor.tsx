'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Code2,
  Heading2,
  List,
  Quote,
  Image,
  Video,
  FileText,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Loader,
  MoreVertical,
  Zap,
} from 'lucide-react';
import { useLessons, useCourseContentMutations, useAutoSaveDraft } from '@/hooks/useCourseContent';
import { useNotifications } from '@/context/NotificationContext';
import { createNotification } from '@/types/notification';
import { createContentBlock, type ContentBlock } from '@/types/courseContent';

interface CourseEditorProps {
  courseId: string;
  lessonId?: string;
}

type ViewMode = 'edit' | 'preview';

export function CourseEditor({ courseId, lessonId }: CourseEditorProps) {
  const { lessons, isLoading: isLoadingLessons } = useLessons(courseId);
  const { updateContent, publish, isLoading } = useCourseContentMutations();
  const { addNotification } = useNotifications();

  // Editor state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save draft
  const { lastSaved, isSaving } = useAutoSaveDraft(
    courseId,
    {
      lessons: lessons.map((l) =>
        l.id === lessonId ? { ...l, title: lessonTitle, description: lessonDescription, content: blocks } : l
      ),
    },
    isDirty
  );

  // Initialize from lesson
  if (lessonId && lessons.length > 0 && lessonTitle === '') {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) {
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description);
      setBlocks(lesson.content);
    }
  }

  // Add block
  const addBlock = useCallback((type: ContentBlock['type']) => {
    const newBlock = createContentBlock(type, '', blocks.length);
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setIsDirty(true);
  }, [blocks]);

  // Update block content
  const updateBlock = useCallback(
    (blockId: string, content: string) => {
      setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, content } : b)));
      setIsDirty(true);
    },
    [blocks]
  );

  // Delete block
  const deleteBlock = useCallback(
    (blockId: string) => {
      setBlocks(blocks.filter((b) => b.id !== blockId));
      setSelectedBlockId(null);
      setIsDirty(true);
    },
    [blocks]
  );

  // Save content
  const handleSave = async () => {
    if (!lessonId) {
      addNotification(
        createNotification('No Lesson Selected', 'Please select a lesson to save', 'error', {
          priority: 'high',
        })
      );
      return;
    }

    try {
      await updateContent(lessonId, blocks);
      setIsDirty(false);

      addNotification(
        createNotification('Content Saved', 'Your lesson content has been saved successfully', 'success', {
          priority: 'low',
          duration: 3000,
        })
      );
    } catch (err) {
      addNotification(
        createNotification('Save Failed', 'Could not save content', 'error', { priority: 'high' })
      );
    }
  };

  // Publish lesson
  const handlePublish = async () => {
    if (!lessonId) return;

    try {
      await publish(lessonId);

      addNotification(
        createNotification('Lesson Published', 'Your lesson is now available to students', 'success', {
          priority: 'medium',
          duration: 4000,
        })
      );
    } catch (err) {
      addNotification(
        createNotification('Publish Failed', 'Could not publish lesson', 'error', { priority: 'high' })
      );
    }
  };

  // Handle media upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, you'd upload the file
    // For now, create a placeholder block
    const mediaType = file.type.includes('video') ? 'video' : file.type.includes('pdf') ? 'pdf' : 'image';
    const mediaUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const newBlock = createContentBlock(mediaType, mediaUrl, blocks.length);
    setBlocks([...blocks, newBlock]);
    setIsDirty(true);
    setShowMediaUpload(false);

    addNotification(
      createNotification('Media Added', `${file.name} has been added to your lesson`, 'success', {
        priority: 'low',
        duration: 3000,
      })
    );
  };

  if (isLoadingLessons) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{lessonTitle || 'Untitled Lesson'}</h1>
            {lastSaved && (
              <p className="text-xs text-gray-500 mt-1">
                {isSaving ? '⚡ Saving...' : `✓ Saved at ${lastSaved.toLocaleTimeString()}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition text-sm"
            >
              {viewMode === 'edit' ? (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={isLoading || !isDirty}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>

            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
            >
              <Zap className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'edit' ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Lesson Info */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Lesson Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lesson Title *</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => {
                    setLessonTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={lessonDescription}
                  onChange={(e) => {
                    setLessonDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                  rows={3}
                  placeholder="Brief description of what students will learn"
                />
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-4 mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => addBlock('paragraph')}
              className="flex items-center gap-1 px-3 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition text-sm"
              title="Add paragraph"
            >
              <Plus className="w-4 h-4" />
              Text
            </button>

            <button
              onClick={() => addBlock('heading')}
              className="flex items-center gap-1 px-3 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition text-sm"
              title="Add heading"
            >
              <Heading2 className="w-4 h-4" />
              Heading
            </button>

            <button
              onClick={() => addBlock('list')}
              className="flex items-center gap-1 px-3 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition text-sm"
              title="Add list"
            >
              <List className="w-4 h-4" />
              List
            </button>

            <button
              onClick={() => addBlock('code')}
              className="flex items-center gap-1 px-3 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition text-sm"
              title="Add code block"
            >
              <Code2 className="w-4 h-4" />
              Code
            </button>

            <button
              onClick={() => addBlock('quote')}
              className="flex items-center gap-1 px-3 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition text-sm"
              title="Add quote"
            >
              <Quote className="w-4 h-4" />
              Quote
            </button>

            <div className="border-l border-dark-600 mx-2" />

            <button
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              className="flex items-center gap-1 px-3 py-2 bg-dark-700 text-white rounded hover:bg-dark-600 transition text-sm"
              title="Upload media"
            >
              <Image className="w-4 h-4" />
              Media
            </button>

            {showMediaUpload && (
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleMediaUpload}
                accept="image/*,video/*,.pdf"
                className="hidden"
              />
            )}
          </div>

          {/* Media Upload Input */}
          {showMediaUpload && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition"
              >
                Choose File
              </button>
              <p className="text-sm text-blue-300">Select an image, video, or PDF to add to your lesson</p>
            </div>
          )}

          {/* Content Blocks */}
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <div className="bg-dark-800 rounded-lg border border-dashed border-dark-600 p-8 text-center">
                <p className="text-gray-500">No content yet. Use the toolbar above to add content blocks.</p>
              </div>
            ) : (
              blocks.map((block) => (
                <ContentBlockEditor
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => setSelectedBlockId(block.id)}
                  onUpdate={(content) => updateBlock(block.id, content)}
                  onDelete={() => deleteBlock(block.id)}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        // Preview Mode
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-dark-800 rounded-lg border border-dark-700 p-8">
            <h1 className="text-4xl font-bold text-white mb-4">{lessonTitle}</h1>
            <p className="text-gray-400 mb-8">{lessonDescription}</p>

            <div className="prose prose-invert max-w-none space-y-6">
              {blocks.map((block) => (
                <div key={block.id}>
                  {block.type === 'paragraph' && (
                    <div dangerouslySetInnerHTML={{ __html: block.content }} className="text-gray-300" />
                  )}
                  {block.type === 'heading' && <div dangerouslySetInnerHTML={{ __html: block.content }} />}
                  {block.type === 'code' && (
                    <pre className="bg-dark-900 rounded p-4 overflow-auto">
                      <code className="text-green-400 text-sm">{block.content}</code>
                    </pre>
                  )}
                  {block.type === 'quote' && (
                    <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-400">
                      {block.content}
                    </blockquote>
                  )}
                  {block.type === 'list' && <div dangerouslySetInnerHTML={{ __html: block.content }} />}
                  {(block.type === 'image' || block.type === 'video') && (
                    <img src={block.content} alt="Content" className="max-w-full rounded-lg" />
                  )}
                  {block.type === 'pdf' && (
                    <a
                      href={block.content}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-500 hover:underline flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Download PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Content Block Editor Component
 */
interface ContentBlockEditorProps {
  block: ContentBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

function ContentBlockEditor({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: ContentBlockEditorProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`relative rounded-lg border-2 transition ${
        isSelected ? 'border-primary-500 bg-dark-700' : 'border-dark-600 bg-dark-800 hover:border-dark-500'
      }`}
      onClick={onSelect}
    >
      {/* Block Type Badge */}
      <div className="absolute -top-2 left-4 bg-dark-900 px-2 py-1 rounded text-xs font-medium text-primary-400">
        {block.type}
      </div>

      {/* Delete & Menu Buttons */}
      <div className="absolute -top-2 right-4 flex gap-2">
        {isSelected && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 bg-dark-600 text-gray-400 rounded hover:bg-dark-500 hover:text-white transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Content Editor */}
      <div className="p-4 pt-6">
        {block.type === 'heading' ? (
          <input
            type="text"
            value={block.content.replace(/<[^>]*>/g, '')}
            onChange={(e) => onUpdate(`<h2>${e.target.value}</h2>`)}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-2xl font-bold bg-transparent text-white focus:outline-none"
            placeholder="Enter heading"
          />
        ) : block.type === 'code' ? (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-dark-900 text-green-400 p-2 rounded font-mono text-sm focus:outline-none"
            placeholder="Enter code..."
            rows={6}
          />
        ) : block.type === 'quote' ? (
          <textarea
            value={block.content}
            onChange={(e) => onUpdate(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-gray-300 italic focus:outline-none"
            placeholder="Enter quote..."
          />
        ) : (
          <textarea
            value={block.content.replace(/<[^>]*>/g, '')}
            onChange={(e) => onUpdate(`<p>${e.target.value}</p>`)}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-gray-300 focus:outline-none resize-none"
            placeholder="Enter text..."
            rows={4}
          />
        )}
      </div>
    </div>
  );
}
