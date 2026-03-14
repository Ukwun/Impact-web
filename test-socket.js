import { io } from 'socket.io-client';

// Test script to verify Socket.IO real-time functionality
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server');

  // Test leaderboard update
  setTimeout(() => {
    console.log('📊 Simulating leaderboard update...');
    socket.emit('leaderboard:update', {
      userId: 'test-user-1',
      score: 1500,
      rank: 1
    });
  }, 2000);

  // Test achievement unlock
  setTimeout(() => {
    console.log('🏆 Simulating achievement unlock...');
    socket.emit('achievement:unlock', {
      userId: 'test-user-1',
      achievementId: 'first-quiz-complete',
      title: 'First Quiz Master',
      description: 'Completed your first quiz successfully!'
    });
  }, 4000);

  // Test user activity
  setTimeout(() => {
    console.log('👤 Simulating user activity...');
    socket.emit('user:activity', {
      userId: 'test-user-1',
      action: 'quiz_started',
      courseId: 'course-123'
    });
  }, 6000);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from Socket.IO server');
});

socket.on('leaderboard:updated', (data) => {
  console.log('📊 Leaderboard updated:', data);
});

socket.on('achievement:unlocked', (data) => {
  console.log('🏆 Achievement unlocked:', data);
});

socket.on('user:activity', (data) => {
  console.log('👤 User activity:', data);
});

// Keep the script running for 10 seconds
setTimeout(() => {
  console.log('🛑 Test completed, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 10000);