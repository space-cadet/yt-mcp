import { oauthManager } from './oauth.js';
import http from 'http';
import url from 'url';

/**
 * Simple HTTP server to handle OAuth callback
 */
export class OAuthServer {
  private server: http.Server | null = null;
  private port: number;
  private callbackPath: string;
  private authPromise: Promise<boolean> | null = null;
  private authResolve: ((value: boolean) => void) | null = null;

  constructor(port: number = 3000, callbackPath: string = '/oauth2callback') {
    this.port = port;
    this.callbackPath = callbackPath;
  }

  /**
   * Start the OAuth flow
   * @returns Promise that resolves when authentication is complete
   */
  startAuthFlow(): Promise<boolean> {
    // Create a promise that will be resolved when the auth flow completes
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = new Promise((resolve) => {
      this.authResolve = resolve;
    });

    // Start the HTTP server to handle the callback
    this.startServer();

    // Get and display the auth URL for the user to visit
    const authUrl = oauthManager.getAuthUrl();
    console.log('='.repeat(80));
    console.log('Please visit the following URL to authorize the application:');
    console.log(authUrl);
    console.log('='.repeat(80));

    return this.authPromise;
  }

  /**
   * Start the HTTP server
   */
  private startServer() {
    this.server = http.createServer(async (req, res) => {
      // Parse the request URL
      const parsedUrl = url.parse(req.url || '', true);
      const pathname = parsedUrl.pathname;

      // Handle OAuth callback
      if (pathname === this.callbackPath) {
        const query = parsedUrl.query;
        const code = query.code as string;
        const error = query.error as string;

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (error) {
          console.error('Authentication error:', error);
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Authentication Failed</h1><p>Error: ${error}</p></body></html>`);
          
          if (this.authResolve) {
            this.authResolve(false);
            this.stopServer();
          }
          return;
        }

        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Invalid Request</h1><p>Authorization code is missing</p></body></html>');
          
          if (this.authResolve) {
            this.authResolve(false);
            this.stopServer();
          }
          return;
        }

        try {
          // Exchange the authorization code for tokens
          await oauthManager.exchangeCode(code);
          
          // Send success response
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Authentication Successful</h1><p>You can close this window and return to the application.</p></body></html>');
          
          console.log('Authentication successful.');
          
          if (this.authResolve) {
            this.authResolve(true);
            this.stopServer();
          }
        } catch (error: any) {
          console.error('Error exchanging code for tokens:', error);
          
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Authentication Error</h1><p>${error.message}</p></body></html>`);
          
          if (this.authResolve) {
            this.authResolve(false);
            this.stopServer();
          }
        }
      } else {
        // Handle other paths
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    // Start listening on the specified port
    this.server.listen(this.port, () => {
      console.log(`OAuth server listening on port ${this.port}`);
    });

    // Handle server errors
    this.server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('OAuth server error:', error);
      
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${this.port} is already in use. Please choose a different port.`);
      }
      
      if (this.authResolve) {
        this.authResolve(false);
      }
      
      this.stopServer();
    });
  }

  /**
   * Stop the HTTP server
   */
  stopServer() {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.authPromise = null;
      this.authResolve = null;
      console.log('OAuth server stopped.');
    }
  }
}
