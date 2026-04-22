'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  price: number;
  description?: string;
}

export default function StripeCheckoutPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [currency, setCurrency] = useState<'usd' | 'gbp'>('usd');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/courses?published=true', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        const paidCourses = data.data.filter((course: Course) => course.price > 0);
        setCourses(paidCourses);

        if (paidCourses.length > 0) {
          setSelectedCourse(paidCourses[0].id);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Unable to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCheckout = async () => {
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const course = courses.find((c) => c.id === selectedCourse);
      if (!course) {
        throw new Error('Course not found');
      }

      const token = localStorage.getItem('authToken');

      // Convert price to cents for Stripe
      const amountInCents = Math.round(course.price * 100);

      // Create checkout session
      const response = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          amount: amountInCents,
          currency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      if (data.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Error processing checkout:', err);
      setError(err instanceof Error ? err.message : 'Failed to process checkout');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">No Paid Courses</h1>
          <p className="text-gray-400 mb-6">There are no paid courses available at this time.</p>
          <Link
            href="/dashboard"
            className="inline-block bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/payments" className="text-primary-400 hover:text-primary-300 mb-8 inline-block">
          ← Back to Payment Methods
        </Link>

        <div className="bg-dark-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Stripe Checkout</h1>
          <p className="text-gray-400 mb-8">Complete your enrollment with Stripe</p>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Course Selection */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-dark-700 text-white border border-gray-600 rounded-lg p-3"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} - ${course.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Selection */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">Currency</label>
            <div className="grid grid-cols-2 gap-4">
              {(['usd', 'gbp'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`p-4 rounded-lg font-semibold transition-colors ${
                    currency === curr
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  {curr === 'usd' ? '🇺🇸 USD ($)' : '🇬🇧 GBP (£)'}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {selectedCourseData && (
            <div className="bg-dark-700 rounded-lg p-6 mb-8">
              <h3 className="text-white font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>{selectedCourseData.title}</span>
                  <span>
                    {currency === 'usd' ? '$' : '£'}
                    {selectedCourseData.price.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-3 flex justify-between text-white font-semibold">
                  <span>Total</span>
                  <span>
                    {currency === 'usd' ? '$' : '£'}
                    {selectedCourseData.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={processing || !selectedCourse}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing && <Loader className="w-5 h-5 animate-spin" />}
            {processing ? 'Processing...' : 'Proceed to Stripe Checkout'}
          </button>

          {/* Security Info */}
          <div className="mt-8 p-4 bg-dark-700 rounded-lg text-gray-400 text-sm">
            <p className="mb-2">🔒 Your payment is secure and encrypted with SSL.</p>
            <p>💳 Stripe handles all payment processing - we never see your card details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
