#!/usr/bin/env node

import fs from 'fs';

console.log('🚀 Starting NotABot with OAuth credentials...\n');

// Load OAuth credentials
const credentialsPath = 'f:\\Downloads\\client_secret_57386476101-ndu1bfbj7us90j0kvc77ph8v6fe78f4g.apps.googleusercontent.com.json';

try {
  // Read and parse credentials
  const credentialsData = fs.readFileSync(credentialsPath, 'utf8');
  const credentials = JSON.parse(credentialsData);
  
  // Set environment variables
  process.env.GOOGLE_CLIENT_ID = credentials.installed.client_id;
  process.env.GOOGLE_CLIENT_SECRET = credentials.installed.client_secret;
  
  console.log('✅ OAuth credentials loaded');
  console.log(`   Client ID: ${credentials.installed.client_id.substring(0, 20)}...`);
  console.log(`   Project: ${credentials.installed.project_id}`);
  
  // Import and start NotABot
  console.log('\n🤖 Starting NotABot...');
  const { main } = await import('./notabot.js');
  
  // Start the application
  main();
  
} catch (error) {
  console.log('❌ Error loading OAuth credentials:', error.message);
  console.log('Starting NotABot without OAuth...');
  
  // Start without OAuth
  const { main } = await import('./notabot.js');
  main();
} 
