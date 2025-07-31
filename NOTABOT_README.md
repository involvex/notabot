# Notabot CLI 🚀

An enhanced command-line interface built on top of Gemini CLI, providing powerful tools and an improved user experience.

## 🌟 Features

- **Global Installation**: Install as `notabot-full` for easy access
- **Enhanced Commands**: Additional commands for better productivity
- **Custom Themes**: Beautiful UI themes and customization options
- **Web Server Integration**: Built-in web server capabilities
- **Image Enhancement**: Advanced image processing features
- **Tool Integration**: Comprehensive tool ecosystem
- **Memory Management**: Smart memory compression and management
- **Git Integration**: Seamless Git workflow integration

## 📦 Installation

### Prerequisites

- Node.js 20+
- npm or yarn

### Global Installation

```bash
# Clone the repository
git clone https://github.com/involvex/notabot-cli.git
cd notabot-cli

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .

# Verify installation
notabot-full --help
```

### Alternative: Direct Installation

```bash
npm install -g https://github.com/involvex/notabot-cli.git
```

## 🚀 Quick Start

```bash
# Start the CLI
notabot-full

# Or with a prompt
notabot-full -p "Hello, how can you help me?"

# Get help
notabot-full --help
```

## 🛠️ Available Commands

### Core Commands

- `/help` - Show available commands
- `/about` - Display CLI information
- `/auth` - Authentication management
- `/clear` - Clear the conversation
- `/quit` - Exit the CLI

### Enhanced Commands

- `/cd` - Change directory with smart suggestions
- `/git` - Git workflow integration
- `/server` - Web server management
- `/image` - Image processing and enhancement
- `/allfiles` - List all files in current directory
- `/yolo` - Quick actions and shortcuts

### Theme and UI

- `/theme` - Change UI themes
- `/stats` - Display usage statistics
- `/memory` - Memory management
- `/tools` - Tool configuration

## ⚙️ Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# OAuth Configuration (optional)
OAUTH_CLIENT_ID=your_oauth_client_id_here
OAUTH_CLIENT_SECRET=your_oauth_client_secret_here

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Proxy Configuration
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=http://proxy.example.com:8080

# Optional: Debug Mode
DEBUG=1
```

### Custom Configuration

Create a `.gemini/config.yaml` file for advanced settings:

```yaml
# Example configuration
model: 'gemini-2.5-flash'
theme: 'default'
debug: false
```

## 🎨 Themes

Notabot CLI supports multiple themes:

- Default
- Dracula
- GitHub Dark/Light
- Atom One Dark
- And many more...

Change themes with: `/theme`

## 🔧 Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/involvex/notabot-cli.git
cd notabot-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run start
```

### Project Structure

```
notabot-cli/
├── packages/
│   ├── cli/          # CLI application
│   ├── core/         # Core functionality
│   └── vscode-ide-companion/  # VS Code integration
├── docs/             # Documentation
├── scripts/          # Build scripts
└── integration-tests/ # Integration tests
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📚 Documentation

- [CLI Commands](docs/cli/commands.md)
- [Configuration Guide](docs/cli/configuration.md)
- [Authentication](docs/cli/authentication.md)
- [Themes](docs/cli/themes.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🔗 Links

- **Repository**: https://github.com/involvex/notabot-cli
- **Issues**: https://github.com/involvex/notabot-cli/issues
- **Discussions**: https://github.com/involvex/notabot-cli/discussions

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [Google Gemini CLI](https://github.com/google-gemini/gemini-cli)
- Powered by Google's Gemini AI models
- Community contributors and supporters

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Report bugs on [GitHub Issues](https://github.com/involvex/notabot-cli/issues)
- **Discussions**: Join conversations on [GitHub Discussions](https://github.com/involvex/notabot-cli/discussions)

---

**Happy coding with Notabot CLI! 🚀**
