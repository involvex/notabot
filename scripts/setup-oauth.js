#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up OAuth credentials from JSON file...\n');

// Path to the OAuth credentials file
const credentialsPath = 'f:\\Downloads\\client_secret_57386476101-ndu1bfbj7us90j0kvc77ph8v6fe78f4g.apps.googleusercontent.com.json';

try {
  // Read the credentials file
  const credentialsData = fs.readFileSync(credentialsPath, 'utf8');
  const credentials = JSON.parse(credentialsData);
  
  // Extract client ID and secret
  const clientId = credentials.installed.client_id;
  const clientSecret = credentials.installed.client_secret;
  const projectId = credentials.installed.project_id;
  
  console.log('✅ OAuth credentials extracted:');
  console.log(`   Client ID: ${clientId}`);
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Client Secret: ${clientSecret.substring(0, 10)}...`);
  
  // Set environment variables
  process.env.GOOGLE_CLIENT_ID = clientId;
  process.env.GOOGLE_CLIENT_SECRET = clientSecret;
  
  console.log('\n✅ Environment variables set:');
  console.log(`   GOOGLE_CLIENT_ID=${clientId}`);
  console.log(`   GOOGLE_CLIENT_SECRET=${clientSecret}`);
  
  // Test the OAuth module
  console.log('\n🧪 Testing OAuth module...');
  try {
    const { OAuthAuthenticator } = await import('./oauth-auth.js');
    const oauth = new OAuthAuthenticator();
    console.log('✅ OAuth module loaded with credentials');
    
    if (oauth.clientId === clientId) {
      console.log('✅ OAuth credentials properly configured');
    } else {
      console.log('⚠️  OAuth credentials not matching');
    }
  } catch (error) {
    console.log('❌ OAuth module error:', error.message);
  }
  
  console.log('\n🎉 OAuth setup complete!');
  console.log('You can now use: /login');
  
} catch (error) {
  console.log('❌ Error reading credentials file:', error.message);
  console.log('Make sure the file path is correct');
} 
