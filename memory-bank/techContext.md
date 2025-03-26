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

4. **Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## Technical Constraints

1. **YouTube API Limitations**
   - **Quota Restrictions**: YouTube API has daily quota limits (~10,000 units)
   - **Rate Limiting**: Requests may be throttled if made too frequently
   - **Available Data**: Limited to what YouTube API exposes
   - **API Versioning**: Dependent on YouTube Data API v3

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
   - **Input Validation**: All user inputs must be validated
   - **Error Handling**: Errors must not expose sensitive information

## Dependencies

### External Services

1. **YouTube Data API v3**
   - Used for all YouTube data operations
   - Requires API key with appropriate permissions
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
   - Handles authentication and request formation

3. **zod**
   - Schema validation for API parameters
   - Runtime type checking
   - Generates clear validation error messages

## Technical Decisions

1. **TypeScript Use**
   - Provides static typing for improved code quality
   - Enhances IDE support with better autocompletion
   - Facilitates maintenance and refactoring

2. **ES Modules**
   - Modern JavaScript module system
   - Better tree-shaking support
   - Consistent with current Node.js best practices

3. **Error Handling Strategy**
   - Consistent try/catch patterns
   - Detailed error messages
   - Error formatting for MCP compliance

4. **Environment Variable Configuration**
   - Secure storage of API keys
   - Flexible configuration options
   - Development/production parity

5. **Pagination Strategy**
   - Implements cursor-based pagination
   - Handles YouTube API result limits
   - Supports configurable result count limits

This technical context provides a comprehensive overview of the technological foundation, constraints, and decisions that shape the YouTube MCP Server implementation.
