# Notabot CLI

A powerful command-line interface built on top of the Gemini CLI, providing enhanced functionality and tools for developers.

## 🚀 Features

- **Global Installation**: Install as `notabot-full` for system-wide access
- **Enhanced Tools**: Extended toolset beyond the base Gemini CLI
- **Custom Commands**: Additional commands for file operations, git integration, and more
- **Theme Support**: Customizable themes and UI enhancements
- **Web Server Integration**: Built-in web server for remote access
- **Image Enhancement**: Advanced image processing capabilities

## 📦 Installation

### Global Installation

```bash
# Install the CLI globally
npm install -g .

# Use as notabot-full
notabot-full --help
```

### Development Installation

```bash
# Clone the repository
git clone <repository-url>
cd notabot-cli

# Install dependencies
npm install

# Build the project
npm run build

# Install globally for development
npm install -g .
```

## 🛠️ Usage

### Basic Usage

```bash
# Interactive mode
notabot-full

# Non-interactive mode with prompt
notabot-full --prompt "List all files in the current directory"

# Debug mode
notabot-full --debug

# YOLO mode (automatically accept all actions)
notabot-full --yolo
```

### Available Commands

- `notabot-full --help` - Show help information
- `notabot-full --version` - Show version information
- `notabot-full --debug` - Enable debug mode
- `notabot-full --yolo` - Enable YOLO mode (auto-accept actions)

## 🔧 Development

### Project Structure

```
notabot-cli/
├── packages/
│   ├── cli/          # Main CLI application
│   └── core/         # Core functionality and tools
├── docs/             # Documentation
├── scripts/          # Build and utility scripts
└── bundle/           # Bundled application
```

### Build Commands

```bash
# Build all packages
npm run build

# Build and bundle for distribution
npm run bundle

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Key Features

#### Enhanced Tools
- File operations (read, write, list, search)
- Git integration
- Web server capabilities
- Image processing
- Shell command execution

#### Custom Commands
- `cd` - Change directory with enhanced functionality
- `git` - Git operations and status
- `server` - Web server management
- `image` - Image processing and enhancement
- `yolo` - YOLO mode for automated actions

#### Theme Support
- Customizable UI themes
- Color scheme management
- Visual enhancements

## 🔧 Configuration

The CLI uses configuration files for customization:

- `.gemini/` - User configuration directory
- `gemini.md` - Project-specific configuration
- `notabot-config.json` - Custom configuration

## 🚀 Advanced Features

### Web Server Integration
```bash
# Start web server
notabot-full --server

# Access via web interface
# http://localhost:3000
```

### Image Enhancement
```bash
# Process images with AI enhancement
notabot-full --image-enhance path/to/image.jpg
```

### Git Integration
```bash
# Git operations with enhanced features
notabot-full --git-status
notabot-full --git-commit "message"
```

## 📚 Documentation

- [User Guide](docs/README.md)
- [API Documentation](docs/core/)
- [Tool Documentation](docs/tools/)
- [Examples](docs/examples/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development server
npm run start
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of the [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- Enhanced with additional tools and features
- Community-driven development

## 📞 Support

- [Issues](https://github.com/your-org/notabot-cli/issues)
- [Discussions](https://github.com/your-org/notabot-cli/discussions)
- [Documentation](docs/)

---

**Notabot CLI** - Enhanced command-line interface for developers 
