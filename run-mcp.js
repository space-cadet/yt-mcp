#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The path to the compiled index.js file
const serverPath = path.join(__dirname, 'dist', 'index.js');

// Start the server process
const serverProcess = spawn('node', [serverPath], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: {
    ...process.env,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YOUTUBE_TRANSCRIPT_LANG: process.env.YOUTUBE_TRANSCRIPT_LANG || 'en'
  }
});

// Handle process exit
serverProcess.on('close', (code) => {
  process.exit(code);
});

// Forward signals to the child process
['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    serverProcess.kill(signal);
  });
});
