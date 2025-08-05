# 🎉 NotABot v1.0.0 - Initial Release

## 📦 Release Information

- **Version**: 1.0.0
- **Release Date**: August 5, 2025
- **Repository**: https://github.com/involvex/notabot
- **Documentation**: https://involvex.github.io/notabot
- **License**: MIT

## 🚀 What's New

### 🎯 **Complete CLI Agent System**
NotABot is a comprehensive CLI agent with AI integration, OAuth authentication, persistent database storage, and advanced automation capabilities.

### 🧠 **AI Integration**
- **Gemini API Integration**: Powered by Google's latest AI model
- **OAuth Authentication**: Secure Google account integration
- **Context-Aware Conversations**: Intelligent conversation memory
- **Multi-Modal Capabilities**: Support for text and code analysis

### 🗄️ **Database System**
- **SQLite Database**: Persistent storage for all data
- **Conversation History**: Complete chat history with search
- **Session Tracking**: Detailed session statistics and analytics
- **Settings Persistence**: Configuration saved across sessions
- **User Profiles**: OAuth user data and preferences
- **File Indexing**: Modal database for file search
- **Auto Mode Logging**: Background task execution logs
- **Web Server Logs**: Access and performance monitoring

### 🔐 **Authentication & Security**
- **Google OAuth**: Secure authentication without API keys
- **Token Management**: Automatic refresh and secure storage
- **User Profiles**: Personalized settings and preferences
- **Session Security**: Encrypted session data

### 🌐 **Web Dashboard**
- **Real-Time Monitoring**: Live session statistics
- **Remote Control**: Web interface for CLI operations
- **Settings Management**: Dynamic configuration updates
- **Auto Mode Control**: Background automation management
- **Beautiful UI**: Modern, responsive design

### 🤖 **Automation Features**
- **Auto Mode**: Scheduled background tasks
- **Configurable Commands**: Custom automation scripts
- **Trigger System**: Event-based automation
- **Logging**: Complete execution history

### 🛠️ **Tool System**
- **File Operations**: Read, write, and analyze files
- **Shell Commands**: Safe command execution
- **Directory Navigation**: Change directories with tracking
- **Code Analysis**: AI-powered code review
- **YOLO Mode**: Advanced operations (use with caution)

## 📋 Installation

### Quick Install
```bash
npm install -g notabot
```

### From Source
```bash
git clone https://github.com/involvex/notabot.git
cd notabot
npm install
npm install -g .
```

## 🎮 Quick Start

```bash
# Start NotABot
notabot

# Login with Google OAuth
/login

# Start web dashboard
/webserver start

# Check database status
/db status
```

## 📚 Key Commands

### Basic Commands
```
/help          - Show all commands
/login         - Login with Google OAuth
/auth          - Set API key
/quit          - Exit NotABot
/clear         - Clear screen
/settings      - Show current settings
/stats         - Show session statistics
```

### Database Commands
```
/db status              - Database statistics
/db conversations [10]  - Recent conversations
/db search <query>      - Search history
/db cleanup [30]        - Clean old data
/db backup [path]       - Create backup
```

### Web Interface
```
/webserver start        - Start web dashboard
/webserver stop         - Stop web dashboard
/webserver status       - Check status
```

### Automation
```
/auto enable            - Enable auto mode
/auto disable           - Disable auto mode
/auto status            - Check status
/auto commands          - Set auto commands
/auto triggers          - Set auto triggers
```

### Tools
```
@list_directory path=.  - List files
@read_file path=file    - Read file
@write_file path=file   - Write file
@run_shell_command cmd  - Execute command
@code_analysis path=file - Analyze code
```

## 🏗️ Project Structure

```
notabot/
├── notabot.js              # Main CLI application
├── database.js             # SQLite database system
├── oauth-auth.js           # Google OAuth integration
├── autocomplete.js         # Command autocomplete
├── modal-db.js            # File indexing system
├── setup.js               # Installation script
├── docs/                  # Documentation
│   ├── setup/            # Installation guides
│   ├── oauth/            # Authentication docs
│   ├── database/         # Database documentation
│   └── features/         # Feature documentation
├── scripts/              # Utility scripts
└── package.json          # Project configuration
```

## 🔧 Configuration

