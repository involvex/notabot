# Enhanced CLI Agent - Advanced Features

## 🚀 New Features Added

The Enhanced CLI Agent now includes advanced features based on the original Gemini CLI codebase:

### 1. **YOLO Mode** ⚠️
- **Purpose**: Enable dangerous operations that are normally restricted
- **Usage**: `/yolo` to toggle YOLO mode
- **Tool Usage**: `@yolo_mode action=enable`
- **Safety**: Shows clear warnings when enabled

### 2. **Web Server with Live Dashboard** 🌐
- **Purpose**: Real-time monitoring and control via web interface
- **Usage**: `/webserver start` to start the server
- **URL**: `http://localhost:4000` (default)
- **Features**:
  - Live session statistics
  - Real-time history display
  - Settings management
  - Remote control buttons
  - WebSocket updates

### 3. **Read All Files Tool** 📁
- **Purpose**: Read all files in a directory recursively
- **Usage**: `/readall <directory>` or `@read_all_files path=. exclude=node_modules,.git`
- **Features**:
  - Recursive file reading
  - Exclude patterns (node_modules, .git, etc.)
  - File content display
  - Error handling for unreadable files

### 4. **CD Command** 📂
- **Purpose**: Change directory and track current location
- **Usage**: `/cd <directory>` or `@cd path=../`
- **Features**:
  - Directory validation
  - Path resolution
  - Current directory tracking
  - Error handling

## 🛠️ Advanced Tool System

### Available Tools

#### Basic Tools
- `list_directory` - List files and directories
- `read_file` - Read file contents
- `write_file` - Write content to file
- `run_shell_command` - Execute shell commands

#### Advanced Tools
- `read_all_files` - Read all files recursively
- `cd` - Change directory
- `yolo_mode` - Enable/disable YOLO mode
- `code_analysis` - Analyze code quality

### Tool Usage Examples

```bash
# Read all files in current directory
@read_all_files path=. exclude=node_modules,.git

# Change to parent directory
@cd path=../

# Enable YOLO mode
@yolo_mode action=enable

# Analyze a JavaScript file
@code_analysis path=app.js
```

## 🌐 Web Server Dashboard

### Starting the Web Server

```bash
# Start web server
/webserver start

# Check status
/webserver status

# Stop web server
/webserver stop
```

### Dashboard Features

1. **Status Panel**
   - Agent name and version
   - Running status
   - Current directory
   - Session statistics
   - YOLO mode status

2. **Settings Panel**
   - All current settings
   - API key status (hidden)
   - Configuration options

3. **History Panel**
   - Real-time conversation history
   - Color-coded message types
   - Timestamp information

4. **Control Panel**
   - Toggle YOLO mode
   - Clear history
   - Reset session
   - Real-time updates

### Web Server API Endpoints

- `GET /` - Main dashboard
- `GET /api/status` - Current status
- `GET /api/history` - Session history
- `GET /api/settings` - Current settings

## ⚠️ YOLO Mode

### What is YOLO Mode?

YOLO (You Only Live Once) mode allows dangerous operations that are normally restricted for safety reasons.

### Enabling YOLO Mode

```bash
# Toggle YOLO mode
/yolo

# Enable via tool
@yolo_mode action=enable

# Disable via tool
@yolo_mode action=disable
```

### YOLO Mode Features

- **Dangerous File Operations**: Delete, overwrite, modify system files
- **System Commands**: Execute potentially harmful shell commands
- **Network Operations**: Make network requests
- **Process Control**: Kill processes, modify system settings

### Safety Warnings

When YOLO mode is enabled, you'll see:
```
⚠️  YOLO MODE ENABLED ⚠️
Dangerous operations are now allowed!
```

## 📁 Read All Files Tool

### Basic Usage

```bash
# Read all files in current directory
/readall .

# Read all files in specific directory
/readall /path/to/directory

# Use tool directly
@read_all_files path=. exclude=node_modules,.git
```

### Exclude Patterns

The tool automatically excludes common directories:
- `node_modules`
- `.git`
- `.vscode`
- `.idea`

You can specify custom exclude patterns:
```bash
@read_all_files path=. exclude=temp,logs,backup
```

### Output Format

```
Read 15 files from /path/to/directory:

=== /path/to/directory/file1.js ===
[File content here]

=== /path/to/directory/file2.txt ===
[File content here]

...
```

## 📂 CD Command

### Basic Usage

```bash
# Change to specific directory
/cd /path/to/directory

# Change to parent directory
/cd ..

# Change to home directory
/cd ~

# Use tool directly
@cd path=../src
```

