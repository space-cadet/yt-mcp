import { OAuthServer } from './oauth-routes.js';
import { oauthManager } from './oauth.js';

/**
 * Command-line OAuth authentication flow
 */
export class AuthCLI {
  private oauthServer: OAuthServer;

  constructor(port: number = 3000) {
    this.oauthServer = new OAuthServer(port);
  }

  /**
   * Start the authentication flow
   */
  async authenticate(): Promise<boolean> {
    try {
      // Check if already authenticated
      const isAuthenticated = await oauthManager.isAuthenticated();
      if (isAuthenticated) {
        console.log('Already authenticated.');
        return true;
      }

      // Start the OAuth flow
      return await this.oauthServer.startAuthFlow();
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  /**
   * Revoke the authentication tokens
   */
  async revoke(): Promise<boolean> {
    try {
      await oauthManager.revokeTokens();
      console.log('Authentication revoked.');
      return true;
    } catch (error) {
      console.error('Error revoking authentication:', error);
      return false;
    }
  }

  /**
   * Check authentication status
   */
  async status(): Promise<boolean> {
    try {
      const isAuthenticated = await oauthManager.isAuthenticated();
      console.log(`Authentication status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
      return isAuthenticated;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
}
