# YouTube MCP Server
[![smithery badge](https://smithery.ai/badge/@player_hero/youtube)](https://smithery.ai/server/@player_hero/youtube)

A Model Context Protocol (MCP) server implementation utilizing the YouTube Data API. It allows AI language models to interact with YouTube content through a standardized interface.

## Key Features

### Video Information
* Retrieve video details (title, description, duration, etc.)
* List channel videos
* View video statistics (views, likes, comments)
* Search across all YouTube videos

### Caption Management
* Retrieve video captions
* Multi-language support
* Timestamp-based caption retrieval
* Search within captions

### Channel Management
* View channel details
* Retrieve channel statistics (subscriber count, total views, video count)
* Get popular videos from a channel (up to 500)
* Search within channel content

### Trend Analysis
* View trending videos by country
* View trending videos by category
* Analyze video engagement rates
* Compare video performance

## Installation

### Automatic Installation via Smithery

Automatically install YouTube MCP Server for Claude Desktop via [Smithery](https://smithery.ai/server/@player_hero/youtube):

```bash
npx -y @smithery/cli install @player_hero/youtube --client claude
```

### Manual Installation
```bash
# Clone repository
git clone https://github.com/sonhyeonho/youtube-mcp-server.git
cd youtube-mcp-server

# Install dependencies and build
npm install
```

## Environment Configuration
Set the following environment variables:
* `YOUTUBE_API_KEY`: YouTube Data API key
* `YOUTUBE_TRANSCRIPT_LANG`: Default caption language (optional, default: 'en')

## MCP Client Configuration
Add the following to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "youtube-data-mcp-server"],
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

## Security Considerations
- Always keep your API key secure and never commit it to version control systems.
- Manage your API key through environment variables or configuration files.
- Set usage limits for your API key to prevent unauthorized use.

## License
This project is licensed under the MIT License. See the LICENSE file for details. 
