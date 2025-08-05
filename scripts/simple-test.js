#!/usr/bin/env node

console.log('🧪 Simple NotABot Test\n');

// Test 1: Check if notabot command exists
console.log('1. Testing notabot command...');
try {
  const { execSync } = await import('child_process');
  const result = execSync('where notabot', { encoding: 'utf8' });
  console.log('✅ NotABot found at:', result.trim());
} catch (error) {
  console.log('❌ NotABot not found in PATH');
}

// Test 2: Check if nb alias exists
console.log('\n2. Testing nb alias...');
try {
  const { execSync } = await import('child_process');
  const result = execSync('where nb', { encoding: 'utf8' });
  console.log('✅ nb alias found at:', result.trim());
} catch (error) {
  console.log('❌ nb alias not found in PATH');
}

// Test 3: Check if files exist
console.log('\n3. Testing file existence...');
import fs from 'fs';
import path from 'path';

const files = [
  'notabot.js',
  'package.json',
  'setup.js',
  'oauth-auth.js',
  'autocomplete.js',
  'modal-db.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 4: Check package.json
console.log('\n4. Testing package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package name: ${packageJson.name}`);
  console.log(`✅ Version: ${packageJson.version}`);
  console.log(`✅ Type: ${packageJson.type}`);
  
  if (packageJson.bin) {
    console.log('✅ Bin entries:');
    Object.entries(packageJson.bin).forEach(([name, path]) => {
      console.log(`   ${name}: ${path}`);
    });
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n🎉 Test completed!');
console.log('\nTo start NotABot:');
console.log('  notabot');
console.log('  nb'); 
