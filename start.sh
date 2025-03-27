#!/bin/bash

# Set environment variables from arguments
export YOUTUBE_API_KEY=$1
export YOUTUBE_TRANSCRIPT_LANG=$2

# Change to the project directory
cd "$(dirname "$0")"

# Start the server directly using Node (bypassing pnpm output)
node dist/index.js
