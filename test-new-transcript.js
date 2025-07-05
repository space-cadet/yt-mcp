#!/usr/bin/env node

import { spawn } from 'child_process';

// Test videos - the ones we tried earlier
const testVideos = [
  { id: 'fqirLhXLoXM', description: 'Hopf algebra video (no captions expected)' },
  { id: 'yG2b4QIQ6Qg', description: 'Harvard CMSA lecture (captions should be available)' },
  { id: 'dQw4w9WgXcQ', description: 'Rick Roll (popular video, likely has captions)' }
];

// Start MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', process.stderr]
});

let testIndex = 0;
let isServerReady = false;

server.stdout.on('data', (data) => {
  const message = data.toString();
  console.log(`Server: ${message.trim()}`);
  
  // Wait for server to be ready
  if (!isServerReady && message.includes('YouTube MCP server has started')) {
    isServerReady = true;
    console.log('\n=== Starting Transcript Tests ===\n');
    runNextTest();
  }
  
  // Try to parse JSON responses
  try {
    const lines = message.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('{')) {
        const response = JSON.parse(line);
        if (response.result) {
          console.log(`✅ Test ${response.id} completed successfully`);
          console.log(`📊 Result length: ${Object.keys(response.result.content[0].text ? JSON.parse(response.result.content[0].text) : {}).length} videos`);
          
          // Parse and show transcript data
          const resultData = JSON.parse(response.result.content[0].text);
          for (const [videoId, transcript] of Object.entries(resultData)) {
            if (Array.isArray(transcript) && transcript.length > 0) {
              console.log(`🎯 ${videoId}: Found ${transcript.length} transcript segments`);
              console.log(`   First segment: "${transcript[0].text.substring(0, 50)}..."`);
            } else {
              console.log(`❌ ${videoId}: No transcript available`);
            }
          }
          console.log('');
        } else if (response.error) {
          console.log(`❌ Test ${response.id} failed: ${response.error.message}`);
        }
        
        // Run next test after a delay
        setTimeout(() => runNextTest(), 2000);
      }
    }
  } catch (e) {
    // Not JSON, ignore
  }
});

function runNextTest() {
  if (testIndex >= testVideos.length) {
    console.log('=== All tests completed ===');
    server.kill();
    process.exit(0);
    return;
  }
  
  const video = testVideos[testIndex];
  testIndex++;
  
  console.log(`🧪 Test ${testIndex}: ${video.description}`);
  console.log(`📹 Video ID: ${video.id}`);
  
  // Test without language parameter
  const request = {
    jsonrpc: '2.0',
    id: testIndex,
    method: 'getTranscripts',
    params: {
      videoIds: [video.id]
    }
  };
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\nStopping tests...');
  server.kill();
  process.exit(0);
});

console.log('🚀 Starting YouTube transcript tests with new implementation...');
