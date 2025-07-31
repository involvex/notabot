/**
 * OAuth Authentication Module for Enhanced CLI Agent
 * Handles Google OAuth authentication via web server
 */

import { createServer } from 'http';
import { URL } from 'url';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class OAuthAuthenticator {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
    this.redirectUri = 'http://localhost:3000/auth/callback';
    this.authServer = null;
    this.authPromise = null;
    this.authResolve = null;
    this.authReject = null;
  }

  async startAuthServer() {
    return new Promise((resolve, reject) => {
      this.authResolve = resolve;
      this.authReject = reject;

      this.authServer = createServer((req, res) => {
        const url = new URL(req.url, `http://localhost:3000`);
        
        if (url.pathname === '/auth') {
          // Redirect to Google OAuth
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${this.clientId}&` +
            `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')}&` +
            `access_type=offline&` +
            `prompt=consent`;
          
          res.writeHead(302, { Location: authUrl });
          res.end();
        } else if (url.pathname === '/auth/callback') {
          const code = url.searchParams.get('code');
          
          if (code) {
            this.handleAuthCallback(code, res);
          } else {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication failed</h1><p>No authorization code received.</p>');
            this.authReject(new Error('No authorization code received'));
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>Not Found</h1>');
        }
      });

      this.authServer.listen(3000, () => {
        console.log('OAuth server started on http://localhost:3000');
        console.log('Visit http://localhost:3000/auth to authenticate');
      });
    });
  }

  async handleAuthCallback(code, res) {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(`Token exchange failed: ${tokenData.error}`);
      }

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();
      
      // Store tokens securely
      const authData = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        user: userData,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
      };

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Authentication Successful</title></head>
          <body>
            <h1>✅ Authentication Successful!</h1>
            <p>Welcome, ${userData.name}!</p>
            <p>You can now close this window and return to the CLI.</p>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `);

      this.authResolve(authData);
      
      // Close the auth server
      setTimeout(() => {
        if (this.authServer) {
          this.authServer.close();
        }
      }, 1000);

    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Authentication Error</h1><p>${error.message}</p>`);
      this.authReject(error);
    }
  }

  async authenticate() {
    try {
      // Open browser for authentication
      const platform = process.platform;
      let command;
      
      if (platform === 'win32') {
        command = 'start';
      } else if (platform === 'darwin') {
        command = 'open';
      } else {
        command = 'xdg-open';
      }

      spawn(command, ['http://localhost:3000/auth'], { stdio: 'ignore' });

      // Wait for authentication
      const authData = await this.startAuthServer();
      return authData;
    } catch (error) {
      throw new Error(`OAuth authentication failed: ${error.message}`);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await response.json();
      
      if (tokenData.error) {
        throw new Error(`Token refresh failed: ${tokenData.error}`);
      }

      return {
        access_token: tokenData.access_token,
        expires_at: Date.now() + (tokenData.expires_in * 1000),
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
} 
