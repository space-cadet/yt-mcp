# Technical Context: YouTube MCP Server

## Technology Stack

The YouTube MCP Server is built using the following technologies:

1. **Core Platform**
   - **Node.js** (≥ 18.0.0): JavaScript runtime
   - **TypeScript**: Statically typed superset of JavaScript
   - **ES Modules**: Modern JavaScript module system

2. **Framework & Libraries**
   - **@modelcontextprotocol/sdk** (v1.7.0): MCP implementation library
   - **googleapis** (v129.0.0): Official Google API client library
   - **google-auth-library** (v9.15.1): OAuth authentication library
   - **gaxios** (v6.7.1): HTTP client used by googleapis for requests
   - **youtube-captions-scraper** (v2.0.0): Library for fetching YouTube transcripts
   - **zod** (v3.24.2): Schema validation library
   - **dotenv** (v16.4.7): Environment variable management

3. **Development Tools**
   - **ESLint**: Static code analysis
   - **Jest**: Testing framework
   - **ts-node**: TypeScript execution environment
   - **nodemon**: Development server with hot reload
   - **rimraf**: Cross-platform directory removal

## Development Setup

To set up the development environment:

1. **Prerequisites**
   - Node.js ≥ 18.0.0
   - npm or pnpm package manager
   - YouTube Data API v3 key

2. **Installation**
   ```bash
   git clone https://github.com/icraft2170/youtube-data-mcp-server.git
   cd youtube-data-mcp-server
   npm install
   ```

3. **Configuration**
   - Create a `.env` file based on `.env.example`
   - Add your YouTube API key to the `.env` file
   - For OAuth access, add Google OAuth client ID and secret

4. **Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Running the MCP Server**
   ```bash
   # Standard method
   npm run start
   
   # Direct method (bypasses npm/pnpm output)
   node ./dist/index.js
   
   # Using wrapper script
   ./start.sh YOUTUBE_API_KEY LANGUAGE_CODE
   
   # Using Node.js wrapper
   node ./run-mcp.js
   ```

7. **OAuth Authentication**
   ```bash
   # Start OAuth authentication flow
   npm run auth
   
   # Check authentication status
   npm run auth:status
   
   # Revoke authentication
   npm run auth:revoke
   ```

## Technical Constraints

1. **YouTube API Limitations**
   - **Quota Restrictions**: YouTube API has daily quota limits (~10,000 units)
   - **Rate Limiting**: Requests may be throttled if made too frequently
   - **Available Data**: Limited to what YouTube API exposes
   - **API Versioning**: Dependent on YouTube Data API v3
   - **OAuth Requirements**: Google Cloud Console setup with privacy policy for production use

2. **MCP Constraints**
   - **Communication Protocol**: Limited to stdin/stdout
   - **Data Format**: Tools must return content in MCP-compliant format
   - **Parameter Validation**: Must use Zod schemas for validation

3. **Performance Considerations**
   - **Network Latency**: YouTube API calls introduce latency
   - **Pagination Handling**: Large result sets require multiple API calls
   - **Memory Usage**: Large responses must be managed efficiently

4. **Security Requirements**
   - **API Key Protection**: Keys must be stored securely as environment variables
   - **OAuth Token Security**: OAuth tokens must be stored securely and refreshed as needed
   - **Input Validation**: All user inputs must be validated
   - **Error Handling**: Errors must not expose sensitive information
   - **Privacy Considerations**: OAuth applications must comply with Google's API Services User Data Policy

## Dependencies

### External Services

1. **YouTube Data API v3**
   - Used for all YouTube data operations
   - Requires API key with appropriate permissions
   - OAuth authentication for private data access
   - Documentation: https://developers.google.com/youtube/v3/docs

2. **YouTube Captions**
   - Accessed via youtube-captions-scraper library
   - No authentication required for public video captions
   - May not be available for all videos

### Third-Party Libraries

1. **@modelcontextprotocol/sdk**
   - Provides MCP server implementation
   - Handles communication protocol
   - Manages tool registration and execution

2. **googleapis**
   - Official Google API client
   - Provides type-safe access to YouTube API
   - Handles API key and OAuth authentication
   - Manages request formation and execution

3. **zod**
   - Schema validation for API parameters
   - Runtime type checking
   - Generates clear validation error messages

## Technical Decisions

1. **TypeScript Use**
   - Provides static typing for improved code quality
   - Enhances IDE support with better autocompletion
   - Facilitates maintenance and refactoring

2. **OAuth Implementation**
   - Server-side OAuth flow with local callback server
   - Token storage in local file system with refresh capabilities
   - Graceful fallback to API key when OAuth is not available
   - Configurable port for OAuth callback server

3. **ES Modules**
   - Modern JavaScript module system
   - Better tree-shaking support
   - Consistent with current Node.js best practices

4. **Error Handling Strategy**
   - Consistent try/catch patterns
   - Detailed error messages
   - Error formatting for MCP compliance

5. **Environment Variable Configuration**
   - Secure storage of API keys and OAuth credentials
   - Flexible configuration options
   - Development/production parity
   - Port configuration for OAuth server

6. **Pagination Strategy**
   - Implements cursor-based pagination
   - Handles YouTube API result limits
   - Supports configurable result count limits

This technical context provides a comprehensive overview of the technological foundation, constraints, and decisions that shape the YouTube MCP Server implementation.
