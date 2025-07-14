# Desktop Extension Development Plan
*Created: 2025-07-15 00:28:03 IST*

## Overview
Convert the YouTube MCP server into a Claude Desktop Extension (.dxt format) to enable one-click installation for end users, eliminating the need for manual JSON configuration and dependency management.

## Current Status
✅ DXT CLI tools installed (@anthropic-ai/dxt v0.2.5)
✅ Initial manifest.json created with comprehensive tool listings
✅ User configuration setup for API key and transcript language
✅ First .dxt package generated
⚠️ Package size optimization needed (current: 149.6MB)
🔄 Icon design in progress

## Technical Implementation

### DXT Structure
```
yt-mcp.dxt (zip archive)
├── manifest.json          # Extension metadata and configuration
├── dist/                  # Compiled Node.js server files
│   ├── index.js          # Main entry point
│   └── *.js              # Supporting modules
├── node_modules/         # Runtime dependencies (optimized)
├── package.json          # NPM package definition
└── icon.png             # Extension icon (optional)
```

### Manifest Configuration
- **Server Type**: Node.js with built-in runtime
- **Entry Point**: `dist/index.js`
- **User Config**: YouTube API key (sensitive), transcript language (default: "en")
- **Environment Mapping**: Proper variable injection for existing server code
- **Tools**: All 15 YouTube MCP tools properly declared

### Package Size Optimization Strategy
Current package size (149.6MB) needs reduction through:

1. **Enhanced .dxtignore**
   - Exclude development dependencies
   - Remove TypeScript source files
   - Filter out unnecessary Google API components
   - Exclude test files and documentation

2. **Production-only Dependencies**
   - Review node_modules for runtime-only requirements
   - Consider selective bundling of Google APIs
   - Evaluate if some dependencies can be loaded dynamically

3. **Build Optimization**
   - Ensure only `dist/` files are included for runtime
   - Remove source maps and development artifacts
   - Clean up any duplicate or unused assets

## Immediate Next Steps

### Phase 1: Package Optimization
1. Create comprehensive .dxtignore file
2. Analyze dependency tree for optimization opportunities
3. Test reduced package while maintaining functionality
4. Target package size under 50MB for reasonable distribution

### Phase 2: Icon and Branding
1. Design appropriate icon combining YouTube and data symbols
2. Create multiple sizes (64px, 128px, 512px) for various contexts
3. Test icon visibility at different scales

### Phase 3: Testing and Documentation
1. Test .dxt installation process on fresh system
2. Verify all tools function correctly after installation
3. Update README with Desktop Extension installation instructions
4. Create troubleshooting guide for common DXT issues

### Phase 4: Distribution
1. Submit to official Claude Desktop Extension directory
2. Create GitHub release with .dxt file
3. Update project documentation for multiple installation methods
4. Monitor user feedback and iterate on improvements

## Technical Considerations

### User Experience
- One-click installation eliminates manual JSON editing
- Secure API key storage in OS keychain
- Automatic server lifecycle management
- Built-in Node.js runtime removes external dependencies

### Compatibility
- Windows and macOS support through DXT format
- Maintains existing MCP server functionality
- Backwards compatibility with traditional MCP installation
- Future-proof for other DXT-supporting applications

### Security
- Sensitive configuration properly marked in manifest
- OAuth functionality preserved through environment variables
- Sandboxed execution environment
- Standard extension security model

## Success Metrics
- Package size < 50MB for reasonable download/installation
- Successful installation on clean systems without external dependencies
- All 15 YouTube tools functional after DXT installation
- User configuration interface working properly
- Documentation complete for end-user adoption

## Dependencies
- Completion of T5 (transcript functionality) ensures stable base
- DXT toolchain stability and Claude Desktop compatibility
- YouTube API rate limits and authentication flow preservation
