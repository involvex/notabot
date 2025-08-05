#!/usr/bin/env node

import { NotABotDatabase } from './database.js';

console.log('🧪 Testing NotABot Database...\n');

async function testDatabase() {
  const db = new NotABotDatabase();
  
  try {
    // Initialize database
    console.log('1. Initializing database...');
    await db.initialize();
    console.log('✅ Database initialized successfully');
    
    // Test session creation
    console.log('\n2. Testing session creation...');
    const sessionId = `test_session_${Date.now()}`;
    await db.createSession(sessionId, { test: true });
    console.log('✅ Session created successfully');
    
    // Test conversation saving
    console.log('\n3. Testing conversation saving...');
    await db.saveConversation(
      sessionId,
      'Hello, this is a test message',
      'Hello! This is a test response.',
      null,
      'Test context',
      { test: true }
    );
    console.log('✅ Conversation saved successfully');
    
    // Test conversation retrieval
    console.log('\n4. Testing conversation retrieval...');
    const conversations = await db.getConversations(sessionId, 5);
    console.log(`✅ Retrieved ${conversations.length} conversations`);
    
    // Test settings
    console.log('\n5. Testing settings...');
    await db.saveSetting('test_setting', { value: 'test' });
    const setting = await db.getSetting('test_setting');
    console.log('✅ Settings saved and retrieved successfully');
    
    // Test database stats
    console.log('\n6. Testing database statistics...');
    const stats = await db.getDatabaseStats();
    console.log('✅ Database statistics retrieved:');
    console.log(`   Conversations: ${stats.conversations_count || 0}`);
    console.log(`   Sessions: ${stats.sessions_count || 0}`);
    console.log(`   Database Size: ${((stats.database_size_bytes || 0) / 1024).toFixed(2)} KB`);
    
    // Test cleanup
    console.log('\n7. Testing cleanup...');
    await db.cleanupOldData(365); // Keep last year
    console.log('✅ Cleanup completed successfully');
    
    // Close database
    console.log('\n8. Closing database...');
    await db.close();
    console.log('✅ Database closed successfully');
    
    console.log('\n🎉 All database tests passed!');
    console.log('\nYour NotABot database is ready to use!');
    console.log('Try running: notabot');
    console.log('Then use: /db status');
    
  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    console.log('Stack:', error.stack);
  }
}

testDatabase(); 
