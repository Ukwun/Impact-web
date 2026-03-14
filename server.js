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
const { initializeSocketServer } = require('./src/lib/socket-server');

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

  // Initialize Socket.IO
  try {
    await initializeSocketServer(server);
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
    // Continue without Socket.IO if initialization fails
  }

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
