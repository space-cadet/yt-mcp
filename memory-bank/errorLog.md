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