### Environment Variables
```bash
# OAuth Authentication
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# API Key Authentication (alternative)
export GEMINI_API_KEY="your-api-key"
```

### Settings File
Settings are automatically created at: `~/.notabot/settings.json`

## 📊 Features Overview

### ✅ **Core Features**
- [x] **AI Integration** - Gemini API with OAuth
- [x] **Database System** - SQLite with persistent storage
- [x] **Web Dashboard** - Real-time monitoring
- [x] **Auto Mode** - Scheduled automation
- [x] **Tool Integration** - System operations
- [x] **Session Management** - Persistent sessions
- [x] **Search & History** - Conversation search
- [x] **Settings Management** - Persistent preferences

### ✅ **Advanced Features**
- [x] **OAuth Authentication** - Google account integration
- [x] **File Indexing** - Modal database system
- [x] **Autocomplete** - Command suggestions
- [x] **YOLO Mode** - Advanced operations
- [x] **Web Server** - HTTP dashboard
- [x] **Backup System** - Database backup/restore
- [x] **Cleanup Tools** - Data management
- [x] **Statistics** - Usage analytics

## 🎨 GitHub Pages Site

A comprehensive documentation site is available at:
**https://involvex.github.io/notabot**

### Site Features
- **Modern Landing Page**: Beautiful design with interactive features
- **Complete Documentation**: Step-by-step guides for all features
- **Responsive Design**: Works on all devices
- **Interactive Elements**: Smooth animations and transitions
- **Command Reference**: Tabbed interface with all commands
- **Installation Guide**: Multiple installation methods

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

## 🛠️ Development

### Prerequisites
- **Node.js**: Version 16 or higher
- **npm**: For package management
- **Git**: For version control

### Development Setup
```bash
# Clone repository
git clone https://github.com/involvex/notabot.git
cd notabot

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm start
```

### Testing
```bash
# Test database functionality
node scripts/test-database.js

# Test startup
node scripts/test-start.js

# Test OAuth
node scripts/debug-oauth.js
```

## 📖 Documentation

Comprehensive documentation is available:

- **[📚 Documentation Index](docs/README.md)** - Complete documentation
- **[🚀 Quick Start](docs/setup/QUICK_START.md)** - Get started in minutes
- **[🔐 OAuth Setup](docs/oauth/OAUTH_SETUP.md)** - Authentication guide
- **[🗄️ Database Features](docs/database/DATABASE_FEATURES.md)** - Database system
- **[⚡ Enhanced Features](docs/features/ENHANCED-FEATURES-README.md)** - Advanced capabilities

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
1. **Fork** the repository
2. **Clone** your fork
3. **Install** dependencies: `npm install`
4. **Run tests**: `npm test`
5. **Make changes** and test
6. **Submit** a pull request

## 🐛 Known Issues

- **Windows Path Issues**: Some path operations may need adjustment on Windows
- **OAuth Setup**: Requires manual Google Cloud Console configuration
- **Port Conflicts**: Web server may conflict with existing services on port 4000

## 🔮 Roadmap

### Upcoming Features
- [ ] **Plugin System**: Extensible tool architecture
- [ ] **Multi-Account OAuth**: Support multiple Google accounts
- [ ] **Cloud Sync**: Sync settings across devices
- [ ] **Advanced Analytics**: Detailed usage analytics
- [ ] **Mobile App**: Companion mobile application
- [ ] **Enterprise Features**: SSO and team management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini API**: For AI capabilities
- **Node.js Community**: For excellent tooling
- **Open Source Contributors**: For inspiration and libraries
- **Font Awesome**: For beautiful icons
- **GitHub Pages**: For hosting the documentation site

## 📞 Support

- **Documentation**: [📚 docs/](docs/)
- **GitHub Pages**: https://involvex.github.io/notabot
- **Issues**: [GitHub Issues](https://github.com/involvex/notabot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/involvex/notabot/discussions)

## 🎉 Download

### NPM Package
```bash
npm install -g notabot
```

### Source Code
```bash
git clone https://github.com/involvex/notabot.git
cd notabot
npm install
npm install -g .
```

### GitHub Release
Download the latest release from: https://github.com/involvex/notabot/releases

---

**🎉 Ready to get started?** Check out the [Quick Start Guide](docs/setup/QUICK_START.md)!

**Made with ❤️ by the NotABot Team** 