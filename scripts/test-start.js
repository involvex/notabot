#!/usr/bin/env node

console.log('🧪 Testing NotABot startup...\n');

try {
  // Import the main function
  const { main } = await import('./notabot.js');
  
  console.log('✅ NotABot module loaded successfully');
  console.log('✅ Main function exported correctly');
  
  // Test if we can create an instance
  const { NotABotAgent } = await import('./notabot.js');
  console.log('✅ NotABotAgent class available');
  
  console.log('\n🎉 NotABot should start properly now!');
  console.log('Try running: notabot');
  
} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('Stack:', error.stack);
} 
