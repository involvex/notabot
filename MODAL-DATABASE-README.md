# 🗄️ Modal Database System

**Intelligent file indexing, prompt memory, and history tracking for Enhanced CLI Agents**

## ✨ Features

### 📁 **File Indexing**
- **Automatic Indexing**: Index files with metadata and content
- **Language Detection**: Automatically detect programming languages
- **Tag Extraction**: Extract meaningful tags from code
- **Content Search**: Search through file contents and metadata
- **Exclude Patterns**: Skip unwanted directories (node_modules, .git, etc.)

### 💬 **Prompt Memory**
- **Persistent Storage**: Store all prompts and responses
- **Context Tracking**: Remember session context and settings
- **Similarity Search**: Find similar prompts from history
- **Metadata Analysis**: Track prompt characteristics (length, code presence, etc.)

### 📜 **History Tracking**
- **Session History**: Track all interactions and commands
- **Timeline View**: Chronological history with timestamps
- **Statistics**: Usage analytics and database metrics
- **Cleanup**: Automatic cleanup of old data

### 🔍 **Advanced Search**
- **File Search**: Search indexed files by content and metadata
- **Prompt Search**: Find similar prompts from history
- **Combined Results**: Search both files and prompts simultaneously
- **Relevance Scoring**: Intelligent ranking of search results

## 🚀 Quick Start

### Basic Usage

```bash
# Start enhanced CLI
enhanced-cli

# Index current directory
/index

# Search for files and prompts
/search "function"

# View recent history
/history

# Check database statistics
/stats

# Clean up old data
/cleanup
```

### File Indexing

```bash
# Index current directory
/index

# Index specific directory
/index /path/to/project

# Index with custom excludes
# (Edit modal-db.js to customize exclude patterns)
```

### Search Examples

```bash
# Search for JavaScript functions
/search "function"

# Search for React components
/search "React"

# Search for API endpoints
/search "api"

# Search for error handling
/search "try catch"

# Search for specific file types
/search ".js"
```

## 📊 Database Structure

### File Index
```json
{
  "path": "/path/to/file.js",
  "name": "file.js",
  "extension": ".js",
  "size": 1024,
  "modified": "2024-01-01T00:00:00.000Z",
  "hash": "md5-hash",
  "content": "file content (first 10KB)",
  "lines": 50,
  "language": "JavaScript",
  "tags": ["function", "react", "component"],
  "lastAccessed": "2024-01-01T00:00:00.000Z"
}
```

### Prompt Storage
```json
{
  "id": "md5-hash",
  "prompt": "How do I create a React component?",
  "response": "To create a React component...",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "context": {
    "currentDirectory": "/path/to/project",
    "yoloMode": false,
    "webServerRunning": true
  },
  "metadata": {
    "promptLength": 35,
    "responseLength": 150,
    "hasCode": true,
    "hasFiles": false
  }
}
```

### History Entry
```json
{
  "type": "prompt",
  "id": "md5-hash",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "prompt": "How do I create a React component?..."
}
```

## 🛠️ Available Commands

### `/index [path]`
Index files in the specified directory (defaults to current directory).

**Features:**
- Automatic language detection
- Tag extraction from code
- Content indexing for search
- Exclude common patterns (node_modules, .git, etc.)

**Examples:**
```bash
/index                    # Index current directory
/index /path/to/project   # Index specific directory
```

### `/search <query>`
Search indexed files and prompt history.

**Features:**
- File content search
- Prompt similarity search
- Relevance scoring
- Combined results display

**Examples:**
```bash
/search "function"         # Search for functions
/search "React component"  # Search for React components
/search "error handling"   # Search for error handling
/search ".js"             # Search for JavaScript files
```

### `/history [limit]`
Show recent history entries.

**Features:**
- Chronological timeline
- Session and prompt history
- Timestamp display
- Configurable limit

**Examples:**
```bash
/history        # Show last 10 entries
/history 20     # Show last 20 entries
```

### `/stats`
Display database statistics.

**Features:**
- File count and types
- Prompt statistics
- Database size
- Usage analytics

**Output:**
```
📊 Modal Database Statistics:
  📁 Indexed files: 150
  💬 Total prompts: 45
  📜 Recent prompts: 12
  💾 Database size: 2.34 KB
  🕒 Last used: 1/1/2024, 12:00:00 PM
```

### `/cleanup [days]`
Clean up old data (default: 30 days).

**Features:**
- Remove old prompts
- Clean up history
- Maintain database performance
- Configurable retention period

**Examples:**
```bash
/cleanup        # Clean up data older than 30 days
/cleanup 7      # Clean up data older than 7 days
```

## 🔧 Configuration

### Database Location
The modal database is stored at:
- **Windows**: `%USERPROFILE%\.enhanced-cli\modal-db.json`
- **macOS/Linux**: `~/.enhanced-cli/modal-db.json`

### Exclude Patterns
Default exclude patterns in `modal-db.js`:
```javascript
const excludePatterns = [
  'node_modules',
  '.git',
  '.vscode',
  'dist',
  'build',
  '.env'
];
```

