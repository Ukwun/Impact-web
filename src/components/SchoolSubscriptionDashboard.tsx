'use client';

import React, { useEffect, useState } from 'react';

interface SubscriptionPlan {
  id: string;
  tierType: string;
  name: string;
  monthlyPrice: number | null;
  maxUsers: number | null;
  canAccessAnalytics: boolean;
  canManageFacilitators: boolean;
  canIntegrateSIS: boolean;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: string;
  schoolName: string | null;
  activeUsers: number;
  startDate: string;
  renewalDate: string;
  plan: SubscriptionPlan;
}

interface SubscriptionData {
  availablePlans: SubscriptionPlan[];
  currentSubscriptions: UserSubscription[];
  canSubscribe: boolean;
}

interface SchoolSubscriptionDashboardProps {
  userId?: string;
}

/**
 * School/Institution Subscription Management Dashboard
 * Displays:
 * - Current subscription tier and status
 * - Remaining seats/user limit
 * - Renewal and billing information
 * - Available plan options
 * - Ability to manage subscription
 */
export function SchoolSubscriptionDashboard({ userId }: SchoolSubscriptionDashboardProps) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPricingTable, setShowPricingTable] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/subscriptions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(userId && { 'x-user-id': userId }),
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
        }

        const { data } = await response.json();
        setSubscriptionData(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Failed to fetch subscriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId]);

  const handleUpgradePlan = async (planId: string) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId && { 'x-user-id': userId }),
        },
        body: JSON.stringify({
          planId,
          schoolName: 'My School'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      // Refresh subscriptions
      location.reload();
    } catch (err) {
      console.error('Failed to upgrade plan:', err);
      alert('Failed to upgrade plan. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-red-900">Error Loading Subscriptions</h3>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const currentSubscription = subscriptionData?.currentSubscriptions[0];
  const availablePlans = subscriptionData?.availablePlans || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h2>
        <p className="text-gray-600">Manage your school's ImpactEdu subscription and access</p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription ? (
        <div className="bg-white border-2 border-green-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Plan Name */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Plan</h3>
              <p className="text-2xl font-bold text-gray-900">{currentSubscription.plan.name}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {currentSubscription.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* User Limit */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Users</h3>
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900">
                  {currentSubscription.activeUsers}
                  <span className="text-lg text-gray-500">
                    {' / '} {currentSubscription.plan.maxUsers || '∞'}
                  </span>
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (currentSubscription.activeUsers / (currentSubscription.plan.maxUsers || 1)) > 0.8
                      ? 'bg-red-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      (currentSubscription.activeUsers / (currentSubscription.plan.maxUsers || currentSubscription.activeUsers + 10)) * 100,
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Renewal Date */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Next Renewal</h3>
              <p className="text-xl font-bold text-gray-900">
                {new Date(currentSubscription.renewalDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {Math.ceil(
                  (new Date(currentSubscription.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )}{' '}
                days remaining
              </p>
            </div>

            {/* Monthly Price */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Monthly Cost</h3>
              <p className="text-2xl font-bold text-gray-900">
                {currentSubscription.plan.monthlyPrice ? `$${currentSubscription.plan.monthlyPrice}` : 'Custom'}
              </p>
              <button className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
            <div className="flex items-center space-x-3">
              {currentSubscription.plan.canAccessAnalytics ? (
                <span className="text-green-500 text-lg">✓</span>
              ) : (
                <span className="text-gray-300 text-lg">✗</span>
              )}
              <span className="text-sm text-gray-700">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              {currentSubscription.plan.canManageFacilitators ? (
                <span className="text-green-500 text-lg">✓</span>
              ) : (
                <span className="text-gray-300 text-lg">✗</span>
              )}
              <span className="text-sm text-gray-700">Facilitator Management</span>
            </div>
            <div className="flex items-center space-x-3">
              {currentSubscription.plan.canIntegrateSIS ? (
                <span className="text-green-500 text-lg">✓</span>
              ) : (
                <span className="text-gray-300 text-lg">✗</span>
              )}
              <span className="text-sm text-gray-700">SIS Integration</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">No Active Subscription</h3>
          <p className="text-blue-800 text-sm mb-4">
            Get started with ImpactEdu by selecting a subscription plan below.
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Available Plans</h3>
          <button
            onClick={() => setShowPricingTable(!showPricingTable)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showPricingTable ? 'Hide Comparison' : 'Show Comparison'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePlans.slice(0, 3).map(plan => (
            <div
              key={plan.id}
              className={`
                border-2 rounded-lg p-6 transition-all
                ${
                  selectedPlan === plan.id
                    ? 'border-blue-600 bg-blue-50'
                    : currentSubscription?.planId === plan.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h4>

              {/* Price */}
              <div className="mb-4">
                {plan.monthlyPrice ? (
                  <div>
                    <span className="text-3xl font-bold text-gray-900">${plan.monthlyPrice}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                ) : (
                  <p className="text-gray-600">Custom pricing</p>
                )}
              </div>

              {/* User Limit */}
              <p className="text-sm text-gray-600 mb-4">
                {plan.maxUsers ? `Up to ${plan.maxUsers} users` : 'Unlimited users'}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center space-x-2">
                  {plan.canAccessAnalytics ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-gray-300">✗</span>
                  )}
                  <span>Advanced Analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  {plan.canManageFacilitators ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-gray-300">✗</span>
                  )}
                  <span>Facilitator Management</span>
                </li>
                <li className="flex items-center space-x-2">
                  {plan.canIntegrateSIS ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-gray-300">✗</span>
                  )}
                  <span>SIS Integration</span>
                </li>
              </ul>

              {/* Action Button */}
              {currentSubscription?.planId === plan.id ? (
                <button
                  disabled
                  className="w-full px-4 py-2 bg-gray-300 text-gray-600 rounded font-semibold cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgradePlan(plan.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
                >
                  {subscriptionData?.canSubscribe ? 'Select Plan' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h4 className="font-bold text-gray-900 mb-2">Need a Custom Plan?</h4>
        <p className="text-gray-600 text-sm mb-4">
          Contact our team for enterprise solutions, district-wide deployments, or special requirements.
        </p>
        <button className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors">
          Contact Sales
        </button>
      </div>
    </div>
  );
}

export default SchoolSubscriptionDashboard;
