import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Define interfaces for token management
interface TokenData {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

interface TokenStorage {
  tokens: TokenData | null;
}

export class OAuthManager {
  private oauth2Client: OAuth2Client;
  private tokensPath: string;
  private isInitialized: boolean = false;

  constructor() {
    // Create the OAuth client using environment variables
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/oauth2callback'
    );

    // Set tokens storage path
    this.tokensPath = process.env.TOKENS_PATH || path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../tokens.json'
    );
  }

  /**
   * Get authorization URL for OAuth consent flow
   * @returns URL to redirect user for authorization
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent screen to ensure refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   * @param code Authorization code from OAuth callback
   */
  async exchangeCode(code: string): Promise<TokenData> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      
      // Save tokens to file system
      await this.saveTokens(tokens as TokenData);
      this.isInitialized = true;
      
      return tokens as TokenData;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  /**
   * Save tokens to file system
   * @param tokens OAuth tokens
   */
  private async saveTokens(tokens: TokenData): Promise<void> {
    try {
      const data: TokenStorage = { tokens };
      await fs.writeFile(this.tokensPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  }

  /**
   * Load tokens from file system
   * @returns Loaded tokens or null if not found
   */
  async loadTokens(): Promise<TokenData | null> {
    try {
      const data = await fs.readFile(this.tokensPath, 'utf8');
      const { tokens } = JSON.parse(data) as TokenStorage;
      
      if (tokens) {
        this.oauth2Client.setCredentials(tokens);
        this.isInitialized = true;
      }
      
      return tokens;
    } catch (error) {
      // File might not exist yet, which is fine
      console.error('No saved tokens found or error loading tokens');
      return null;
    }
  }

  /**
   * Refresh the access token if needed
   */
  async refreshTokenIfNeeded(): Promise<void> {
    if (!this.isInitialized) {
      await this.loadTokens();
      if (!this.isInitialized) {
        return; // No tokens to refresh
      }
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const credentials = this.oauth2Client.credentials;
    const expiryDate = credentials.expiry_date as number;
    
    if (!expiryDate || Date.now() >= expiryDate - 5 * 60 * 1000) {
      try {
        // Use the refreshAccessToken method instead of the protected refreshToken
        const refreshTokenResponse = await this.oauth2Client.refreshAccessToken();
        const tokens = refreshTokenResponse.credentials;
        await this.saveTokens(tokens as TokenData);
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
  }

  /**
   * Get the OAuth2 client for API requests
   * @returns The configured OAuth2 client
   */
  async getOAuth2Client(): Promise<OAuth2Client> {
    if (!this.isInitialized) {
      await this.loadTokens();
    }
    return this.oauth2Client;
  }

  /**
   * Check if OAuth is configured and tokens are available
   */
  async isAuthenticated(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.loadTokens();
    }
    return this.isInitialized;
  }

  /**
   * Revoke access tokens
   */
  async revokeTokens(): Promise<void> {
    if (!this.isInitialized) {
      await this.loadTokens();
      if (!this.isInitialized) {
        console.log('No tokens found to revoke.');
        return; // No tokens to revoke
      }
    }

    try {
      // Try to revoke tokens from Google, but don't fail if it doesn't work
      // (tokens might already be expired or revoked)
      try {
        await this.oauth2Client.revokeCredentials();
        console.log('Tokens revoked from Google servers.');
      } catch (revokeError: any) {
        console.warn('Could not revoke tokens from Google servers (they may already be expired/revoked):', revokeError.message);
      }
      
      // Always remove the local tokens file regardless of Google revocation status
      try {
        await fs.unlink(this.tokensPath);
        console.log('Local tokens file deleted.');
      } catch (unlinkError: any) {
        if (unlinkError.code !== 'ENOENT') {
          console.warn('Could not delete local tokens file:', unlinkError.message);
        }
      }
      
      this.isInitialized = false;
      console.log('Local authentication state cleared.');
    } catch (error) {
      console.error('Error during token revocation:', error);
      throw error;
    }
  }
}

// Singleton export
export const oauthManager = new OAuthManager();
