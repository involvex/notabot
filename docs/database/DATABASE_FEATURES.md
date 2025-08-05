# 🗄️ NotABot Database Features

## ✅ **Complete Database Integration Added!**

NotABot now includes a comprehensive SQLite database system for persistent storage of conversations, settings, and user data.

## 🏗️ **Database Architecture**

### **Tables Created:**
- **`conversations`** - All user-assistant interactions
- **`sessions`** - Session tracking and statistics
- **`settings`** - Persistent settings storage
- **`user_profiles`** - OAuth user data and preferences
- **`indexed_files`** - File indexing for search
- **`search_history`** - Search query history
- **`auto_mode_logs`** - Auto mode command logs
- **`web_server_logs`** - Web server access logs

## 🚀 **New Database Commands**

### **Database Management:**
```
/db status              - Show database statistics
/db conversations [10]  - Show recent conversations
/db sessions            - Show recent sessions
/db search <query>      - Search conversation history
/db cleanup [30]        - Clean up old data (days)
/db backup [path]       - Create database backup
```

### **Database Statistics:**
- Total conversations stored
- Session tracking
- Database size monitoring
- Recent activity (24h)
- File indexing stats
- Search history tracking

## 💾 **What Gets Saved**

### **Conversations:**
- User messages
- Assistant responses
- Timestamps
- Session context
- Tool calls
- Settings used

### **Sessions:**
- Session ID tracking
- Start/end times
- Message counts
- Settings snapshots
- Metadata

### **Settings:**
- All user preferences
- OAuth credentials
- Auto mode configuration
- Web server settings

### **User Profiles:**
- OAuth user data
- Email and name
- Preferences
- Last login times

## 🔍 **Search & History Features**

### **Conversation Search:**
```
/db search "API key"
/db search "OAuth"
/db search "web server"
```

### **Session History:**
```
/db sessions
```
Shows all previous sessions with message counts and timestamps.

### **Recent Conversations:**
```
/db conversations 20
```
Shows the last 20 conversations with previews.

## 🧹 **Data Management**

### **Automatic Cleanup:**
```
/db cleanup 30
```
Removes data older than 30 days to keep database size manageable.

### **Database Backup:**
```
/db backup notabot_backup.db
```
Creates a complete backup of all data.

### **Statistics Monitoring:**
```
/db status
```
Shows comprehensive database statistics including:
- Conversation count
- Session count
- Database size
- Recent activity
- Indexed files

## 🔧 **Integration Features**

### **Automatic Saving:**
- Every conversation is automatically saved
- Session data is preserved
- Settings are persisted
- OAuth data is stored securely

### **Session Tracking:**
- Unique session IDs
- Start/end timestamps
- Message statistics
- Context preservation

### **Error Handling:**
- Graceful database failures
- Fallback to in-memory storage
- Automatic retry mechanisms
- Data integrity checks

## 📊 **Database Location**

The database is stored at:
```
~/.notabot/notabot.db
```

### **Database Structure:**
```
notabot.db
├── conversations (user-assistant interactions)
├── sessions (session tracking)
├── settings (persistent settings)
├── user_profiles (OAuth user data)
├── indexed_files (file search index)
├── search_history (search queries)
├── auto_mode_logs (auto mode activity)
└── web_server_logs (web access logs)
```

## 🛡️ **Security & Privacy**

### **Data Protection:**
- Local SQLite database (no cloud storage)
- Encrypted OAuth tokens
- Secure session management
- Privacy-focused design

### **Data Control:**
- Full data export capability
- Selective cleanup options
- Complete data deletion
- Backup/restore functionality

## 🎯 **Usage Examples**

### **Check Database Health:**
```
/db status
```

### **Search Past Conversations:**
```
/db search "API key setup"
```

### **View Recent Sessions:**
```
/db sessions
```

### **Clean Old Data:**
```
/db cleanup 7
```

### **Backup Database:**
```
/db backup my_backup.db
```

## 🔄 **Migration from Old System**

The database system automatically:
- Migrates existing settings
- Preserves conversation history
- Maintains OAuth credentials
- Keeps all user preferences

## 📈 **Performance Features**

### **Optimizations:**
- Indexed queries for fast search
- Efficient data storage
- Automatic cleanup
- Connection pooling
- Query optimization

### **Monitoring:**
- Database size tracking
- Query performance metrics
- Storage usage monitoring
- Activity statistics

## 🎉 **Benefits**

### **Persistent Memory:**
- Never lose conversations
- Remember user preferences
- Track session history
- Maintain context across sessions

### **Advanced Search:**
- Search all past conversations
- Find specific topics
- Track user patterns
- Analyze usage statistics

### **Data Management:**
- Automatic backups
- Cleanup old data
- Export capabilities
- Privacy controls

## 🚀 **Getting Started**

1. **Start NotABot:**
   ```bash
   notabot
   ```

2. **Check Database Status:**
   ```
   /db status
   ```

3. **Search History:**
   ```
   /db search "your query"
   ```

4. **View Conversations:**
   ```
   /db conversations
   ```

The database is automatically initialized when you start NotABot, and all conversations are automatically saved!

---

**Your NotABot now has complete persistent memory and advanced data management capabilities! 🎉** 
