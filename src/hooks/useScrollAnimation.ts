import { useEffect, useRef, useState } from 'react';

/**
 * Hook to trigger animations when elements enter the viewport
 * Usage: const { ref, isVisible } = useScrollAnimation();
 * Then apply className based on isVisible state
 */
export const useScrollAnimation = (options = {}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Stop observing after element becomes visible to prevent re-triggering
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1, // Trigger when 10% of element is visible
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isVisible };
};
