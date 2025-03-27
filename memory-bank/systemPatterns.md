# System Patterns: YouTube MCP Server

## System Architecture

The YouTube MCP Server follows a modular architecture designed around the Model Context Protocol (MCP) specification. The system consists of several key components that work together to provide a standardized interface for AI language models to access YouTube data.

```
┌─────────────────────────┐
│   MCP Client (AI Model) │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   StdioServerTransport  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│      MCP Server         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   VideoManagement API   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   YouTube Data API v3   │
└─────────────────────────┘
```

## Key Components

1. **MCP Server (index.ts)**
   - Central component that implements the Model Context Protocol
   - Registers all available tools with descriptions and parameter schemas
   - Handles request/response lifecycle
   - Manages communication through the server transport
   - Implements the prompts/list method for example prompts

2. **VideoManagement Class (videos.ts)**
   - Core service layer that encapsulates YouTube API interactions
   - Provides methods for various YouTube operations
   - Handles pagination, error management, and data transformation
   - Maintains YouTube API client initialization

3. **Example Prompts (prompts.ts)**
   - Provides sample prompts demonstrating how to use the YouTube MCP tools
   - Helps users understand the capabilities of the server
   - Supports the prompts/list method in the MCP protocol

3. **StdioServerTransport**
   - Handles communication between the MCP server and client
   - Uses standard input/output for message passing
   - Implements the transport protocol defined by MCP

4. **Type Definitions (types/)**
   - Provides TypeScript interfaces for YouTube API objects
   - Defines custom types for API parameters and responses
   - Includes declaration files for external libraries

## Design Patterns

1. **Facade Pattern**
   - The VideoManagement class acts as a facade, simplifying complex YouTube API interactions
   - Provides a unified, high-level interface to the various YouTube API services

2. **Adapter Pattern**
   - Transforms YouTube API responses into formats suitable for MCP consumption
   - Handles type conversions and data restructuring

3. **Repository Pattern**
   - VideoManagement implements methods for retrieving and organizing YouTube data
   - Abstracts data access logic from business logic

4. **Dependency Injection**
   - YouTube API client is injected into the VideoManagement class
   - Facilitates testing and configuration

5. **Error Handling Strategy**
   - Consistent try/catch blocks with detailed error messages
   - Error responses follow MCP specifications for error reporting

## Request Flow

1. An MCP client (typically an AI assistant) sends a request to invoke a specific tool with parameters
2. The StdioServerTransport receives the request via stdin
3. The MCP Server processes the request, validates parameters using Zod schemas
4. The server calls the appropriate method in the VideoManagement class
5. VideoManagement interacts with the YouTube API and processes the response
6. Results are formatted according to MCP specifications
7. The response is sent back to the client through the StdioServerTransport via stdout

## Error Handling

The system implements comprehensive error handling at multiple levels:

1. **Parameter Validation**
   - Zod schemas validate all tool parameters
   - Early validation prevents invalid requests from reaching the YouTube API

2. **API Error Handling**
   - All YouTube API calls are wrapped in try/catch blocks
   - Specific error messages capture the nature of failures

3. **Response Formatting**
   - Errors are formatted according to MCP specifications
   - Detailed error information helps diagnose issues

4. **Graceful Degradation**
   - When partial data is available, the system returns what it can
   - Missing data is clearly indicated in responses

## Configuration Management

The system handles configuration through environment variables:

1. **Required Variables**
   - YOUTUBE_API_KEY: Authentication for YouTube Data API

2. **Optional Variables**
   - YOUTUBE_TRANSCRIPT_LANG: Default language for transcripts (defaults to 'ko')

3. **Configuration Validation**
   - Check for required environment variables on startup
   - Exit with helpful error messages if required configuration is missing

This architecture ensures a clean separation of concerns, maintainable code structure, and adherence to the MCP specification while providing robust access to YouTube data.