### Language Detection
Supported file extensions:
- **JavaScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **Python**: `.py`
- **Java**: `.java`
- **C/C++**: `.c`, `.cpp`
- **Web**: `.html`, `.css`, `.scss`
- **Data**: `.json`, `.xml`, `.yaml`
- **Docs**: `.md`, `.txt`
- **Config**: `.env`, `.gitignore`

## 🔍 Search Capabilities

### File Search
- **Content Search**: Search within file contents
- **Name Search**: Search file names
- **Language Filter**: Filter by programming language
- **Tag Search**: Search extracted tags
- **Size Filter**: Filter by file size

### Prompt Search
- **Exact Match**: Find exact prompt matches
- **Similarity Search**: Find similar prompts
- **Context Search**: Search within responses
- **Metadata Search**: Search by prompt characteristics

### Combined Search
- **Unified Results**: Search both files and prompts
- **Relevance Ranking**: Intelligent result ordering
- **Quick Access**: Direct access to files and prompts

## 📈 Performance Features

### Efficient Indexing
- **Incremental Updates**: Only index changed files
- **Hash-based Detection**: Detect file changes using MD5
- **Content Sampling**: Store first 10KB for search
- **Background Processing**: Non-blocking indexing

### Smart Search
- **Indexed Search**: Fast search using pre-built indexes
- **Word Frequency**: Relevance based on word frequency
- **Context Awareness**: Consider file language and type
- **Result Caching**: Cache frequent search results

### Database Management
- **Automatic Cleanup**: Remove old data automatically
- **Size Monitoring**: Track database size
- **Performance Metrics**: Monitor search and index performance
- **Backup Support**: Export/import database

## 🎯 Use Cases

### Development Workflow
```bash
# Index your project
/index

# Search for specific patterns
/search "useState"

# Find similar problems
/search "error handling"

# Review recent work
/history
```

### Code Review
```bash
# Search for specific functions
/search "function validate"

# Find similar implementations
/search "React component"

# Check recent changes
/history 50
```

### Learning and Documentation
```bash
# Search for examples
/search "async await"

# Find documentation patterns
/search "README"

# Review your learning history
/history
```

### Project Analysis
```bash
# Index entire project
/index /path/to/project

# Analyze code patterns
/search "class"

# Check statistics
/stats
```

## 🔒 Privacy and Security

### Data Storage
- **Local Storage**: All data stored locally
- **No Cloud Sync**: No external data transmission
- **User Control**: Full control over data retention
- **Secure Cleanup**: Complete data removal

### Data Protection
- **File Hashes**: Secure file change detection
- **Content Sampling**: Limited content storage
- **Metadata Only**: Sensitive data not indexed
- **User Consent**: Explicit indexing required

## 🛠️ Troubleshooting

### Common Issues

#### Indexing Problems
```bash
# Check file permissions
ls -la /path/to/project

# Verify directory exists
pwd

# Check database file
cat ~/.enhanced-cli/modal-db.json
```

#### Search Issues
```bash
# Rebuild index
/index

# Check database stats
/stats

# Clean up and restart
/cleanup
```

#### Performance Issues
```bash
# Clean old data
/cleanup 7

# Check database size
/stats

# Restart with fresh database
# (Delete ~/.enhanced-cli/modal-db.json)
```

### Database Maintenance

#### Export Database
```javascript
// In enhanced-cli-agent.js
const exportData = this.modalDb.exportDatabase();
fs.writeFileSync('backup.json', JSON.stringify(exportData, null, 2));
```

#### Import Database
```javascript
// In enhanced-cli-agent.js
const importData = JSON.parse(fs.readFileSync('backup.json', 'utf8'));
this.modalDb.importDatabase(importData);
```

## 🚀 Advanced Features

### Custom Indexing
```javascript
// Custom exclude patterns
const customExcludes = ['node_modules', '.git', 'dist', 'coverage'];
await this.modalDb.indexDirectory('/path/to/project', customExcludes);
```

### Advanced Search
```javascript
// Search with custom filters
const fileResults = this.modalDb.searchFiles('function', 10);
const promptResults = this.modalDb.searchPrompts('React', 5);
```

### Database Analytics
```javascript
// Get detailed statistics
const stats = this.modalDb.getStats();
console.log(`Database size: ${stats.databaseSize} bytes`);
console.log(`Indexed files: ${stats.indexedFiles}`);
console.log(`Total prompts: ${stats.totalPrompts}`);
```

## 📊 Integration with Enhanced CLI

### Automatic Integration
- **Prompt Storage**: All AI interactions automatically stored
- **Context Tracking**: Session context preserved
- **File Indexing**: Automatic indexing on `/index`
- **Search Integration**: Unified search across files and prompts

### Enhanced Features
- **Smart Suggestions**: Search-based autocomplete
- **Context Awareness**: File-aware responses
- **History Learning**: Pattern recognition from history
- **Performance Monitoring**: Database performance tracking

---

**The Modal Database System provides intelligent file indexing, persistent prompt memory, and comprehensive history tracking for the Enhanced CLI Agents, making your development workflow more efficient and context-aware! 🗄️✨** 