### Features

- **Path Validation**: Checks if directory exists
- **Type Checking**: Ensures path is a directory
- **Absolute Path Resolution**: Converts relative paths
- **Error Handling**: Clear error messages for invalid paths

### Current Directory Tracking

The agent tracks the current directory and displays it in:
- Session statistics (`/stats`)
- Web dashboard
- Directory listings

## 🎮 Advanced Commands

### New Commands

```bash
/yolo           # Toggle YOLO mode
/cd <dir>       # Change directory
/webserver      # Control web server
/readall <dir>  # Read all files in directory
```

### Enhanced Commands

```bash
/stats          # Now includes YOLO mode and web server status
/settings       # Shows all configuration options
/tools          # Lists all available tools including new ones
```

## 🔧 Configuration

### Settings File

Enhanced settings are stored in `~/.enhanced-cli/settings.json`:

```json
{
  "theme": "default",
  "model": "gemini-1.5-flash",
  "authType": "api-key",
  "apiKey": "",
  "showMemoryUsage": false,
  "debugMode": false,
  "maxSessionTurns": 50,
  "maxTokens": 4096,
  "temperature": 0.7,
  "yoloMode": false,
  "currentDirectory": "/path/to/current/dir",
  "webServerEnabled": false,
  "webServerPort": 4000
}
```

### Environment Variables

- `GEMINI_API_KEY` - Your Gemini API key
- `ENHANCED_CLI_PORT` - Web server port (default: 4000)

## 🚨 Safety Features

### YOLO Mode Warnings

- Clear visual warnings when enabled
- Confirmation for dangerous operations
- Session tracking of YOLO mode usage
- Automatic logging of dangerous actions

### File Operation Safety

- Path validation before operations
- Exclude patterns for sensitive directories
- Error handling for permission issues
- Backup suggestions for destructive operations

### Web Server Security

- Local-only access (localhost)
- No external network access
- Session-based controls
- Secure API endpoints

## 📊 Session Statistics

Enhanced statistics now include:

```bash
Session Statistics:
  User messages: 5
  Assistant messages: 5
  Tool calls: 3
  Total messages: 13
  Session duration: 120 seconds
  Current directory: /path/to/current/dir
  YOLO mode: Disabled
  Web server: Running
```

## 🔄 Integration with Original Gemini CLI

### Compatible Features

- **Tool System**: Enhanced version of original tools
- **Settings Management**: Improved persistence
- **Session Tracking**: Advanced statistics
- **Error Handling**: Graceful error management

### Enhanced Features

- **YOLO Mode**: New safety override system
- **Web Dashboard**: Real-time monitoring
- **File Operations**: Advanced file reading
- **Directory Navigation**: CD command with tracking

## 🎯 Use Cases

### Development Workflow

1. **Start Enhanced CLI Agent**
   ```bash
   enhanced-cli
   ```

2. **Set API Key**
   ```bash
   /auth YOUR_GEMINI_API_KEY
   ```

3. **Start Web Dashboard**
   ```bash
   /webserver start
   ```

4. **Read Project Files**
   ```bash
   /readall .
   ```

5. **Navigate and Analyze**
   ```bash
   /cd src
   /analyze main.js
   ```

6. **Enable YOLO for Advanced Operations**
   ```bash
   /yolo
   ```

### Monitoring and Control

- **Real-time Dashboard**: Monitor session progress
- **Remote Control**: Use web interface for commands
- **Session Management**: Track usage and performance
- **Safety Controls**: Manage YOLO mode remotely

## 🛠️ Troubleshooting

### Web Server Issues

```bash
# Check if port is in use
netstat -an | findstr :4000

# Change port
# Edit settings.json: "webServerPort": 4001
```

### YOLO Mode Issues

```bash
# Check YOLO mode status
/stats

# Disable YOLO mode
/yolo
```

### File Reading Issues

```bash
# Check file permissions
@run_shell_command command=ls -la

# Read specific file
@read_file path=filename.txt
```

## 🎉 Conclusion

The Enhanced CLI Agent now provides:

✅ **YOLO Mode** for advanced operations
✅ **Web Server** with live dashboard
✅ **Read All Files** tool for comprehensive file access
✅ **CD Command** for directory navigation
✅ **Advanced Session Statistics**
✅ **Real-time Monitoring**
✅ **Safety Controls**

All features are designed to work together seamlessly while maintaining the stability and user-friendly interface of the original CLI agents. 
