#!/usr/bin/env node

console.log('🔍 OAuth Configuration Debug\n');

// Check environment variables
console.log('1. Checking environment variables...');
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientId && clientId !== 'your-google-client-id') {
  console.log('✅ GOOGLE_CLIENT_ID is set');
  console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
} else {
  console.log('❌ GOOGLE_CLIENT_ID not set or using default value');
  console.log('   Please set: $env:GOOGLE_CLIENT_ID="your-actual-client-id"');
}

if (clientSecret && clientSecret !== 'your-google-client-secret') {
  console.log('✅ GOOGLE_CLIENT_SECRET is set');
  console.log(`   Secret: ${clientSecret.substring(0, 20)}...`);
} else {
  console.log('❌ GOOGLE_CLIENT_SECRET not set or using default value');
  console.log('   Please set: $env:GOOGLE_CLIENT_SECRET="your-actual-client-secret"');
}

// Check if we can import the OAuth module
console.log('\n2. Testing OAuth module...');
try {
  const { OAuthAuthenticator } = await import('./oauth-auth.js');
  const oauth = new OAuthAuthenticator();
  console.log('✅ OAuth module loaded successfully');
  
  if (oauth.clientId === 'your-google-client-id') {
    console.log('⚠️  OAuth using default credentials (will fail)');
  } else {
    console.log('✅ OAuth using configured credentials');
  }
} catch (error) {
  console.log('❌ OAuth module error:', error.message);
}

// Check for Gemini API key as alternative
console.log('\n3. Checking for Gemini API key...');
const geminiKey = process.env.GEMINI_API_KEY;
if (geminiKey) {
  console.log('✅ GEMINI_API_KEY is set');
  console.log('   You can use: /auth YOUR_API_KEY instead of OAuth');
} else {
  console.log('❌ GEMINI_API_KEY not set');
  console.log('   Get one from: https://makersuite.google.com/app/apikey');
}

console.log('\n📋 Next Steps:');
console.log('1. Set up OAuth credentials in Google Cloud Console');
console.log('2. Set environment variables with actual values');
console.log('3. Or use API key authentication: /auth YOUR_API_KEY');
console.log('\nFor OAuth setup guide, see: OAUTH_SETUP.md'); 
