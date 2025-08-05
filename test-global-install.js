#!/usr/bin/env node

console.log('🔧 Testing NotABot Global Installation...\n');

// Test 1: Check if we can import the main module
try {
    console.log('✅ Test 1: Importing notabot.js...');
    const notabot = await import('./notabot.js');
    console.log('✅ notabot.js imported successfully');
} catch (error) {
    console.log('❌ Error importing notabot.js:', error.message);
}

// Test 2: Check if database module works
try {
    console.log('\n✅ Test 2: Testing database module...');
    const { NotABotDatabase } = await import('./database.js');
    console.log('✅ Database module imported successfully');
} catch (error) {
    console.log('❌ Error importing database.js:', error.message);
}

// Test 3: Check if OAuth module works
try {
    console.log('\n✅ Test 3: Testing OAuth module...');
    const { OAuthAuthenticator } = await import('./oauth-auth.js');
    console.log('✅ OAuth module imported successfully');
} catch (error) {
    console.log('❌ Error importing oauth-auth.js:', error.message);
}

// Test 4: Check package.json
try {
    console.log('\n✅ Test 4: Checking package.json...');
    const fs = await import('fs');
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    console.log('✅ Package name:', packageJson.name);
    console.log('✅ Version:', packageJson.version);
    console.log('✅ Bin entries:', Object.keys(packageJson.bin));
} catch (error) {
    console.log('❌ Error reading package.json:', error.message);
}

// Test 5: Check if global installation is available
try {
    console.log('\n✅ Test 5: Checking global installation...');
    const { execSync } = await import('child_process');
    const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    console.log('✅ NPM global root:', npmRoot);
    
    // Check if notabot is in global packages
    const globalPackages = execSync('npm list -g --depth=0', { encoding: 'utf8' });
    if (globalPackages.includes('notabot')) {
        console.log('✅ NotABot found in global packages');
    } else {
        console.log('⚠️  NotABot not found in global packages');
    }
} catch (error) {
    console.log('❌ Error checking global installation:', error.message);
}

console.log('\n🎉 Global installation test completed!');
console.log('\nTo install globally, run: npm install -g .');
console.log('To test the CLI, run: notabot'); 