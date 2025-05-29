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

  // Security headers - properly configured for production
  server.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "localhost:*", "kelsoko.org"],
        connectSrc: ["'self'", "localhost:*", "kelsoko.org"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Needed for some resources
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resource sharing
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // Enable gzip compression
  server.use(compression());

  // Parse JSON bodies
  server.use(express.json());

  // Health check endpoint
  server.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Static assets with optimized cache control
  server.use('/static', express.static(path.join(__dirname, 'public'), {
    maxAge: '30d',
    immutable: true,
    etag: true,
    lastModified: true
  }));

  // Additional static paths for Next.js assets
  server.use('/_next/static', express.static(path.join(__dirname, '.next/static'), {
    maxAge: '365d',
    immutable: true,
    etag: true
  }));

  // Let Next.js handle all other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Add graceful shutdown handling
  const gracefulShutdown = () => {
    console.log('Received shutdown signal, closing server...');
    server.close(() => {
      console.log('Server closed successfully');
      process.exit(0);
    });
    
    // Force close after 30 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };
  
  // Listen for termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // Start the server
  const serverInstance = server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT} - env ${process.env.NODE_ENV}`);
    console.log(`> Server started at ${new Date().toISOString()}`);
  });
  
  // Increase the timeout for long-running connections
  serverInstance.timeout = 120000; // 2 minutes
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
