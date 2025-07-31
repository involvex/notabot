# 🚀 Enhanced CLI Agents

**Advanced CLI agents with AI integration, OAuth authentication, and powerful features**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://nodejs.org/)

## ✨ Features

### 🔐 **Authentication**
- **Google OAuth**: Secure authentication without API keys
- **API Key Support**: Traditional API key authentication
- **Automatic Token Refresh**: Seamless OAuth token management

### 🤖 **AI Integration**
- **Gemini API**: Full integration with Google's Gemini AI
- **Context Management**: Intelligent conversation context
- **Code Analysis**: AI-powered code review and suggestions

### 🛠️ **Advanced Tools**
- **File Operations**: Read, write, and analyze files
- **Shell Commands**: Execute system commands safely
- **Web Search**: Search the web for information
- **Directory Navigation**: Change directories with tracking

### ⚠️ **YOLO Mode**
- **Dangerous Operations**: Override safety restrictions
- **Clear Warnings**: Visual indicators when enabled
- **Session Tracking**: Monitor YOLO mode usage

### 🌐 **Web Dashboard**
- **Real-time Monitoring**: Live session statistics
- **Remote Control**: Web interface for CLI control
- **Beautiful UI**: Dark theme dashboard

### ⌨️ **Autocomplete**
- **Intelligent Suggestions**: Command and tool autocomplete
- **History Learning**: Remember frequently used commands
- **Context Awareness**: Smart suggestions based on usage

## 🚀 Quick Start

### Global Installation

```bash
# Install globally
npm install -g enhanced-cli-agents

# Or clone and install
git clone https://github.com/yourusername/enhanced-cli-agents.git
cd enhanced-cli-agents
npm install -g .
```

### Usage

```bash
# Start enhanced CLI agent
enhanced-cli

# Or use short aliases
ecli
gemini-cli

# Start simple CLI agent
simple-cli
scli
```

### Authentication

```bash
# Set API key
/auth YOUR_GEMINI_API_KEY

# Or use OAuth (recommended)
/login
```

### Web Dashboard

```bash
# Start web server
/webserver start

# Visit http://localhost:4000
```

## 📦 Installation

### Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: For package management

### Method 1: Global Installation (Recommended)

```bash
npm install -g enhanced-cli-agents
```

### Method 2: Clone and Install

```bash
git clone https://github.com/yourusername/enhanced-cli-agents.git
cd enhanced-cli-agents
npm install -g .
```

### Method 3: Direct Download

```bash
# Download files
curl -O https://raw.githubusercontent.com/yourusername/enhanced-cli-agents/main/enhanced-cli-agent.js
curl -O https://raw.githubusercontent.com/yourusername/enhanced-cli-agents/main/simple-cli-agent.js
curl -O https://raw.githubusercontent.com/yourusername/enhanced-cli-agents/main/package.json

# Install dependencies
npm install

# Make executable
chmod +x enhanced-cli-agent.js simple-cli-agent.js
```

## 🔧 Configuration

### Environment Variables

```bash
# For API key authentication
export GEMINI_API_KEY="your-api-key"

# For OAuth authentication
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# Optional settings
export ENHANCED_CLI_PORT=4000
```

### Settings Files

Settings are automatically created in:
- **Simple CLI**: `~/.simple-cli/settings.json`
- **Enhanced CLI**: `~/.enhanced-cli/settings.json`

### OAuth Setup

1. **Create Google Cloud Project**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable the Gemini API

2. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Create OAuth 2.0 Client ID
   - Add `http://localhost:3000/auth/callback` to authorized redirect URIs

3. **Set Environment Variables**:
   ```bash
   export GOOGLE_CLIENT_ID="your-client-id"
   export GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## 🎮 Usage Examples

### Basic Usage

```bash
# Start enhanced CLI
enhanced-cli

# Set API key
/auth YOUR_API_KEY

# Start web dashboard
/webserver start

# Read project files
/readall .

# Navigate and analyze
/cd src
/analyze main.js
```

### OAuth Authentication

```bash
# Start OAuth flow
/login

# Browser opens for authentication
# Sign in with Google account
# Grant permissions
# Return to CLI - authenticated!

# Use AI without API key
Hello, how can you help me today?

# Check authentication status
/settings

# Logout when done
/logout
```

### Autocomplete Usage

```bash
# Command autocomplete
/hel<Tab>     # → /help
/we<Tab>      # → /webserver
/au<Tab>      # → /auth

