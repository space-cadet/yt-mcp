# Changelog: YouTube MCP Server

All notable changes to the YouTube MCP Server project will be documented in this file.

## [Unreleased]

## [1.1.0] - 2025-04-10

### Added
- OAuth 2.0 authentication for accessing private YouTube content
- New MCP tools:
  - `getMyPlaylists`: Access to user's own playlists (including private)
  - `checkOAuthStatus`: Verify OAuth authentication status
- Command-line authentication tools:
  - `npm run auth`: Start OAuth authentication flow
  - `npm run auth:status`: Check authentication status
  - `npm run auth:revoke`: Revoke authentication tokens
- Port configuration options via environment variables
- Privacy policy template for Google API compliance

### Changed
- Updated existing playlist tools to support authenticated requests
- Replaced `registerMethod` with tool-based implementation for prompts
- Improved TypeScript type declarations for OAuth integration
- Updated README with OAuth setup and usage instructions
- Enhanced error handling for OAuth authentication flows

### Fixed
- TypeScript errors related to Google Auth Library
- Type declarations for OAuth2Client
- Issues with protected method access in OAuth library
- Port configuration flexibility for OAuth callback server

## [1.0.15] - 2025-03-30

### Added
- MCP Server Integration Fixes for Claude
- Wrapper scripts for reliable execution
- Alternative startup methods
- MCP prompts implementation
- Support for "prompts/list" method
- Example prompts for YouTube MCP tools
- Comprehensive playlist functionality
- Memory Bank documentation

### Fixed
- TypeScript type declarations in playlists.ts
- Proper GaxiosResponse typing
- Circular reference type errors
- Console error output for proper stderr handling
