'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  quote: string;
  rating: number;
  category: string;
  createdAt: string;
  isLoading?: boolean;
}

interface UseTestimonialsReturn {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
}

/**
 * useTestimonials Hook
 * Fetches testimonials from the API
 */
export function useTestimonials(limit: number = 10, category?: string): UseTestimonialsReturn {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        let url = `/api/testimonials?limit=${limit}`;
        if (category) {
          url += `&category=${category}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }

        const data = await response.json();
        setTestimonials(data.data.testimonials);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [limit, category]);

  return { testimonials, loading, error };
}
