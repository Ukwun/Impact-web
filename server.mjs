/**
 * Custom Next.js development server with Socket.IO support + Validation + Rate Limiting
 * Run with: node server.js
 * 
 * Features:
 * - Socket.IO real-time communication
 * - Redis adapter for multi-instance clustering
 * - Rate limiting (user:typing, quiz:submit, etc.)
 * - Input validation with Zod schemas
 * - Authentication via JWT
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: path.join(__dirname) });
const handle = app.getRequestHandler();

// Import Socket.IO initialization
let initializeSocketServer;
(async () => {
  try {
    const socketModule = await import('./src/lib/socket-server.js');
    initializeSocketServer = socketModule.initializeSocketServer;
  } catch (error) {
    console.error('Failed to import socket server:', error);
  }
})();

const PORT = parseInt(process.env.PORT || '3000', 10);

app.prepare().then(async () => {
  // Create HTTP server for Next.js and Socket.IO
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Wait for socket server import and initialize Socket.IO
  const checkAndInitializeSocket = async () => {
    if (initializeSocketServer) {
      try {
        await initializeSocketServer(server);
        console.log('✅ Socket.IO server initialized');
      } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
      }
    } else {
      // Retry after a short delay
      setTimeout(checkAndInitializeSocket, 100);
    }
  };

  checkAndInitializeSocket();

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`✅ Server ready on http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(async () => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
