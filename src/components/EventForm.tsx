'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Loader, ArrowLeft } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  eventType: string;
  price: number;
  isFree: boolean;
  agenda: string;
  tags: string[];
  imageUrl: string;
}

interface EventFormProps {
  eventId?: string;
  initialData?: Partial<EventFormData>;
  onSuccess?: () => void;
}

export default function EventForm({ eventId, initialData, onSuccess }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!eventId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    capacity: 0,
    eventType: 'workshop',
    price: 0,
    isFree: true,
    agenda: '',
    tags: [],
    imageUrl: '',
    ...initialData,
  });

  const [tagInput, setTagInput] = useState('');

  // Fetch event if editing
  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/events/${eventId}`);
          if (!response.ok) throw new Error('Failed to fetch event');

          const data = await response.json();
          setFormData(data.data);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load event';
          setError(message);
        } finally {
          setLoading(false);
        }
      };

      fetchEvent();
    }
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      const method = eventId ? 'PUT' : 'POST';
      const endpoint = eventId ? `/api/admin/events/${eventId}` : '/api/admin/events';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save event');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/admin/events');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Loader className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
        <p className="text-gray-400">Loading event...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-4xl font-black text-white">
            {eventId ? 'Edit Event' : 'Create Event'}
          </h1>
          <p className="text-gray-400">
            {eventId
              ? 'Update event details and save changes'
              : 'Create a new event and start accepting registrations'}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-danger-500/10 border border-danger-500/30">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
            <div>
              <p className="font-semibold text-danger-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white">Basic Information</h3>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Event Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                rows={5}
                className="w-full px-4 py-3 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </section>

          {/* Event Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white">Event Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Event Date *
                </label>
                <Input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Event Type *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-600 border border-dark-500 rounded-lg text-white focus:border-primary-500 focus:outline-none transition-colors"
                >
                  <option value="workshop">Workshop</option>
                  <option value="webinar">Webinar</option>
                  <option value="summit">Summit</option>
                  <option value="networking">Networking</option>
                  <option value="conference">Conference</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          {/* Venue & Capacity */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white">Venue & Capacity</h3>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Venue *
              </label>
              <Input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Enter event venue or location"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Capacity
              </label>
              <Input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited capacity"
                min="0"
              />
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white">Pricing</h3>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded bg-dark-600 border border-dark-500 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-white font-semibold">Free Event</span>
              </label>
            </div>

            {!formData.isFree && (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Price
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">$</span>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Additional Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-white">Additional Information</h3>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Image URL
              </label>
              <Input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Agenda
              </label>
              <textarea
                name="agenda"
                value={formData.agenda}
                onChange={handleInputChange}
                placeholder="Describe the event agenda and schedule"
                rows={4}
                className="w-full px-4 py-3 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Topics/Tags
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a topic and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-2 rounded-full bg-primary-500/20 text-primary-300 text-sm font-semibold flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-primary-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-dark-600">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : eventId ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
