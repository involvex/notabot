# CLI Agents - Based on Gemini CLI

This project provides two simplified CLI agents built from the Gemini CLI codebase, designed to address the immediate quitting issues and provide stable, interactive command-line interfaces.

## Overview

The original Gemini CLI had issues with:
- Immediate quitting without user interaction
- Settings not being properly applied
- Complex React-based UI that could be unstable
- Overly complex tool integration

These CLI agents solve these problems by providing:
- **Stable Interactive Mode**: Agents stay interactive until explicitly told to quit
- **Proper Settings Management**: Settings are loaded and saved correctly
- **Simplified Architecture**: Uses basic readline interface instead of complex React components
- **Direct Tool Integration**: Tools are directly integrated without complex protocols

## Two Versions Available

### 1. Simple CLI Agent (`simple-cli-agent.js`)
- **Purpose**: Basic interactive CLI with tool support
- **Features**: 
  - Interactive command line interface
  - Basic tool system (file operations, shell commands)
  - Settings management
  - History tracking
  - Debug mode
- **Best for**: Quick tasks, learning, basic automation

### 2. Enhanced CLI Agent (`enhanced-cli-agent.js`)
- **Purpose**: Full-featured CLI with Gemini API integration
- **Features**:
  - All features from Simple CLI Agent
  - Gemini API integration for AI responses
  - Code analysis capabilities
  - Session statistics
  - Context management
  - Advanced tool system
- **Best for**: Development, code analysis, AI-assisted tasks

## Installation

### Quick Setup (Windows)
```powershell
# Run the setup script
.\setup-cli-agents.ps1
```

### Manual Setup
1. Copy the agent files to your desired directory
2. Make them executable (Linux/Mac) or create batch files (Windows)
3. Add to PATH if desired

### Global Installation
```bash
# Copy to a global directory
sudo cp simple-cli-agent.js /usr/local/bin/simple-cli
sudo cp enhanced-cli-agent.js /usr/local/bin/enhanced-cli
chmod +x /usr/local/bin/simple-cli
chmod +x /usr/local/bin/enhanced-cli
```

## Usage

### Starting the Agents

```bash
# Simple CLI Agent
simple-cli

# Enhanced CLI Agent
enhanced-cli
```

### Basic Commands

Both agents support these commands:
- `/help` - Show help message
- `/quit` or `/exit` - Exit the application
- `/clear` - Clear the screen
- `/tools` - Show available tools
- `/history` - Show conversation history
- `/settings` - Show current settings
- `/auth <api-key>` - Set API key (Enhanced only)
- `/debug` - Toggle debug mode

### Enhanced CLI Agent Additional Commands
- `/stats` - Show session statistics
- `/analyze <file>` - Analyze code file
- `/context` - Show current context
- `/reset` - Reset session

### Tool Usage

Tools are called using the `@` prefix:

```bash
# List directory contents
@list_directory path=.

# Read a file
@read_file path=filename.txt

# Write to a file
@write_file path=filename.txt content=Hello World

# Run a shell command
@run_shell_command command=ls -la

# Analyze code (Enhanced only)
@code_analysis path=filename.js
```

## Configuration

### Settings Files
- **Simple CLI**: `~/.simple-cli/settings.json`
- **Enhanced CLI**: `~/.enhanced-cli/settings.json`

### Environment Variables
- `GEMINI_API_KEY` - Your Gemini API key (optional, can be set via `/auth` command)

### Default Settings
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
  "temperature": 0.7
}
```

## Architecture

### Simple CLI Agent
```
SimpleCLIAgent
├── SettingsManager (persistent settings)
├── ToolRegistry (tool management)
└── HistoryManager (conversation history)
```

### Enhanced CLI Agent
```
EnhancedCLIAgent
├── EnhancedSettingsManager (advanced settings)
├── EnhancedToolRegistry (extended tools)
├── EnhancedHistoryManager (session stats)
└── GeminiAPI (AI integration)
```

## Tool System

### Available Tools

#### Basic Tools (Both Agents)
- `list_directory` - List files and directories
- `read_file` - Read file contents
- `write_file` - Write content to file
- `run_shell_command` - Execute shell commands

#### Enhanced Tools (Enhanced Agent Only)
- `code_analysis` - Analyze code quality and provide insights

### Adding Custom Tools

To add a custom tool to either agent:

```javascript
// In the ToolRegistry class
this.registerTool('my_tool', {
  name: 'my_tool',
  description: 'Description of what the tool does',
  execute: async (args) => {
    try {
      // Your tool logic here
      return {
        success: true,
        content: 'Tool executed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
});
```

## API Integration (Enhanced Agent)

The Enhanced CLI Agent integrates with the Gemini API for AI-powered responses.

### Setting Up API Access
1. Get a Gemini API key from Google AI Studio
2. Set it via environment variable: `export GEMINI_API_KEY=your_key`
3. Or set it in the agent: `/auth your_key`

### API Features
- **Context Management**: Maintains conversation context
- **Code Analysis**: AI-powered code review and suggestions
- **Smart Responses**: Context-aware AI responses
- **Error Handling**: Graceful API error handling

## Troubleshooting

### Common Issues

1. **Agent quits immediately**
   - This version is designed to prevent this issue
   - If it still happens, check for syntax errors in the agent file

2. **Settings not loading**
   - Check file permissions on settings directory
   - Verify settings file format (must be valid JSON)

3. **Tools not working**
   - Ensure you have proper file permissions
   - Check tool syntax: `@tool_name parameter=value`

4. **API errors (Enhanced Agent)**
   - Verify your API key is correct
   - Check internet connection
   - Ensure API key has proper permissions

### Debug Mode

Enable debug mode to see detailed processing information:

```bash
/debug
```

### Error Messages

- `Tool not found`: Check available tools with `/tools`
- `API Error`: Verify API key and internet connection
- `File not found`: Check file path and permissions

## Development

### Extending the Agents

1. **Add New Commands**: Extend the `handleCommand` method
2. **Add New Tools**: Extend the `ToolRegistry` class
3. **Modify Settings**: Add new settings to `CONFIG.defaultSettings`
4. **Custom Themes**: Implement color schemes in the `colors` object

### Testing

```bash
# Test basic functionality
node simple-cli-agent.js
# Type: /help, /tools, /quit

# Test enhanced features
node enhanced-cli-agent.js
# Type: /help, /auth YOUR_KEY, /stats
```

## Comparison with Original Gemini CLI

| Feature | Original Gemini CLI | Simple CLI Agent | Enhanced CLI Agent |
|---------|-------------------|------------------|-------------------|
| Interactive Mode | ❌ Quits immediately | ✅ Stable | ✅ Stable |
| Settings | ❌ Not applied | ✅ Persistent | ✅ Persistent |
| UI Framework | React (complex) | Readline (simple) | Readline (simple) |
| Tool Integration | MCP (complex) | Direct (simple) | Direct (simple) |
| AI Integration | ✅ Full | ❌ None | ✅ Full |
| Code Analysis | ✅ Available | ❌ None | ✅ Available |
| Session Stats | ✅ Available | ❌ None | ✅ Available |
| Error Handling | ❌ Crashes | ✅ Graceful | ✅ Graceful |

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Enable debug mode for detailed logs
3. Review the architecture documentation
4. Check the original Gemini CLI documentation for reference 
