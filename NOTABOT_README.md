# NotABot - Full Automated CLI Agent

NotABot is an advanced CLI agent that combines AI integration, OAuth authentication, and full automation capabilities. It's designed to be a comprehensive tool for developers who want to automate their workflow and interact with AI through a powerful command-line interface.

## 🚀 Features

### Core Features
- **AI Integration**: Powered by Google's Gemini API
- **OAuth Authentication**: Secure Google OAuth integration
- **Web Dashboard**: Real-time monitoring and control interface
- **Auto Mode**: Fully automated command execution
- **Tool Registry**: Extensive set of built-in tools
- **Settings Management**: Web interface for configuration
- **Global Installation**: Install once, use anywhere

### Automation Features
- **Auto Mode**: Execute commands automatically based on triggers
- **Scheduled Tasks**: Run commands at specified intervals
- **Trigger System**: Respond to specific conditions or patterns
- **Background Processing**: Continuous monitoring and execution

### Web Interface
- **Real-time Dashboard**: Live monitoring of agent status
- **Settings Management**: Change configuration through web interface
- **History Viewer**: Browse conversation and tool execution history
- **Control Panel**: Start/stop services, toggle modes
- **Auto Mode Configuration**: Set up automated workflows

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g notabot
```

### Local Installation
```bash
git clone <repository>
cd notabot
npm install
npm run setup
```

## 🎯 Quick Start

### 1. Start NotABot
```bash
notabot
# or use the short alias
nb
```

### 2. Set up Authentication
```bash
# Option 1: API Key
/auth YOUR_GEMINI_API_KEY

# Option 2: OAuth (recommended)
/login
```

### 3. Start Web Dashboard
```bash
/webserver start
```
Then open http://localhost:4000 in your browser.

### 4. Enable Auto Mode
```bash
/auto enable
```

## 🎮 Commands

### Basic Commands
- `/help` - Show available commands
- `/quit` - Exit the application
- `/clear` - Clear the screen
- `/settings` - Show current settings
- `/stats` - Show session statistics

### Authentication
- `/auth <api-key>` - Set Gemini API key
- `/login` - Start OAuth authentication
- `/logout` - Clear OAuth tokens

### Web Interface
- `/webserver start` - Start web dashboard
- `/webserver stop` - Stop web dashboard
- `/webserver status` - Check web server status

### Auto Mode
- `/auto enable` - Enable auto mode
- `/auto disable` - Disable auto mode
- `/auto status` - Show auto mode status
- `/auto commands <cmd1> <cmd2>` - Set auto commands
- `/auto triggers <trigger1> <trigger2>` - Set auto triggers

### File Operations
- `/cd <directory>` - Change directory
- `/readall <directory>` - Read all files in directory
- `/index <directory>` - Index files for search
- `/search <query>` - Search indexed files and prompts

### Tools
- `@list_directory path=.` - List files in directory
- `@read_file path=filename.txt` - Read file contents
- `@write_file path=filename.txt content=Hello` - Write to file
- `@run_shell_command command=ls -la` - Execute shell command
- `@code_analysis path=filename.js` - Analyze code quality

## 🌐 Web Dashboard

The web dashboard provides a comprehensive interface for managing NotABot:

### Status Panel
- Real-time agent status
- Current directory
- Session statistics
- YOLO mode status
- Auto mode status

### Settings Management
- Model selection (Gemini 1.5 Flash/Pro)
- Token limits and temperature
- Web server configuration
- Debug mode toggle
- Auto mode configuration

### Auto Mode Configuration
- Enable/disable auto mode
- Set automated commands
- Configure triggers
- Monitor execution

### Controls
- Toggle YOLO mode
- Clear history
- Reset session
- Start/stop web server

## 🤖 Auto Mode

Auto mode allows NotABot to execute commands automatically:

### Configuration
```bash
# Enable auto mode
/auto enable

# Set commands to run automatically
/auto commands "ls -la" "git status" "npm install"