# Tool autocomplete
@list<Tab>    # → @list_directory path=.
@read<Tab>    # → @read_file path=filename.txt
@write<Tab>   # → @write_file path=file.txt content=Hello World
```

### YOLO Mode

```bash
# Enable YOLO mode
/yolo

# Use dangerous operations
@run_shell_command command=rm -rf /tmp/test

# Disable YOLO mode
/yolo
```

## 🛠️ Available Commands

### Core Commands
```bash
/help       # Show help
/quit       # Exit application
/clear      # Clear screen
/tools      # Show available tools
/history    # Show conversation history
/settings   # Show current settings
/auth       # Set API key
/debug      # Toggle debug mode
/stats      # Show session statistics
/analyze    # Analyze code file
/context    # Show current context
/reset      # Reset session
```

### Advanced Commands
```bash
/yolo       # Toggle YOLO mode
/cd         # Change directory
/webserver  # Control web server
/readall    # Read all files in directory
/login      # Login with Google OAuth
/logout     # Logout from OAuth
```

## 🛠️ Available Tools

### Basic Tools
```bash
@list_directory path=.                    # List files and directories
@read_file path=filename.txt             # Read file contents
@write_file path=file.txt content=Hello  # Write to file
@run_shell_command command=ls -la        # Execute shell command
```

### Advanced Tools
```bash
@read_all_files path=. exclude=node_modules,.git  # Read all files
@cd path=../                            # Change directory
@yolo_mode action=enable                # Enable YOLO mode
@code_analysis path=filename.js         # Analyze code
@web_search query=search term           # Web search
```

## 🌐 Web Dashboard

### Features
- **Real-time Statistics**: Session metrics and usage
- **Live History**: Conversation history with timestamps
- **Settings Management**: View and modify settings
- **Remote Control**: Execute commands from web interface
- **Beautiful UI**: Dark theme with responsive design

### Access
```bash
# Start web server
/webserver start

# Visit in browser
http://localhost:4000
```

## 🔒 Security Features

### OAuth Security
- **HTTPS Only**: All OAuth communication over HTTPS
- **Secure Token Storage**: Tokens encrypted in settings file
- **Token Refresh**: Automatic token refresh before expiration
- **Scope Limitation**: Minimal required permissions
- **Secure Logout**: Complete token cleanup

### YOLO Mode Safety
- **Clear Warnings**: Visual indicators when enabled
- **Confirmation System**: Confirm dangerous operations
- **Session Tracking**: Monitor YOLO mode usage
- **Automatic Logging**: Track dangerous actions

## 📊 Session Statistics

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
  Auth type: OAuth
  User: John Doe (john@example.com)
```

## 🛠️ Troubleshooting

### Common Issues

#### OAuth Issues
```bash
# Check if OAuth is configured
/settings

# Verify environment variables
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Clear OAuth tokens and retry
/logout
/login
```

#### Autocomplete Issues
```bash
# Reset autocomplete history
# Edit ~/.enhanced-cli/settings.json and clear commandHistory

# Check if Tab key is working
# Try different terminal emulator
```

#### Web Server Issues
```bash
# Check if port is in use
netstat -an | findstr :4000

# Change port
# Edit settings.json: "webServerPort": 4001
```

### Getting Help

1. **Check Documentation**: Read the comprehensive documentation files
2. **Use Help Command**: `/help` for available commands
3. **Check Settings**: `/settings` for current configuration
4. **View Statistics**: `/stats` for session information
5. **Reset Session**: `/reset` to start fresh

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/enhanced-cli-agents.git
cd enhanced-cli-agents

# Install dependencies
npm install

# Run in development mode
npm start

# Run tests
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini API**: For AI capabilities
- **Node.js Community**: For excellent tooling
- **Open Source Contributors**: For inspiration and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/enhanced-cli-agents/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/enhanced-cli-agents/discussions)
- **Documentation**: See the documentation files in this repository

## 🚀 Roadmap

- [ ] **Plugin System**: Extensible tool architecture
- [ ] **Multi-Account OAuth**: Support multiple Google accounts
- [ ] **Cloud Sync**: Sync settings across devices
- [ ] **Advanced Analytics**: Detailed usage analytics
- [ ] **Mobile App**: Companion mobile application
- [ ] **Enterprise Features**: SSO and team management

---

**Made with ❤️ by the Enhanced CLI Agents Team**

*Built for developers, by developers*
