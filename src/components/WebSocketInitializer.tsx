'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { initializeSocket, disconnectSocket } from '@/lib/socket-client';

/**
 * WebSocket Initializer Component
 * Initializes Socket.IO connection when user is authenticated
 * Sets up listeners for real-time events
 */
export function WebSocketInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || !user?.token) {
      // Disconnect if user logs out
      disconnectSocket();
      return;
    }

    try {
      const socket = initializeSocket(user.id, user.token);

      // Set up event listeners for key real-time features
      
      // ===== NOTIFICATION EVENTS =====
      socket.on('notification:new', (notification) => {
        console.log('📬 New notification received:', notification);
        // Notifications are handled by useNotifications hook
      });

      // ===== ASSIGNMENT GRADE NOTIFICATION =====
      socket.on('assignment:grade-published', (data) => {
        console.log('✅ Assignment graded:', data);
        // Dashboard will refresh to show new grade
      });

      // ===== QUIZ SUBMITTED CONFIRMATION =====
      socket.on('quiz:submitted-confirmed', (data) => {
        console.log('✅ Quiz submission confirmed:', data);
        // Dashboard will refresh to show quiz result
      });

      // ===== ENROLLMENT CONFIRMATION =====
      socket.on('enrollment:confirmed', (data) => {
        console.log('📚 Enrollment confirmed:', data);
        // Refresh course enrollment status
      });

      // ===== MENTOR MESSAGES =====
      socket.on('mentor:new-message', (data) => {
        console.log('💬 New mentor message:', data);
        // Message will be displayed in mentor chat component
      });

      socket.on('mentee:new-message', (data) => {
        console.log('💬 New mentee message:', data);
        // Message will be displayed in mentor dashboard
      });

      // ===== ACHIEVEMENT UNLOCKED =====
      socket.on('achievement:unlocked', (data) => {
        console.log('🏆 Achievement unlocked:', data);
        // Achievement notification will display via withAchievements HOC
      });

      // ===== PRESENCE EVENTS =====
      socket.on('user:online', (data) => {
        console.log('👤 User came online:', data);
        // Update presence indicators in UI
      });

      socket.on('user:offline', (data) => {
        console.log('👤 User went offline:', data);
        // Update presence indicators in UI
      });

      // ===== LEADERBOARD UPDATES =====
      socket.on('leaderboard:update', (data) => {
        console.log('📊 Leaderboard updated:', data);
        // Refresh leaderboard data
      });

      // ===== CLASS UPDATES (For teachers) =====
      socket.on('student:enrolled', (data) => {
        console.log('📚 New student enrolled:', data);
        // Refresh student list if teacher is viewing
      });

      socket.on('assignment:new-submission', (data) => {
        console.log('📝 Assignment submitted:', data);
        // Refresh ungraded submissions if teacher is viewing
      });

      // ===== GENERIC UPDATES =====
      socket.on('data:refresh', (data) => {
        console.log('🔄 Data refresh requested:', data);
        // Refresh relevant data based on type
      });

      // ===== ERROR HANDLING =====
      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      // Cleanup on unmount
      return () => {
        // Don't disconnect - let socket persist for the app session
        // Only disconnect when component finally unmounts during logout
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, [user?.id, user?.token]);

  // This component doesn't render anything
  return null;
}
