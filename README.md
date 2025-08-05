# 🤖 NotABot - Full Automated CLI Agent

[![NotABot CI](https://github.com/yourusername/notabot/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/notabot/actions/workflows/ci.yml)

**NotABot** is a comprehensive CLI agent with AI integration, OAuth authentication, persistent database storage, and advanced automation capabilities.

## ✨ Features

### 🧠 **AI Integration**
- **Gemini API** integration for intelligent responses
- **OAuth Authentication** with Google accounts
- **Context-aware** conversations with memory
- **Multi-modal** capabilities

### 🗄️ **Database System**
- **SQLite database** for persistent storage
- **Conversation history** with search capabilities
- **Session tracking** and statistics
- **Settings persistence** across sessions
- **User profiles** and preferences

### 🔐 **Authentication**
- **Google OAuth** integration
- **Secure token storage**
- **Automatic authentication**
- **User profile management**

### 🤖 **Automation**
- **Auto mode** for scheduled tasks
- **Web dashboard** for remote control
- **Tool integration** for system operations
- **YOLO mode** for advanced operations

### 🌐 **Web Interface**
- **Real-time dashboard** at `http://localhost:4000`
- **Settings management** via web UI
- **Live monitoring** of agent activity
- **Remote control** capabilities

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/notabot.git
cd notabot

# Install dependencies
npm install

# Install globally
npm install -g .
```

### First Run

```bash
# Start NotABot
notabot

# Or use the alias
nb
```

### Authentication

```bash
# Login with Google OAuth
/login

# Or set API key
/auth YOUR_GEMINI_API_KEY
```

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[📚 Documentation Index](./docs/README.md)** - Complete documentation
- **[🚀 Quick Start](./docs/setup/QUICK_START.md)** - Get started in minutes
- **[🔐 OAuth Setup](./docs/oauth/OAUTH_SETUP.md)** - Authentication guide
- **[🗄️ Database Features](./docs/database/DATABASE_FEATURES.md)** - Database system
- **[⚡ Enhanced Features](./docs/features/ENHANCED-FEATURES-README.md)** - Advanced capabilities

## 🎯 Key Commands

### Basic Commands
```
/help          - Show all commands
/login         - Login with Google OAuth
/auth          - Set API key
/quit          - Exit NotABot
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
```

### Tools
```
@list_directory path=.  - List files
@read_file path=file    - Read file
@write_file path=file   - Write file
@run_shell_command cmd  - Execute command
```

## 🏗️ Project Structure

```
notabot/
├── docs/                    # 📚 Documentation
│   ├── setup/              # Installation guides
│   ├── oauth/              # Authentication docs
│   ├── database/           # Database documentation
│   ├── features/           # Feature documentation
│   └── api/                # API documentation
├── scripts/                # 🔧 Utility scripts
│   ├── setup-oauth.js      # OAuth setup
│   ├── test-database.js    # Database testing
│   └── set-oauth-env.ps1  # Environment setup
├── notabot.js              # 🚀 Main application
├── database.js             # 🗄️ Database system
├── oauth-auth.js           # 🔐 OAuth authentication
├── autocomplete.js         # ⌨️ Autocomplete system
├── modal-db.js            # 📁 File indexing
└── package.json           # ⚙️ Project configuration
```

## 🔧 Development

### Prerequisites
- **Node.js** 16+ 
- **npm** or **yarn**
- **Git**

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/notabot.git
cd notabot

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm run start
```

### Database Setup

```bash
# Test database functionality
node scripts/test-database.js

# Setup OAuth environment
.\scripts\set-oauth-env.ps1
```

## 🧪 Testing

```bash
# Test database
node scripts/test-database.js

# Test startup
node scripts/test-start.js

# Test OAuth
node scripts/debug-oauth.js
```

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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. **Fork** the repository
2. **Clone** your fork
3. **Install** dependencies: `npm install`
4. **Run tests**: `npm test`
5. **Make changes** and test
6. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: [📚 docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/notabot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/notabot/discussions)

## 🗺️ Roadmap

See our [ROADMAP.md](./ROADMAP.md) for upcoming features and improvements.

---

**🎉 Ready to get started?** Check out the [Quick Start Guide](./docs/setup/QUICK_START.md)!
