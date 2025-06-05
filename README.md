# YouTube MCP Server
[![npm version](https://badge.fury.io/js/yt-mcp.svg)](https://badge.fury.io/js/yt-mcp)

A Model Context Protocol (MCP) server implementation utilizing the YouTube Data API. It allows AI language models to interact with YouTube content through a standardized interface.

## Key Features

### Video Information
* Retrieve detailed video information (title, description, duration, statistics)
* Search for videos by keywords
* Get related videos based on a specific video
* Calculate and analyze video engagement ratios

### Transcript/Caption Management
* Retrieve video captions with multi-language support
* Specify language preferences for transcripts
* Access time-stamped captions for precise content reference

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

## OAuth Authentication for Private Content

This MCP server supports OAuth authentication to access private YouTube content including your personal playlists. To set up and use OAuth:

1. **Create OAuth Credentials**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create OAuth 2.0 Client ID credentials (Web application type)
   - Set the authorized redirect URI to `http://localhost:3000/oauth2callback`
   - Add the client ID and secret to your `.env` file

2. **Authenticate**:
   ```bash
   # Start the OAuth flow
   npm run auth
   # This will display a URL to visit in your browser
   ```

3. **Verify Authentication Status**:
   ```bash
   npm run auth:status
   ```

4. **Revoke Authentication**:
   ```bash
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

## Installation

```bash
# Install from npm
npm install yt-mcp

# Or clone repository
git clone https://github.com/space-cadet/yt-mcp.git
cd yt-mcp
npm install
```

## Environment Configuration
Set the following environment variables:
* `YOUTUBE_API_KEY`: YouTube Data API key (required)
* `YOUTUBE_TRANSCRIPT_LANG`: Default caption language (optional, default: 'en')

### OAuth Configuration (for Private Playlists)
To access private playlists and content, you'll need to configure OAuth:
* `GOOGLE_OAUTH_CLIENT_ID`: OAuth 2.0 client ID
* `GOOGLE_OAUTH_CLIENT_SECRET`: OAuth 2.0 client secret
* `OAUTH_REDIRECT_URI`: OAuth callback URL (default: http://localhost:3000/oauth2callback)

## MCP Client Configuration
Add the following to your Claude Desktop configuration file:

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

## YouTube API Setup
1. Access Google Cloud Console
2. Create a new project or select an existing one
3. Enable YouTube Data API v3
4. Create API credentials (API key)
5. Use the generated API key in your environment configuration

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build
```

## Network Configuration

The server exposes the following ports for communication:
- HTTP: 3000
- gRPC: 3001

## System Requirements
- Node.js 18.0.0 or higher

## Security Considerations
- Always keep your API key secure and never commit it to version control systems
- Manage your API key through environment variables or configuration files
- Set usage limits for your API key to prevent unauthorized use

## Attribution

This project is forked from [youtube-data-mcp-server](https://github.com/icraft2170/youtube-data-mcp-server) by [icraft2170](https://github.com/icraft2170). Special thanks to the original author for creating the foundation of this YouTube MCP server implementation.

## License
This project is licensed under the MIT License. See the LICENSE file for details. 
