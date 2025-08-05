# Gemini CLI - Global Installation

## ✅ Installation Complete!

The Gemini CLI is now installed globally and available from anywhere on your system.

## 🚀 Usage

### Basic Commands

```bash
# Start interactive CLI
gemini

# Run with specific model
gemini --model gemini-2.5-flash

# Run in debug mode
gemini --debug

# Run in YOLO mode (auto-accept all actions)
gemini --yolo

# Run with specific prompt
gemini --prompt "Help me with this code"
```

### Web Server Features

```bash
# Start the web interface
gemini
# Then type: /server start

# Or start directly with web server
gemini --debug
# Then navigate to: http://localhost:4000
```

### Configuration Management

Once the web server is running, you can:

1. **Open your browser** to `http://localhost:4000`
2. **Configure AI models** - Switch between Gemini, Claude, GPT, etc.
3. **Change providers** - Switch between Google, OpenAI, Anthropic, etc.
4. **Manage settings** - Debug mode, memory usage, etc.
5. **View logs** - Real-time log monitoring and export

### Available Models

- **Gemini**: gemini-2.5-pro, gemini-2.5-flash, gemini-1.5-pro, etc.
- **Claude**: claude-3-opus, claude-3-sonnet, claude-3-haiku
- **GPT**: gpt-4, gpt-4-turbo, gpt-3.5-turbo
- **Local**: llama-3.1-8b, mistral-7b, mixtral-8x7b

### Available Providers

- Google, OpenAI, Anthropic, Meta, Mistral, Perplexity, Cohere, Local

## 🔧 Troubleshooting

### If `gemini` command not found:

```bash
# Reinstall globally
cd packages/cli
npm install -g .

# Or install from root
npm install -g .
```

### If you get permission errors:

```bash
# On Windows (run as Administrator)
npm install -g . --force

# On Linux/Mac
sudo npm install -g .
```

## 📁 Project Structure

```
gemini-cli/
├── packages/cli/          # Main CLI package
├── packages/core/         # Core functionality
├── packages/vscode-ide-companion/  # VS Code extension
└── scripts/              # Build scripts
```

## 🆕 Recent Features

- ✅ **Fixed cd command** - Now works with path imports
- ✅ **Enhanced web server** - Full configuration management
- ✅ **Model swapping** - Switch AI models via web interface
- ✅ **Provider switching** - Change AI providers dynamically
- ✅ **Real-time updates** - Configuration changes apply immediately
- ✅ **Global installation** - Available system-wide

## 🎯 Quick Start

1. **Start CLI**: `gemini`
2. **Start web server**: Type `/server start`
3. **Open browser**: Navigate to `http://localhost:4000`
4. **Configure AI**: Use the web interface to swap models/providers
5. **Start coding**: Use `/cd` to navigate and start working!

## 📞 Support

- **Issues**: Report on GitHub
- **Documentation**: Check the `/docs` command in CLI
- **Web Interface**: Use the dashboard at `http://localhost:4000`

---

**Version**: 0.1.15  
**Node.js**: >=20 required  
**License**: Apache-2.0 
