#!/usr/bin/env node

import 'dotenv/config';
import { AuthCLI } from './utils/cli-auth.js';
// Add a shebang line at the top to make it executable

// Define command-line arguments
const args = process.argv.slice(2);
const command = args[0] || 'status';
const port = parseInt(args[1] || '3000', 10);

// Create Authentication CLI
const authCli = new AuthCLI(port);

// Execute command
async function main() {
  switch (command) {
    case 'auth':
    case 'authenticate':
      await authCli.authenticate();
      break;
    
    case 'revoke':
      await authCli.revoke();
      break;
    
    case 'status':
      await authCli.status();
      break;
    
    default:
      console.log(`
Usage: node dist/auth-cli.js [command] [port]

Commands:
  auth, authenticate  Start the OAuth authentication flow
  revoke              Revoke authentication tokens
  status              Check authentication status (default)

Options:
  port                Port for the OAuth callback server (default: 3000)
`);
      break;
  }
}

// Run main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
