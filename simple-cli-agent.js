#!/usr/bin/env node

/**
 * Simple CLI Agent - Based on Gemini CLI
 * A simplified version that addresses the immediate quitting issue
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  name: 'SimpleCLI',
  version: '1.0.0',
  settingsFile: path.join(os.homedir(), '.simple-cli', 'settings.json'),
  defaultSettings: {
    theme: 'default',
    model: 'gemini-1.5-flash',
    authType: 'api-key',
    apiKey: process.env.GEMINI_API_KEY || '',
    showMemoryUsage: false,
    debugMode: false,
    maxSessionTurns: 50,
    tools: ['list_directory', 'read_file', 'write_file', 'run_shell_command']
  }
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Settings management
class SettingsManager {
  constructor() {
    this.settings = { ...CONFIG.defaultSettings };
    this.loadSettings();
  }

  loadSettings() {
    try {
      if (fs.existsSync(CONFIG.settingsFile)) {
        const settingsData = fs.readFileSync(CONFIG.settingsFile, 'utf8');
        this.settings = { ...this.settings, ...JSON.parse(settingsData) };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error.message);
    }
  }

  saveSettings() {
    try {
      const settingsDir = path.dirname(CONFIG.settingsFile);
      if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
      }
      fs.writeFileSync(CONFIG.settingsFile, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Failed to save settings:', error.message);
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }
}

// Tool registry
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerDefaultTools();
  }

  registerDefaultTools() {
    // List directory tool
    this.registerTool('list_directory', {
      name: 'list_directory',
      description: 'List files and directories in a given path',
      execute: async (args) => {
        try {
          const targetPath = args.path || '.';
          const items = fs.readdirSync(targetPath);
          return {
            success: true,
            content: `Directory listing for ${targetPath}:\n${items.join('\n')}`
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    });

    // Read file tool
    this.registerTool('read_file', {
      name: 'read_file',
      description: 'Read the contents of a file',
      execute: async (args) => {
        try {
          const content = fs.readFileSync(args.path, 'utf8');
          return {
            success: true,
            content: content
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    });

    // Write file tool
    this.registerTool('write_file', {
      name: 'write_file',
      description: 'Write content to a file',
      execute: async (args) => {
        try {
          fs.writeFileSync(args.path, args.content);
          return {
            success: true,
            content: `File ${args.path} written successfully`
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    });

    // Run shell command tool
    this.registerTool('run_shell_command', {
      name: 'run_shell_command',
      description: 'Execute a shell command',
      execute: async (args) => {
        try {
          const { exec } = await import('child_process');
          const util = await import('util');
          const execAsync = util.promisify(exec);
          
          const { stdout, stderr } = await execAsync(args.command);
          return {
            success: true,
            content: stdout || stderr || 'Command executed successfully'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    });
  }

  registerTool(name, tool) {
    this.tools.set(name, tool);
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getAllTools() {
    return Array.from(this.tools.values());
  }

  getToolNames() {
    return Array.from(this.tools.keys());
  }
}

// History management
class HistoryManager {
  constructor() {
    this.history = [];
    this.maxHistory = 100;
  }

  addEntry(type, content, timestamp = Date.now()) {
    this.history.push({
      id: this.history.length + 1,
      type,
      content,
      timestamp
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getHistory() {
    return [...this.history];
  }

  clear() {
    this.history = [];
  }
}

// Main CLI class
class SimpleCLIAgent {
  constructor() {
    this.settings = new SettingsManager();
    this.toolRegistry = new ToolRegistry();
    this.history = new HistoryManager();
    this.isRunning = false;
    this.rl = null;
  }

  async initialize() {
    console.log(`${colors.cyan}${colors.bright}Simple CLI Agent v${CONFIG.version}${colors.reset}`);
    console.log(`${colors.yellow}Type /help for available commands${colors.reset}\n`);
    
    // Check if API key is set
    if (!this.settings.get('apiKey')) {
      console.log(`${colors.yellow}Warning: No API key found. Set GEMINI_API_KEY environment variable or use /auth command.${colors.reset}\n`);
    }

    this.isRunning = true;
    this.startInteractiveMode();
  }

  startInteractiveMode() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${colors.green}${colors.bright}>${colors.reset} `
    });

    this.rl.on('line', (input) => {
      this.handleInput(input.trim());
    });

    this.rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\nUse /quit to exit properly');
    });
  }

  async handleInput(input) {
    if (!input) {
      this.rl.prompt();
      return;
    }

    // Handle commands
    if (input.startsWith('/')) {
      await this.handleCommand(input);
    } else {
      await this.handleUserMessage(input);
    }

    this.rl.prompt();
  }

  async handleCommand(command) {
    const [cmd, ...args] = command.slice(1).split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'help':
        this.showHelp();
        break;
      
      case 'quit':
      case 'exit':
        this.quit();
        break;
      
      case 'clear':
        this.clear();
        break;
      
      case 'tools':
        this.showTools();
        break;
      
      case 'history':
        this.showHistory();
        break;
      
      case 'settings':
        this.showSettings();
        break;
      
      case 'auth':
        this.handleAuth(args.join(' '));
        break;
      
      case 'debug':
        this.toggleDebug();
        break;
      
      default:
        console.log(`${colors.red}Unknown command: /${cmd}${colors.reset}`);
        console.log(`Type /help for available commands`);
    }
  }

  async handleUserMessage(message) {
    this.history.addEntry('user', message);
    
    if (this.settings.get('debugMode')) {
      console.log(`${colors.blue}[DEBUG] Processing user message: ${message}${colors.reset}`);
    }

    // Check if it's a tool call
    if (message.startsWith('@')) {
      await this.handleToolCall(message);
      return;
    }

    // For now, just echo back with some processing
    const response = await this.processMessage(message);
    this.history.addEntry('assistant', response);
    console.log(`${colors.cyan}${response}${colors.reset}`);
  }

  async handleToolCall(message) {
    const toolCall = message.slice(1); // Remove @
    const [toolName, ...args] = toolCall.split(' ');
    
    const tool = this.toolRegistry.getTool(toolName);
    if (!tool) {
      console.log(`${colors.red}Tool not found: ${toolName}${colors.reset}`);
      console.log(`Available tools: ${this.toolRegistry.getToolNames().join(', ')}`);
      return;
    }

    try {
      // Simple argument parsing
      const toolArgs = {};
      for (let i = 0; i < args.length; i += 2) {
        if (i + 1 < args.length) {
          toolArgs[args[i]] = args[i + 1];
        }
      }

      const result = await tool.execute(toolArgs);
      
      if (result.success) {
        console.log(`${colors.green}Tool ${toolName} executed successfully:${colors.reset}`);
        console.log(result.content);
        this.history.addEntry('tool', `${toolName}: ${result.content}`);
      } else {
        console.log(`${colors.red}Tool ${toolName} failed: ${result.error}${colors.reset}`);
        this.history.addEntry('error', `${toolName}: ${result.error}`);
      }
    } catch (error) {
      console.log(`${colors.red}Error executing tool ${toolName}: ${error.message}${colors.reset}`);
      this.history.addEntry('error', `${toolName}: ${error.message}`);
    }
  }

  async processMessage(message) {
    // Simple message processing - in a real implementation, this would call the Gemini API
    const responses = [
      "I understand your message. In a full implementation, this would be processed by the Gemini API.",
      "That's an interesting point. Let me think about that...",
      "I see what you're saying. Here's my response...",
      "Thanks for sharing that with me.",
      "I'm processing your request..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  showHelp() {
    console.log(`${colors.bright}Available Commands:${colors.reset}`);
    console.log(`  /help     - Show this help message`);
    console.log(`  /quit     - Exit the application`);
    console.log(`  /clear    - Clear the screen`);
    console.log(`  /tools    - Show available tools`);
    console.log(`  /history  - Show conversation history`);
    console.log(`  /settings - Show current settings`);
    console.log(`  /auth     - Set API key`);
    console.log(`  /debug    - Toggle debug mode`);
    console.log(``);
    console.log(`${colors.bright}Tool Usage:${colors.reset}`);
    console.log(`  @list_directory path=.`);
    console.log(`  @read_file path=filename.txt`);
    console.log(`  @write_file path=filename.txt content=Hello World`);
    console.log(`  @run_shell_command command=ls -la`);
  }

  showTools() {
    console.log(`${colors.bright}Available Tools:${colors.reset}`);
    this.toolRegistry.getAllTools().forEach(tool => {
      console.log(`  ${colors.cyan}${tool.name}${colors.reset} - ${tool.description}`);
    });
  }

  showHistory() {
    const history = this.history.getHistory();
    if (history.length === 0) {
      console.log(`${colors.yellow}No history yet${colors.reset}`);
      return;
    }

    console.log(`${colors.bright}Conversation History:${colors.reset}`);
    history.forEach(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const type = entry.type === 'user' ? colors.green : 
                   entry.type === 'assistant' ? colors.cyan : 
                   entry.type === 'tool' ? colors.magenta : colors.red;
      console.log(`${colors.gray}[${time}]${colors.reset} ${type}${entry.type}:${colors.reset} ${entry.content}`);
    });
  }

  showSettings() {
    console.log(`${colors.bright}Current Settings:${colors.reset}`);
    Object.entries(this.settings.settings).forEach(([key, value]) => {
      if (key === 'apiKey') {
        console.log(`  ${key}: ${value ? '***' : 'not set'}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
  }

  handleAuth(apiKey) {
    if (!apiKey) {
      console.log(`${colors.yellow}Usage: /auth <your-api-key>${colors.reset}`);
      return;
    }
    
    this.settings.set('apiKey', apiKey);
    console.log(`${colors.green}API key set successfully${colors.reset}`);
  }

  toggleDebug() {
    const currentDebug = this.settings.get('debugMode');
    this.settings.set('debugMode', !currentDebug);
    console.log(`${colors.green}Debug mode ${!currentDebug ? 'enabled' : 'disabled'}${colors.reset}`);
  }

  clear() {
    console.clear();
    console.log(`${colors.cyan}${colors.bright}Simple CLI Agent v${CONFIG.version}${colors.reset}`);
    console.log(`${colors.yellow}Type /help for available commands${colors.reset}\n`);
  }

  quit() {
    console.log(`${colors.yellow}Goodbye!${colors.reset}`);
    this.isRunning = false;
    if (this.rl) {
      this.rl.close();
    }
    process.exit(0);
  }
}

// Main execution
async function main() {
  try {
    const agent = new SimpleCLIAgent();
    await agent.initialize();
  } catch (error) {
    console.error(`${colors.red}Error starting CLI agent: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the application
main(); 
