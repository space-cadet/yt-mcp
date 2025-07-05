# YouTube MCP Server
[![npm version](https://badge.fury.io/js/yt-mcp.svg)](https://badge.fury.io/js/yt-mcp)

*Last Updated: 2025-07-05*

A Model Context Protocol (MCP) server implementation utilizing the YouTube Data API. It allows AI language models to interact with YouTube content through a standardized interface.

**✅ YouTube Transcript Support**: This server includes full transcript/caption functionality using the `youtube-transcript-api` Python package. Simply install Python dependencies and optionally configure the Python path - transcripts work seamlessly for videos with available captions.

## Table of Contents

- [Key Features](#key-features)
- [OAuth Authentication (Private Playlists)](#oauth-authentication-private-playlists)
- [Available Tools](#available-tools)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
  - [1. Python Setup (Required for Transcript Functionality)](#1--python-setup-required-for-transcript-functionality)
  - [2. YouTube Data API Setup](#2-youtube-data-api-setup)
  - [3. OAuth Setup (For Private Playlists - Optional)](#3-oauth-setup-for-private-playlists---optional)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [System Requirements](#system-requirements)
- [Security Considerations](#security-considerations)
- [Attribution](#attribution)
- [License](#license)

## Key Features

### Video Information
* Retrieve detailed video information (title, description, duration, statistics)
* Search for videos by keywords
* Get related videos based on a specific video
* Calculate and analyze video engagement ratios

### ✅ Transcript/Caption Management (Fully Functional)
* **Retrieve video transcripts** using the powerful `youtube-transcript-api` Python package
* **Multi-language support** with automatic language detection and fallback options
* **Time-stamped captions** for precise content reference and analysis
* **Easy setup** - just install Python dependencies and optionally set your Python path
* **Works reliably** for any video with available captions/transcripts

### Channel Analysis
* View detailed channel statistics (subscribers, views, video count)
* Get top-performing videos from a channel
* Analyze channel growth and engagement metrics

### Playlist Management
* Retrieve detailed playlist information
* Get all videos within a playlist
* Search for public playlists by keywords
* Get all public playlists from a specific channel

### Trend Analysis
* View trending videos by region and category
* Compare performance metrics across multiple videos
* Discover popular content in specific categories

## OAuth Authentication (Private Playlists)

**Note**: OAuth is only required if you want to access your private YouTube playlists. Public content works without authentication.

### Authentication Steps

1. **Ensure OAuth is configured** (see Prerequisites section above)

2. **Authenticate with Google**:
   
   **For npx users:**
   ```bash
   npx yt-mcp-auth auth
   ```
   
   **For local development:**
   ```bash
   npm run auth
   ```

3. **Handle the "Google hasn't verified this app" warning**:
   - Click "Advanced" 
   - Click "Go to [your app name] (unsafe)"
   - This is safe since you created the OAuth app yourself

4. **Complete the OAuth flow**:
   - Grant the requested permissions
   - You'll see a success message when authentication completes

5. **Verify authentication**:
   
   **For npx users:**
   ```bash
   npx yt-mcp-auth status
   ```
   
   **For local development:**
   ```bash
   npm run auth:status
   ```

### Managing Authentication

**Check status:**
```bash
# npx users
npx yt-mcp-auth status

# Local development  
npm run auth:status
```

**Revoke authentication:**
```bash
# npx users
npx yt-mcp-auth revoke

# Local development
npm run auth:revoke
```

Once authenticated, you can access your private playlists using the `getMyPlaylists` tool.

## Available Tools

The server provides the following MCP tools:

| Tool Name | Description | Required Parameters |
|-----------|-------------|---------------------|
| `getVideoDetails` | Get detailed information about multiple YouTube videos including metadata, statistics, and content details | `videoIds` (array) |
| `searchVideos` | Search for videos based on a query string | `query`, `maxResults` (optional) |
| `getTranscripts` | Retrieve transcripts for multiple videos | `videoIds` (array), `lang` (optional) |
| `getRelatedVideos` | Get videos related to a specific video based on YouTube's recommendation algorithm | `videoId`, `maxResults` (optional) |
| `getChannelStatistics` | Retrieve detailed metrics for multiple channels including subscriber count, view count, and video count | `channelIds` (array) |
| `getChannelTopVideos` | Get the most viewed videos from a specific channel | `channelId`, `maxResults` (optional) |
| `getVideoEngagementRatio` | Calculate engagement metrics for multiple videos (views, likes, comments, and engagement ratio) | `videoIds` (array) |
| `getTrendingVideos` | Get currently popular videos by region and category | `regionCode` (optional), `categoryId` (optional), `maxResults` (optional) |
| `compareVideos` | Compare statistics across multiple videos | `videoIds` (array) |
| `getPlaylistDetails` | Get detailed information about a specific YouTube playlist | `playlistId` |
| `getPlaylistVideos` | Retrieve all videos contained in a specific playlist | `playlistId`, `maxResults` (optional) |
| `searchPublicPlaylists` | Search for public playlists based on a query string | `query`, `maxResults` (optional), `channelId` (optional) |
| `getChannelPlaylists` | Get all public playlists from a specific channel | `channelId`, `maxResults` (optional) |
| `getMyPlaylists` | Get your own playlists (including private ones) | `maxResults` (optional) |
| `checkOAuthStatus` | Check if OAuth authentication is active | None |

## Quick Start

### Option 1: Use with npx (Recommended)
No installation required! Use directly with Claude Desktop:

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "yt-mcp"],
      "env": {
        "YOUTUBE_API_KEY": "YOUR_API_KEY_HERE",
        "YOUTUBE_TRANSCRIPT_LANG": "en"
      }
    }
  }
}
```

### Option 2: Local Development
```bash
git clone https://github.com/space-cadet/yt-mcp.git
cd yt-mcp
npm install
npm run build
```

## Prerequisites

### 1. 🐍 Python Setup (Required for Transcript Functionality)

**✅ YouTube transcript functionality is fully supported and working!** 

The transcript feature uses the `youtube-transcript-api` Python package to reliably fetch transcripts from any video with available captions.

**📋 Setup Steps:**

1. **Install Python** (if not already installed):
   - **Python 3.7 or higher is required**
   - Download from [python.org](https://python.org) or use your system's package manager
   - Verify installation: `python --version` or `python3 --version`

2. **Install the Python transcript package**:
   ```bash
   pip install youtube-transcript-api
   ```
   
   **Or if you use pip3:**
   ```bash
   pip3 install youtube-transcript-api
   ```

3. **Configure Python path** (if needed):
   - **Most users won't need this step** - the server will automatically find `python3`
   - Only needed if you're using conda, virtual environments, or custom Python installations
   - Set `PYTHON_PATH` in your environment to point to your Python executable
   - Examples:
     - `/Users/username/miniconda3/bin/python`
     - `/opt/homebrew/bin/python3`
     - `C:\Python39\python.exe` (Windows)

**🎯 That's it!** Once Python and the package are installed, transcript functionality works immediately for any video with available captions.

### 2. YouTube Data API Setup

**Step-by-step Google Cloud Console setup:**

1. **Create/Select a Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Click "Select a project" → "New Project"
   - Name your project (e.g., "YouTube MCP Server")
   - Click "Create"

2. **Enable YouTube Data API v3**:
   - In the sidebar, go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

3. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key
   - (Optional) Click "Restrict Key" to limit it to YouTube Data API v3

### 3. OAuth Setup (For Private Playlists - Optional)

**Only needed if you want to access private playlists:**

1. **Create OAuth 2.0 Credentials**:
   - In "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in app name, user support email, developer contact
     - Add your email to test users
   - Choose "Web application" as application type
   - Add authorized redirect URI: `http://localhost:3000/oauth2callback`
   - Copy the Client ID and Client Secret

## Environment Configuration

### For npx Users

Add environment variables directly to your Claude Desktop MCP configuration:

**Basic configuration (public content + transcripts):**
```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "yt-mcp"],
      "env": {
        "YOUTUBE_API_KEY": "YOUR_API_KEY_HERE",
        "YOUTUBE_TRANSCRIPT_LANG": "en"
      }
    }
  }
}
```
**Note**: This configuration includes full transcript functionality! Just ensure you have Python and `youtube-transcript-api` installed.

**Configuration with custom Python path (for conda/virtual environments):**
```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "yt-mcp"],
      "env": {
        "YOUTUBE_API_KEY": "YOUR_API_KEY_HERE",
        "YOUTUBE_TRANSCRIPT_LANG": "en",
        "PYTHON_PATH": "/path/to/your/python"
      }
    }
  }
}
```
**Note**: Most users don't need `PYTHON_PATH` - only set this if you're using conda, virtual environments, or custom Python installations.

**Full configuration (with OAuth and custom Python path):**
```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "yt-mcp"],
      "env": {
        "YOUTUBE_API_KEY": "YOUR_API_KEY_HERE",
        "YOUTUBE_TRANSCRIPT_LANG": "en",
        "PYTHON_PATH": "/path/to/your/python",
        "GOOGLE_OAUTH_CLIENT_ID": "YOUR_OAUTH_CLIENT_ID",
        "GOOGLE_OAUTH_CLIENT_SECRET": "YOUR_OAUTH_CLIENT_SECRET",
        "OAUTH_REDIRECT_URI": "http://localhost:3000/oauth2callback"
      }
    }
  }
}
```

### For Local Development

Create a `.env` file in the project root:

```env
# Required
YOUTUBE_API_KEY=your_youtube_api_key_here

# Optional
YOUTUBE_TRANSCRIPT_LANG=en
PYTHON_PATH=/path/to/your/python

# OAuth (for private playlists)
GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REDIRECT_URI=http://localhost:3000/oauth2callback
```

**Local development MCP configuration:**
```json
{
  "mcpServers": {
    "youtube": {
      "command": "node",
      "args": ["/path/to/yt-mcp/dist/index.js"]
    }
  }
}
```

## Troubleshooting

### Common Issues

**"Error: YOUTUBE_API_KEY environment variable is not set"**
- Ensure you've added your YouTube API key to the MCP configuration
- Verify the API key is valid and has YouTube Data API v3 enabled

**"Google hasn't verified this app" warning during OAuth**
- This is expected for personal OAuth apps
- Click "Advanced" → "Go to [app name] (unsafe)" to continue
- This is safe since you created the OAuth credentials yourself

**"OAuth authentication required" error**
- Run the authentication command: `npx yt-mcp-auth auth` (or `npm run auth` for local)
- Make sure OAuth credentials are properly configured in your environment

**"invalid_token" error during auth revocation**
- This can happen if tokens are already expired
- The command will still clean up local authentication state
- You can safely re-authenticate after this error

**🐍 Transcript functionality troubleshooting**

**✅ Good news**: Transcript functionality is fully working and battle-tested! Most issues are simple setup problems.

- **"ModuleNotFoundError: No module named 'youtube_transcript_api'"**:
  - **Solution**: Install the Python package: `pip install youtube-transcript-api`
  - If using conda/virtual environment, ensure the package is installed in that specific environment
  - Verify with: `python -c "import youtube_transcript_api; print('Package installed successfully!')"`

- **"Failed to start Python process"** or Python not found:
  - **Solution**: Set `PYTHON_PATH` environment variable to point to your Python executable
  - Find your Python path: `which python3` (macOS/Linux) or `where python` (Windows)
  - Add to MCP config: `"PYTHON_PATH": "/path/to/your/python"`
  - Examples:
    - `"/usr/bin/python3"` (system Python)
    - `"/Users/username/miniconda3/bin/python"` (conda)
    - `"C:\\Python39\\python.exe"` (Windows)

- **Empty transcript results**:
  - **This is normal!** Some videos don't have transcripts available
  - Try popular videos (like TED talks, educational content) which usually have captions
  - Test with a known working video to verify functionality
  - The transcript API will return empty results for videos without captions

- **Transcript language issues**:
  - Set `YOUTUBE_TRANSCRIPT_LANG` to your preferred language (e.g., "en", "es", "fr")
  - The API will automatically fall back to available languages if your preference isn't available

**MCP server not responding**
- Verify Node.js version is 18.0.0 or higher
- Check that the YouTube API key is valid
- For local development, ensure you've run `npm run build`

### Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your API key and OAuth setup
3. Create an issue on [GitHub](https://github.com/space-cadet/yt-mcp/issues)

## Development

### Local Development Setup
```bash
# Clone and setup
git clone https://github.com/space-cadet/yt-mcp.git
cd yt-mcp
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env with your API keys

# Development commands
npm run dev      # Run in development mode with auto-reload
npm run build    # Build TypeScript to JavaScript  
npm run start    # Run built version
npm test         # Run tests
npm run lint     # Lint code
```

### Project Structure
```
src/
├── index.ts              # Main MCP server
├── auth-cli.ts           # OAuth authentication CLI
├── functions/
│   ├── videos.ts         # Video-related API functions
│   └── playlists.ts      # Playlist-related API functions
└── utils/
    ├── oauth.ts          # OAuth token management
    ├── oauth-routes.ts   # OAuth callback server
    └── cli-auth.ts       # CLI authentication flow
```

## System Requirements
- Node.js 18.0.0 or higher
- Internet connection for YouTube API access
- Port 3000 available for OAuth callback (when using OAuth)

## Security Considerations
- Never commit API keys or OAuth secrets to version control
- Use environment variables for all sensitive configuration
- Set usage quotas on your Google Cloud API key to prevent abuse
- OAuth tokens are stored locally in `tokens.json` - keep this file secure
- Consider revoking OAuth access when no longer needed

## Attribution

This project is forked from [youtube-data-mcp-server](https://github.com/icraft2170/youtube-data-mcp-server) by [icraft2170](https://github.com/icraft2170). Special thanks to the original author for creating the foundation of this YouTube MCP server implementation.

## License
This project is licensed under the MIT License. See the LICENSE file for details. 
