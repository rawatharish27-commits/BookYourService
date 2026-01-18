import app from './src/app';
import 'dotenv/config';

// ============================================
// SERVER ENTRY POINT (SENIOR DEV LEVEL)
// ============================================
// Purpose: Starts the HTTP server.
//
// IMPORTANT:
// 1. This file IMPORTS the configured `app` from `src/app.ts`.
// 2. It reads the PORT from environment variables.
// 3. It starts the server and listens for incoming requests.
// 4. It does NOT contain any routes or middleware configuration.
// ============================================

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\n✅ Received SIGINT. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed. Exiting process.');
    process.exit(0);
  });
});
