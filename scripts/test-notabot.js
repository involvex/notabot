#!/usr/bin/env node

/**
 * Test script for NotABot installation
 */

import { spawn } from 'child_process';
import readline from 'readline';

console.log('🧪 Testing NotABot installation...\n');

// Test 1: Check if notabot command is available
console.log('1. Testing global installation...');
try {
  const { execSync } = await import('child_process');
  const version = execSync('notabot --version', { encoding: 'utf8' });
  console.log('✅ NotABot is installed globally');
  console.log(`   Version: ${version.trim()}`);
} catch (error) {
  console.log('❌ NotABot not found globally');
  console.log('   Try: npm install -g notabot --force');
}

// Test 2: Check if nb alias works
console.log('\n2. Testing nb alias...');
try {
  const { execSync } = await import('child_process');
  const version = execSync('nb --version', { encoding: 'utf8' });
  console.log('✅ nb alias is working');
} catch (error) {
  console.log('❌ nb alias not working');
}

// Test 3: Test basic functionality
console.log('\n3. Testing basic functionality...');
const notabot = spawn('notabot', [], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let hasStarted = false;

notabot.stdout.on('data', (data) => {
  output += data.toString();
  if (output.includes('NotABot v1.0.0') && !hasStarted) {
    hasStarted = true;
    console.log('✅ NotABot starts successfully');
    
    // Send help command
    notabot.stdin.write('/help\n');
    
    // Wait a bit then quit
    setTimeout(() => {
      notabot.stdin.write('/quit\n');
    }, 2000);
  }
});

notabot.stderr.on('data', (data) => {
  console.log('⚠️  Warning:', data.toString());
});

notabot.on('close', (code) => {
  console.log('✅ NotABot test completed');
  console.log(`   Exit code: ${code}`);
});

// Test 4: Check settings directory
console.log('\n4. Testing settings directory...');
import fs from 'fs';
import path from 'path';
import os from 'os';

const settingsDir = path.join(os.homedir(), '.notabot');
if (fs.existsSync(settingsDir)) {
  console.log('✅ Settings directory exists');
  const settingsFile = path.join(settingsDir, 'settings.json');
  if (fs.existsSync(settingsFile)) {
    console.log('✅ Settings file exists');
    try {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      console.log(`   Auto mode: ${settings.autoMode ? 'enabled' : 'disabled'}`);
      console.log(`   Web server: ${settings.webServerEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.log('❌ Settings file is invalid JSON');
    }
  } else {
    console.log('❌ Settings file missing');
  }
} else {
  console.log('❌ Settings directory missing');
  console.log('   Run: npm run setup');
}

console.log('\n🎉 NotABot installation test completed!');
console.log('\nTo start NotABot:');
console.log('  notabot');
console.log('\nTo start web dashboard:');
console.log('  notabot');
console.log('  /webserver start');
console.log('\nTo enable auto mode:');
console.log('  notabot');
console.log('  /auto enable'); 
