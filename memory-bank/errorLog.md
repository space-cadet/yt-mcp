# Error Log: YouTube MCP Server

This file documents significant errors encountered during development and their resolutions.

## OAuth Implementation Errors

### [2025-04-10] TypeScript Build Errors with OAuth Implementation

#### Issue 
Build process failed with multiple TypeScript errors:
1. Property `registerMethod` does not exist on type `McpServer`
2. Property `refreshToken` is protected and only accessible within class `OAuth2Client` and its subclasses
3. The inferred type of `getOAuth2Client` cannot be named without a reference to google-auth-library

#### Resolution
1. Replaced `server.registerMethod()` with `server.tool()` to properly register the prompts list functionality
2. Changed to use the public `refreshAccessToken()` method instead of the protected `refreshToken()` method
3. Added proper type imports and annotations for OAuth2Client:
   ```typescript
   import { OAuth2Client } from 'google-auth-library';
   private oauth2Client: OAuth2Client;
   async getOAuth2Client(): Promise<OAuth2Client>
   ```

### [2025-04-10] OAuth Port Configuration Issues

#### Issue
OAuth callback server needed to run on the exact port configured in Google Cloud Console, making it difficult to use different ports in development.

#### Resolution
1. Added environment variable `OAUTH_PORT` for configuring the OAuth callback server port
2. Added code to extract port from `OAUTH_REDIRECT_URI` environment variable
3. Updated documentation to recommend registering multiple redirect URIs in Google Cloud Console

### [2025-04-10] OAuth Redirect URI Mismatch

#### Issue
Encountered Error 400: redirect_uri_mismatch when attempting OAuth flow, despite correct configuration:
- Authorized redirect URI: http://localhost:3000/oauth2callback
- JavaScript origin: http://localhost:3000
- OAUTH_PORT: 3000

#### Troubleshooting
1. Verified exact URI match (no trailing whitespace/slashes)
2. Confirmed client ID matches Google Cloud Console
3. Tested in multiple browsers/incognito mode
4. Verified server running on correct port (3000)
5. Checked for Google's propagation delay (waited 1+ hours)

#### Current Status
- Configuration appears correct
- Most likely waiting for Google's changes to fully propagate
- Recommended waiting additional time or creating new credentials

## MCP Server Configuration Errors

### [2025-06-10] Node.js Version Compatibility with MCP Configuration

#### Issue
YouTube MCP server failed to start with Node.js version compatibility error:
```
npm ERR! engine Unsupported engine
npm ERR! engine Not compatible with your version of node/npm: @modelcontextprotocol/sdk@1.12.1
npm ERR! notsup Required: {"node":">=18"}
npm ERR! notsup Actual:   {"npm":"7.10.0","node":"v16.0.0"}
```

#### Root Cause
- User's interactive shell was using Node.js v18.20.8 (correct version)
- Claude's MCP server environment was using Node.js v16.0.0 from different PATH
- MCP configuration used `"command": "npx"` which resolved to first Node.js in Claude's PATH
- Claude's environment PATH had `/Users/deepak/.nvm/versions/node/v16.0.0/bin` before v18 path

#### Resolution
Updated MCP configuration to specify exact Node.js v18 path:

**Before:**
```json
"youtube": {
  "command": "npx",
  "args": ["-y", "yt-mcp"],
  "env": { ... }
}
```

**After:**
```json
"youtube": {
  "command": "/Users/deepak/.nvm/versions/node/v18.20.8/bin/npx",
  "args": ["-y", "yt-mcp"],
  "env": { ... }
}
```

**Alternative solution (PATH override):**
```json
"youtube": {
  "command": "npx",
  "args": ["-y", "yt-mcp"],
  "env": {
    "PATH": "/Users/deepak/.nvm/versions/node/v18.20.8/bin:/usr/local/bin:/usr/bin:/bin",
    ...
  }
}
```

#### Notes
- MCP servers inherit environment from Claude application, not user's shell
- User's shell environment (nvm, PATH) doesn't affect MCP server processes
- Specific Node.js path in MCP config ensures consistent version usage

## Previous Errors

### [2025-03-25] TypeScript Type Declaration Errors

#### Issue
Build process failed with errors related to Gaxios response types in the playlist management functions.

#### Resolution
1. Added `gaxios` package as a dependency
2. Added explicit type imports for `GaxiosResponse`
3. Added type assertions for YouTube API responses
4. Fixed callback function type declarations in array methods

### [2025-03-23] MCP Server Integration Issues with Claude

#### Issue
Claude was unable to properly communicate with the MCP server due to output interference from pnpm.

#### Resolution
1. Created wrapper scripts (`start.sh` and `run-mcp.js`) for reliable execution
2. Replaced `console.error()` with `process.stderr.write()` for proper stream handling
3. Added alternative startup methods to bypass pnpm output interference
4. Updated package.json with new direct execution script options