# Set triggers (patterns that activate auto mode)
/auto triggers "error" "warning" "failed"
```

### Web Interface Configuration
1. Open the web dashboard
2. Go to "Auto Mode Configuration"
3. Enter commands (one per line)
4. Enter triggers (one per line)
5. Click "Save Auto Mode"

### Triggers
- **Time-based**: Execute every 30 seconds
- **Pattern-based**: Respond to specific text patterns
- **File-based**: Monitor file changes
- **Error-based**: React to error messages

## ⚙️ Settings

### Environment Variables
```bash
GEMINI_API_KEY=your-api-key
GOOGLE_CLIENT_ID=your-oauth-client-id
GOOGLE_CLIENT_SECRET=your-oauth-client-secret
```

### Settings File
Location: `~/.notabot/settings.json`

```json
{
  "theme": "default",
  "model": "gemini-1.5-flash",
  "authType": "api-key",
  "apiKey": "",
  "debugMode": false,
  "maxTokens": 4096,
  "temperature": 0.7,
  "yoloMode": false,
  "webServerEnabled": false,
  "webServerPort": 4000,
  "autoMode": false,
  "autoCommands": [],
  "autoTriggers": [],
  "webInterfaceEnabled": true,
  "webInterfacePort": 4001
}
```

## 🛠️ Tools

### Built-in Tools
- **File System**: List, read, write files
- **Shell Commands**: Execute system commands
- **Code Analysis**: Analyze code quality
- **Directory Navigation**: Change directories
- **YOLO Mode**: Enable dangerous operations

### Tool Usage
```bash
# List directory contents
@list_directory path=./src

# Read file
@read_file path=package.json

# Write file
@write_file path=test.txt content=Hello World

# Execute command
@run_shell_command command=npm install

# Analyze code
@code_analysis path=src/main.js
```

## 🔧 Development

### Project Structure
```
notabot/
├── notabot.js              # Main application
├── simple-cli-agent.js     # Simple CLI version
├── oauth-auth.js          # OAuth authentication
├── autocomplete.js        # Command autocomplete
├── modal-db.js           # Database for prompts/files
├── setup.js              # Installation script
└── package.json          # Project configuration
```

### Local Development
```bash
# Clone repository
git clone <repository>
cd notabot

# Install dependencies
npm install

# Run setup
npm run setup

# Start development
npm start
```

## 🔐 Security

### OAuth Setup
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set redirect URI to `http://localhost:3000/auth/callback`
6. Set environment variables:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### API Key Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set environment variable:
   ```bash
   GEMINI_API_KEY=your-api-key
   ```

## 📊 Monitoring

### Session Statistics
- Total messages
- User/assistant messages
- Tool executions
- Session duration
- Current directory
- Mode status

### Web Dashboard Metrics
- Real-time status updates
- Live conversation history
- Tool execution logs
- Error tracking
- Performance metrics

## 🚨 Troubleshooting

### Common Issues

**NotABot not found**
```bash
# Reinstall globally
npm install -g notabot --force
```

**Authentication failed**
```bash
# Check API key
echo $GEMINI_API_KEY

# Or use OAuth
/login
```

**Web server won't start**
```bash
# Check port availability
netstat -an | grep 4000

# Try different port
/webserver start 4001
```

**Auto mode not working**
```bash
# Check auto mode status
/auto status

# Enable auto mode
/auto enable

# Set commands
/auto commands "ls -la"
```

## 📝 Examples

### Basic Workflow
```bash
# Start NotABot
notabot

# Authenticate
/auth YOUR_API_KEY

# Start web dashboard
/webserver start

# Enable auto mode
/auto enable

# Set up automated tasks
/auto commands "git status" "npm test" "npm run build"
```

### Development Workflow
```bash
# Index project files
/index .

# Search for specific code
/search "function main"

# Analyze code quality
@code_analysis path=src/main.js

# Run tests automatically
/auto commands "npm test"
```

### File Management
```bash
# List current directory
@list_directory path=.

# Read configuration
@read_file path=package.json

# Write new file
@write_file path=README.md content="# My Project"

# Execute build
@run_shell_command command=npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/notabot/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/notabot/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/notabot/discussions)

---

**NotABot** - The intelligent CLI agent that never sleeps! 🤖
