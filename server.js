const express = require('express');
const next = require('next');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

// Determine environment
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, you might want to use a logging service like CloudWatch
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.prepare().then(() => {
  const server = express();
  const PORT = process.env.PORT || 3000;

  // Security headers
  server.use(helmet({
    contentSecurityPolicy: false, // Configure this properly for production
    crossOriginEmbedderPolicy: false, // May need to be false depending on your resources
  }));

  // Enable gzip compression
  server.use(compression());

  // Parse JSON bodies
  server.use(express.json());

  // Health check endpoint
  server.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Static assets with cache control
  server.use('/static', express.static(path.join(__dirname, 'public'), {
    maxAge: '7d',
    immutable: true
  }));

  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT} - env ${process.env.NODE_ENV}`);
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
