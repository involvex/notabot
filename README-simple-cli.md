# Simple CLI Agent

A simplified CLI agent based on the Gemini CLI codebase, designed to address the immediate quitting issues and provide a stable, interactive command-line interface.

## Features

- **Interactive Command Line Interface**: Stable, non-quitting interactive mode
- **Settings Management**: Persistent settings stored in `~/.simple-cli/settings.json`
- **Tool System**: Built-in tools for file operations and shell commands
- **History Management**: Conversation history with timestamps
- **Debug Mode**: Toggle debug output for troubleshooting
- **Color-coded Output**: Clear visual distinction between different message types

## Installation

1. Copy the files to your desired directory:
   ```bash
   cp simple-cli-agent.js /usr/local/bin/simple-cli
   chmod +x /usr/local/bin/simple-cli
   ```

2. Or install globally via npm:
   ```bash
   npm install -g ./simple-cli-package.json
   ```

## Usage

### Basic Usage

```bash
# Start the CLI agent
simple-cli

# Or use the short alias
scli
```

### Available Commands

- `/help` - Show help message
- `/quit` or `/exit` - Exit the application
- `/clear` - Clear the screen
- `/tools` - Show available tools
- `/history` - Show conversation history
- `/settings` - Show current settings
- `/auth <api-key>` - Set your Gemini API key
- `/debug` - Toggle debug mode

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
```

## Configuration

The agent stores settings in `~/.simple-cli/settings.json`. You can modify this file directly or use the `/settings` command to view current settings.

### Environment Variables

- `GEMINI_API_KEY` - Your Gemini API key (optional, can be set via `/auth` command)

## Architecture

The simple CLI agent is built with a modular architecture:

- **SettingsManager**: Handles persistent settings
- **ToolRegistry**: Manages available tools
- **HistoryManager**: Tracks conversation history
- **SimpleCLIAgent**: Main application class

## Differences from Original Gemini CLI

1. **No Immediate Quitting**: The agent stays interactive until explicitly told to quit
2. **Simplified UI**: Uses basic readline interface instead of complex React components
3. **Settings Persistence**: Settings are properly loaded and saved
4. **Tool Integration**: Tools are directly integrated without complex MCP protocols
5. **Error Handling**: Graceful error handling without crashes

## Troubleshooting

### Common Issues

1. **Agent quits immediately**: This version is designed to prevent this issue
2. **Settings not loading**: Check `~/.simple-cli/settings.json` permissions
3. **Tools not working**: Ensure you have proper file permissions

### Debug Mode

Enable debug mode to see detailed processing information:

```bash
/debug
```

## Development

To extend the agent:

1. **Add New Tools**: Extend the `ToolRegistry` class
2. **Add New Commands**: Extend the `handleCommand` method
3. **Modify Settings**: Add new settings to the `CONFIG.defaultSettings`

## License

MIT License - see LICENSE file for details. 
