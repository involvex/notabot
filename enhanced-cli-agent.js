#!/usr/bin/env node

/**
 * Enhanced CLI Agent - Based on Gemini CLI
 * A more sophisticated version with Gemini API integration and advanced features
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import { OAuthAuthenticator } from './oauth-auth.js';
import { AutocompleteManager } from './autocomplete.js';
import { ModalDatabase } from './modal-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  name: 'EnhancedCLI',
  version: '1.0.0',
  settingsFile: path.join(os.homedir(), '.enhanced-cli', 'settings.json'),
  defaultSettings: {
    theme: 'default',
    model: 'gemini-1.5-flash',
    authType: 'api-key',
    apiKey: process.env.GEMINI_API_KEY || '',
    showMemoryUsage: false,
    debugMode: false,
    maxSessionTurns: 50,
    tools: ['list_directory', 'read_file', 'write_file', 'run_shell_command', 'web_search', 'code_analysis', 'read_all_files', 'cd', 'yolo_mode'],
    maxTokens: 4096,
    temperature: 0.7,
    yoloMode: false,
    currentDirectory: process.cwd(),
    webServerEnabled: false,
    webServerPort: 4000
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
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

// YOLO Mode - Allows dangerous operations
class YoloMode {
  constructor() {
    this.enabled = false;
    this.confirmedCommands = new Set();
  }

  enable() {
    this.enabled = true;
    console.log(`${colors.yellow}${colors.bright}⚠️  YOLO MODE ENABLED ⚠️${colors.reset}`);
    console.log(`${colors.red}Dangerous operations are now allowed!${colors.reset}`);
  }

  disable() {
    this.enabled = false;
    console.log(`${colors.green}YOLO mode disabled. Safe mode restored.${colors.reset}`);
  }

  isEnabled() {
    return this.enabled;
  }

  confirmCommand(command) {
    this.confirmedCommands.add(command);
  }

  isConfirmed(command) {
    return this.confirmedCommands.has(command);
  }
}

// Web Server with Live Info
class WebServer {
  constructor(agent) {
    this.agent = agent;
    this.server = null;
    this.io = null;
    this.port = CONFIG.defaultSettings.webServerPort;
    this.isRunning = false;
  }

  async start(port = this.port) {
    try {
      const express = await import('express');
      const { createServer } = await import('http');
      const { Server } = await import('socket.io');

      const app = express.default();
      
      // Basic routes
      app.get('/', (req, res) => {
        res.send(this.getHTML());
      });

      app.get('/api/status', (req, res) => {
        res.json(this.getStatus());
      });

      app.get('/api/history', (req, res) => {
        res.json(this.agent.history.getHistory());
      });

      app.get('/api/settings', (req, res) => {
        res.json(this.agent.settings.settings);
      });

      this.server = createServer(app);
      this.io = new Server(this.server);

      // WebSocket events
      this.io.on('connection', (socket) => {
        console.log(`${colors.blue}Web client connected${colors.reset}`);
        
        socket.emit('status', this.getStatus());
        
        socket.on('disconnect', () => {
          console.log(`${colors.blue}Web client disconnected${colors.reset}`);
        });
      });

      this.server.listen(port, () => {
        this.isRunning = true;
        this.port = port;
        console.log(`${colors.green}🌐 Web server started on http://localhost:${port}${colors.reset}`);
      });

    } catch (error) {
      console.error(`${colors.red}Failed to start web server: ${error.message}${colors.reset}`);
    }
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.isRunning = false;
      console.log(`${colors.yellow}Web server stopped${colors.reset}`);
    }
  }

  getStatus() {
    const stats = this.agent.history.getSessionStats();
    return {
      isRunning: this.isRunning,
      port: this.port,
      agentName: CONFIG.name,
      version: CONFIG.version,
      currentDirectory: this.agent.currentDirectory,
      yoloMode: this.agent.yoloMode.isEnabled(),
      sessionStats: stats,
      settings: this.agent.settings.settings
    };
  }

  getHTML() {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced CLI Agent - Live Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1e1e1e; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2d2d2d; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { background: #2d2d2d; padding: 20px; border-radius: 8px; }
        .status { background: #3d3d3d; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .yolo { background: #ff4444; color: white; padding: 10px; border-radius: 5px; }
        .history { max-height: 400px; overflow-y: auto; }
        .history-item { padding: 5px; border-bottom: 1px solid #444; }
        .user { color: #4CAF50; }
        .assistant { color: #2196F3; }
        .tool { color: #FF9800; }
        .error { color: #f44336; }
    </style>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Enhanced CLI Agent Dashboard</h1>
            <p>Live monitoring and control panel</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>📊 Status</h2>
                <div id="status"></div>
            </div>
            
            <div class="card">
                <h2>⚙️ Settings</h2>
                <div id="settings"></div>
            </div>
            
            <div class="card">
                <h2>📝 Recent History</h2>
                <div id="history" class="history"></div>
            </div>
            
            <div class="card">
                <h2>🎮 Controls</h2>
                <button onclick="toggleYolo()">Toggle YOLO Mode</button>
                <button onclick="clearHistory()">Clear History</button>
                <button onclick="resetSession()">Reset Session</button>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        
        socket.on('status', (data) => {
            updateStatus(data);
        });
        
        function updateStatus(data) {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = \`
                <div class="status">
                    <strong>Agent:</strong> \${data.agentName} v\${data.version}<br>
                    <strong>Status:</strong> \${data.isRunning ? '🟢 Running' : '🔴 Stopped'}<br>
                    <strong>Port:</strong> \${data.port}<br>
                    <strong>Directory:</strong> \${data.currentDirectory}<br>
                    <strong>Messages:</strong> \${data.sessionStats.totalMessages}<br>
                    <strong>Duration:</strong> \${data.sessionStats.sessionDuration}s
                </div>
                \${data.yoloMode ? '<div class="yolo">⚠️ YOLO MODE ENABLED ⚠️</div>' : ''}
            \`;
            
            updateSettings(data.settings);
        }
        
        function updateSettings(settings) {
            const settingsDiv = document.getElementById('settings');
            settingsDiv.innerHTML = Object.entries(settings)
                .map(([key, value]) => \`<div><strong>\${key}:</strong> \${value}</div>\`)
                .join('');
        }
        
        function toggleYolo() {
            fetch('/api/toggle-yolo', { method: 'POST' });
        }
        
        function clearHistory() {
            fetch('/api/clear-history', { method: 'POST' });
        }
        
        function resetSession() {
            fetch('/api/reset-session', { method: 'POST' });
        }
        
        // Load initial data
        fetch('/api/status').then(r => r.json()).then(updateStatus);
        fetch('/api/history').then(r => r.json()).then(data => {
            const historyDiv = document.getElementById('history');
            historyDiv.innerHTML = data.map(item => \`
                <div class="history-item \${item.type}">
                    <strong>\${item.type}:</strong> \${item.content.substring(0, 100)}\${item.content.length > 100 ? '...' : ''}
                </div>
            \`).join('');
        });
    </script>
</body>
</html>
    `;
  }
}

// Gemini API integration
class GeminiAPI {
  constructor(apiKey, authType = 'api-key') {
    this.apiKey = apiKey;
    this.authType = authType;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = CONFIG.defaultSettings.model;
  }

  async generateResponse(prompt, context = '') {
    if (!this.apiKey) {
      throw new Error('API key not set. Use /auth command to set your API key.');
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add OAuth authorization header if using OAuth
      if (this.authType === 'oauth') {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const url = this.authType === 'oauth' 
        ? `${this.baseUrl}/${this.model}:generateContent`
        : `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${context}\n\nUser: ${prompt}\n\nAssistant:`
            }]
          }],
          generationConfig: {
            temperature: CONFIG.defaultSettings.temperature,
            maxOutputTokens: CONFIG.defaultSettings.maxTokens,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
    } catch (error) {
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  async analyzeCode(code, language = 'javascript') {
    const prompt = `Analyze this ${language} code and provide insights about:
1. Code quality and best practices
2. Potential issues or bugs
3. Performance considerations
4. Security concerns
5. Suggestions for improvement

Code:
\`\`\`${language}
${code}
\`\`\``;

    return await this.generateResponse(prompt);
  }
}

// Enhanced Settings Manager
class EnhancedSettingsManager {
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

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }
}

// Enhanced Tool Registry with advanced tools
class EnhancedToolRegistry {
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
          const stats = items.map(item => {
            const itemPath = path.join(targetPath, item);
            const stat = fs.statSync(itemPath);
            return {
              name: item,
              type: stat.isDirectory() ? 'directory' : 'file',
              size: stat.size,
              modified: stat.mtime
            };
          });
          
          const formattedItems = stats.map(item => 
            `${item.type === 'directory' ? '📁' : '📄'} ${item.name} (${item.size} bytes)`
          );
          
          return {
            success: true,
            content: `Directory listing for ${targetPath}:\n${formattedItems.join('\n')}`
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
          const stats = fs.statSync(args.path);
          return {
            success: true,
            content: `File: ${args.path}\nSize: ${stats.size} bytes\nModified: ${stats.mtime}\n\nContent:\n${content}`
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
            content: `File ${args.path} written successfully (${args.content.length} characters)`
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

    // Read all files tool
    this.registerTool('read_all_files', {
      name: 'read_all_files',
      description: 'Read all files in a directory recursively',
      execute: async (args) => {
        try {
          const targetPath = args.path || '.';
          const excludePatterns = args.exclude ? args.exclude.split(',') : ['node_modules', '.git', '.vscode'];
          
          const files = this.getAllFiles(targetPath, excludePatterns);
          const fileContents = [];
          
          for (const file of files) {
            try {
              const content = fs.readFileSync(file, 'utf8');
              fileContents.push(`=== ${file} ===\n${content}\n`);
            } catch (error) {
              fileContents.push(`=== ${file} ===\n[Error reading file: ${error.message}]\n`);
            }
          }
          
          return {
            success: true,
            content: `Read ${files.length} files from ${targetPath}:\n\n${fileContents.join('\n')}`
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    });

    // CD command tool
    this.registerTool('cd', {
      name: 'cd',
      description: 'Change directory',
      execute: async (args) => {
        try {
          const targetPath = args.path || '.';
          const absolutePath = path.resolve(targetPath);
          
          if (!fs.existsSync(absolutePath)) {
            return {
              success: false,
              error: `Directory does not exist: ${absolutePath}`
            };
          }
          
          const stats = fs.statSync(absolutePath);
          if (!stats.isDirectory()) {
            return {
              success: false,
              error: `Path is not a directory: ${absolutePath}`
            };
          }
          
          // Update current directory
          process.chdir(absolutePath);
          
          return {
            success: true,
            content: `Changed directory to: ${absolutePath}`
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    });

    // YOLO mode tool
    this.registerTool('yolo_mode', {
      name: 'yolo_mode',
      description: 'Enable YOLO mode for dangerous operations',
      execute: async (args) => {
        try {
          const action = args.action || 'toggle';
          
          if (action === 'enable') {
            return {
              success: true,
              content: 'YOLO mode enabled. Dangerous operations are now allowed!'
            };
          } else if (action === 'disable') {
            return {
              success: true,
              content: 'YOLO mode disabled. Safe mode restored.'
            };
          } else {
            return {
              success: true,
              content: 'YOLO mode toggled.'
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    });

    // Code analysis tool
    this.registerTool('code_analysis', {
      name: 'code_analysis',
      description: 'Analyze code quality and provide insights',
      execute: async (args) => {
        try {
          const filePath = args.path;
          const content = fs.readFileSync(filePath, 'utf8');
          const extension = path.extname(filePath).slice(1);
          
          // Simple code analysis
          const lines = content.split('\n');
          const analysis = {
            totalLines: lines.length,
            emptyLines: lines.filter(line => line.trim() === '').length,
            commentLines: lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*')).length,
            hasErrors: content.includes('error') || content.includes('Error'),
            hasWarnings: content.includes('warning') || content.includes('Warning'),
            complexity: this.calculateComplexity(content)
          };
          
          return {
            success: true,
            content: `Code Analysis for ${filePath}:\n` +
                    `- Total lines: ${analysis.totalLines}\n` +
                    `- Empty lines: ${analysis.emptyLines}\n` +
                    `- Comment lines: ${analysis.commentLines}\n` +
                    `- Contains errors: ${analysis.hasErrors ? 'Yes' : 'No'}\n` +
                    `- Contains warnings: ${analysis.hasWarnings ? 'Yes' : 'No'}\n` +
                    `- Complexity score: ${analysis.complexity}`
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

  getAllFiles(dir, excludePatterns = []) {
    const files = [];
    
    function walk(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        // Check if item should be excluded
        const shouldExclude = excludePatterns.some(pattern => 
          item.includes(pattern) || fullPath.includes(pattern)
        );
        
        if (shouldExclude) continue;
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }
    
    walk(dir);
    return files;
  }

  calculateComplexity(code) {
    // Simple complexity calculation
    const complexityFactors = [
      code.split('if').length - 1,
      code.split('for').length - 1,
      code.split('while').length - 1,
      code.split('switch').length - 1,
      code.split('catch').length - 1
    ];
    return complexityFactors.reduce((sum, factor) => sum + factor, 0);
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

// Enhanced History Manager
class EnhancedHistoryManager {
  constructor() {
    this.history = [];
    this.maxHistory = 100;
    this.sessionStart = Date.now();
  }

  addEntry(type, content, timestamp = Date.now()) {
    this.history.push({
      id: this.history.length + 1,
      type,
      content,
      timestamp,
      sessionTime: timestamp - this.sessionStart
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getHistory() {
    return [...this.history];
  }

  getSessionStats() {
    const userMessages = this.history.filter(h => h.type === 'user').length;
    const assistantMessages = this.history.filter(h => h.type === 'assistant').length;
    const toolCalls = this.history.filter(h => h.type === 'tool').length;
    const sessionDuration = Date.now() - this.sessionStart;
    
    return {
      userMessages,
      assistantMessages,
      toolCalls,
      sessionDuration: Math.round(sessionDuration / 1000),
      totalMessages: this.history.length
    };
  }

  clear() {
    this.history = [];
    this.sessionStart = Date.now();
  }
}

// Main Enhanced CLI class
class EnhancedCLIAgent {
  constructor() {
    this.settings = new EnhancedSettingsManager();
    this.toolRegistry = new EnhancedToolRegistry();
    this.history = new EnhancedHistoryManager();
    this.geminiAPI = new GeminiAPI(this.settings.get('apiKey'));
    this.yoloMode = new YoloMode();
    this.webServer = new WebServer(this);
    this.oauthAuth = new OAuthAuthenticator();
    this.autocomplete = new AutocompleteManager();
    this.modalDb = new ModalDatabase();
    this.isRunning = false;
    this.rl = null;
    this.context = '';
    this.currentDirectory = process.cwd();
    this.currentInput = '';
    this.suggestionIndex = 0;
    this.suggestions = [];
  }

  async initialize() {
    console.log(`${colors.cyan}${colors.bright}Enhanced CLI Agent v${CONFIG.version}${colors.reset}`);
    console.log(`${colors.yellow}Type /help for available commands${colors.reset}\n`);
    
    // Check if API key is set
    if (!this.settings.get('apiKey')) {
      console.log(`${colors.yellow}Warning: No API key found. Set GEMINI_API_KEY environment variable or use /auth command.${colors.reset}\n`);
    } else {
      this.geminiAPI = new GeminiAPI(this.settings.get('apiKey'));
    }

    // Start web server if enabled
    if (this.settings.get('webServerEnabled')) {
      await this.webServer.start(this.settings.get('webServerPort'));
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

    // Enable autocomplete
    this.setupAutocomplete();
  }

  setupAutocomplete() {
    // Handle keypress events for autocomplete
    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'tab') {
        this.handleTabCompletion();
      } else if (key.name === 'up' || key.name === 'down') {
        this.handleArrowKeys(key.name);
      }
    });
  }

  handleTabCompletion() {
    const currentInput = this.rl.line;
    const suggestions = this.autocomplete.getSuggestions(currentInput);
    
    if (suggestions.length > 0) {
      if (this.suggestionIndex >= suggestions.length) {
        this.suggestionIndex = 0;
      }
      
      const suggestion = suggestions[this.suggestionIndex];
      this.rl.write('\r' + ' '.repeat(currentInput.length) + '\r');
      this.rl.write(suggestion);
      this.rl.write(' ');
      
      this.suggestionIndex++;
    }
  }

  handleArrowKeys(direction) {
    const currentInput = this.rl.line;
    const suggestions = this.autocomplete.getSuggestions(currentInput);
    
    if (suggestions.length > 0) {
      if (direction === 'up') {
        this.suggestionIndex = Math.max(0, this.suggestionIndex - 1);
      } else if (direction === 'down') {
        this.suggestionIndex = Math.min(suggestions.length - 1, this.suggestionIndex + 1);
      }
      
      const suggestion = suggestions[this.suggestionIndex];
      this.rl.write('\r' + ' '.repeat(currentInput.length) + '\r');
      this.rl.write(suggestion);
    }
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
      
      case 'stats':
        this.showStats();
        break;
      
      case 'analyze':
        this.handleCodeAnalysis(args.join(' '));
        break;
      
      case 'context':
        this.showContext();
        break;
      
      case 'reset':
        this.resetSession();
        break;
      
      case 'yolo':
        this.toggleYoloMode();
        break;
      
      case 'cd':
        this.handleCd(args.join(' '));
        break;
      
      case 'webserver':
        this.handleWebServer(args);
        break;
      
      case 'readall':
        this.handleReadAllFiles(args.join(' '));
        break;
      
      case 'login':
        this.handleGoogleLogin();
        break;
      
      case 'logout':
        this.handleLogout();
        break;
      
      case 'index':
        this.handleIndex(args.join(' '));
        break;
      
      case 'search':
        this.handleSearch(args.join(' '));
        break;
      
      case 'history':
        this.handleHistory();
        break;
      
      case 'stats':
        this.handleStats();
        break;
      
      case 'cleanup':
        this.handleCleanup();
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

    // Generate response using Gemini API
    try {
      const response = await this.geminiAPI.generateResponse(message, this.context);
      this.history.addEntry('assistant', response);
      console.log(`${colors.cyan}${response}${colors.reset}`);
      
      // Store in modal database
      this.modalDb.storePrompt(message, response, {
        currentDirectory: this.currentDirectory,
        yoloMode: this.yoloMode.isEnabled(),
        webServerRunning: this.webServer.isRunning()
      });
      
      // Update context with this exchange
      this.context += `\nUser: ${message}\nAssistant: ${response}`;
    } catch (error) {
      console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
      this.history.addEntry('error', error.message);
    }
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

  async handleCodeAnalysis(filePath) {
    if (!filePath) {
      console.log(`${colors.yellow}Usage: /analyze <file-path>${colors.reset}`);
      return;
    }

    try {
      const analysis = await this.geminiAPI.analyzeCode(
        fs.readFileSync(filePath, 'utf8'),
        path.extname(filePath).slice(1)
      );
      console.log(`${colors.magenta}Code Analysis:${colors.reset}`);
      console.log(analysis);
      this.history.addEntry('analysis', `Code analysis for ${filePath}: ${analysis}`);
    } catch (error) {
      console.log(`${colors.red}Error analyzing code: ${error.message}${colors.reset}`);
    }
  }

  toggleYoloMode() {
    if (this.yoloMode.isEnabled()) {
      this.yoloMode.disable();
    } else {
      this.yoloMode.enable();
    }
  }

  async handleCd(path) {
    if (!path) {
      console.log(`${colors.yellow}Usage: /cd <directory>${colors.reset}`);
      return;
    }

    try {
      const absolutePath = path.resolve(path);
      if (!fs.existsSync(absolutePath)) {
        console.log(`${colors.red}Directory does not exist: ${absolutePath}${colors.reset}`);
        return;
      }

      const stats = fs.statSync(absolutePath);
      if (!stats.isDirectory()) {
        console.log(`${colors.red}Path is not a directory: ${absolutePath}${colors.reset}`);
        return;
      }

      process.chdir(absolutePath);
      this.currentDirectory = absolutePath;
      console.log(`${colors.green}Changed directory to: ${absolutePath}${colors.reset}`);
    } catch (error) {
      console.log(`${colors.red}Error changing directory: ${error.message}${colors.reset}`);
    }
  }

  async handleWebServer(args) {
    const action = args[0] || 'status';
    
    switch (action) {
      case 'start':
        await this.webServer.start();
        this.settings.set('webServerEnabled', true);
        break;
      case 'stop':
        this.webServer.stop();
        this.settings.set('webServerEnabled', false);
        break;
      case 'status':
        console.log(`${colors.blue}Web server status: ${this.webServer.isRunning ? 'Running' : 'Stopped'}${colors.reset}`);
        if (this.webServer.isRunning) {
          console.log(`${colors.blue}URL: http://localhost:${this.webServer.port}${colors.reset}`);
        }
        break;
      default:
        console.log(`${colors.yellow}Usage: /webserver [start|stop|status]${colors.reset}`);
    }
  }

  async handleReadAllFiles(path) {
    if (!path) {
      console.log(`${colors.yellow}Usage: /readall <directory>${colors.reset}`);
      return;
    }

    try {
      const files = this.toolRegistry.getAllFiles(path);
      console.log(`${colors.blue}Found ${files.length} files in ${path}${colors.reset}`);
      
      for (const file of files.slice(0, 10)) { // Show first 10 files
        try {
          const content = fs.readFileSync(file, 'utf8');
          console.log(`${colors.cyan}=== ${file} ===${colors.reset}`);
          console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
          console.log('');
        } catch (error) {
          console.log(`${colors.red}Error reading ${file}: ${error.message}${colors.reset}`);
        }
      }
      
      if (files.length > 10) {
        console.log(`${colors.yellow}... and ${files.length - 10} more files${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}Error reading files: ${error.message}${colors.reset}`);
    }
  }

  async handleGoogleLogin() {
    try {
      console.log(`${colors.blue}Starting Google OAuth authentication...${colors.reset}`);
      console.log(`${colors.yellow}Opening browser for authentication...${colors.reset}`);
      
      const authData = await this.oauthAuth.authenticate();
      
      // Store OAuth tokens securely
      this.settings.set('oauthAccessToken', authData.access_token);
      this.settings.set('oauthRefreshToken', authData.refresh_token);
      this.settings.set('oauthUser', JSON.stringify(authData.user));
      this.settings.set('oauthExpiresAt', authData.expires_at);
      this.settings.set('authType', 'oauth');
      
      console.log(`${colors.green}✅ Authentication successful!${colors.reset}`);
      console.log(`${colors.cyan}Welcome, ${authData.user.name}!${colors.reset}`);
      console.log(`${colors.gray}Email: ${authData.user.email}${colors.reset}`);
      
      // Update Gemini API with OAuth token
      this.geminiAPI = new GeminiAPI(authData.access_token, 'oauth');
      
    } catch (error) {
      console.log(`${colors.red}❌ Authentication failed: ${error.message}${colors.reset}`);
    }
  }

  async handleLogout() {
    try {
      // Clear OAuth tokens
      this.settings.set('oauthAccessToken', '');
      this.settings.set('oauthRefreshToken', '');
      this.settings.set('oauthUser', '');
      this.settings.set('oauthExpiresAt', '');
      this.settings.set('authType', 'api-key');
      
      console.log(`${colors.green}✅ Logged out successfully${colors.reset}`);
      
      // Reset to API key authentication
      this.geminiAPI = new GeminiAPI(this.settings.get('apiKey'));
      
    } catch (error) {
      console.log(`${colors.red}❌ Logout failed: ${error.message}${colors.reset}`);
    }
  }

  async handleIndex(path) {
    try {
      if (!path) {
        path = this.currentDirectory;
      }
      
      console.log(`${colors.blue}📁 Indexing files in: ${path}${colors.reset}`);
      
      const excludePatterns = ['node_modules', '.git', '.vscode', 'dist', 'build', '.env'];
      const indexedFiles = await this.modalDb.indexDirectory(path, excludePatterns);
      
      console.log(`${colors.green}✅ Indexed ${indexedFiles.length} files${colors.reset}`);
      
    } catch (error) {
      console.log(`${colors.red}❌ Indexing failed: ${error.message}${colors.reset}`);
    }
  }

  async handleSearch(query) {
    try {
      if (!query) {
        console.log(`${colors.yellow}Usage: /search <query>${colors.reset}`);
        return;
      }
      
      console.log(`${colors.blue}🔍 Searching for: ${query}${colors.reset}`);
      
      // Search files
      const fileResults = this.modalDb.searchFiles(query, 5);
      if (fileResults.length > 0) {
        console.log(`${colors.cyan}📁 Files:${colors.reset}`);
        fileResults.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name} (${file.language}) - ${file.path}`);
        });
      }
      
      // Search prompts
      const promptResults = this.modalDb.searchPrompts(query, 3);
      if (promptResults.length > 0) {
        console.log(`${colors.cyan}💬 Similar prompts:${colors.reset}`);
        promptResults.forEach((prompt, index) => {
          console.log(`  ${index + 1}. ${prompt.prompt.substring(0, 100)}...`);
        });
      }
      
      if (fileResults.length === 0 && promptResults.length === 0) {
        console.log(`${colors.yellow}No results found for: ${query}${colors.reset}`);
      }
      
    } catch (error) {
      console.log(`${colors.red}❌ Search failed: ${error.message}${colors.reset}`);
    }
  }

  async handleHistory() {
    try {
      console.log(`${colors.blue}📜 Recent History:${colors.reset}`);
      
      const history = this.modalDb.getRecentHistory(10);
      if (history.length === 0) {
        console.log(`${colors.yellow}No history found${colors.reset}`);
        return;
      }
      
      history.forEach((item, index) => {
        const date = new Date(item.timestamp).toLocaleString();
        if (item.type === 'prompt') {
          console.log(`${colors.cyan}${index + 1}. [${date}] ${item.prompt}${colors.reset}`);
        } else if (item.type === 'session') {
          console.log(`${colors.magenta}${index + 1}. [${date}] Session: ${item.data?.command || 'Unknown'}${colors.reset}`);
        }
      });
      
    } catch (error) {
      console.log(`${colors.red}❌ History failed: ${error.message}${colors.reset}`);
    }
  }

  async handleStats() {
    try {
      console.log(`${colors.blue}📊 Modal Database Statistics:${colors.reset}`);
      
      const stats = this.modalDb.getStats();
      console.log(`  📁 Indexed files: ${stats.indexedFiles}`);
      console.log(`  💬 Total prompts: ${stats.totalPrompts}`);
      console.log(`  📜 Recent prompts: ${stats.recentPrompts}`);
      console.log(`  💾 Database size: ${(stats.databaseSize / 1024).toFixed(2)} KB`);
      console.log(`  🕒 Last used: ${stats.lastUsed ? new Date(stats.lastUsed).toLocaleString() : 'Never'}`);
      
    } catch (error) {
      console.log(`${colors.red}❌ Stats failed: ${error.message}${colors.reset}`);
    }
  }

  async handleCleanup() {
    try {
      console.log(`${colors.blue}🧹 Cleaning up old data...${colors.reset}`);
      
      this.modalDb.cleanup(30); // Keep last 30 days
      
      console.log(`${colors.green}✅ Cleanup completed${colors.reset}`);
      
    } catch (error) {
      console.log(`${colors.red}❌ Cleanup failed: ${error.message}${colors.reset}`);
    }
  }

  showHelp() {
    console.log(`${colors.bright}Available Commands:${colors.reset}`);
    console.log(`  /help       - Show this help message`);
    console.log(`  /quit       - Exit the application`);
    console.log(`  /clear      - Clear the screen`);
    console.log(`  /tools      - Show available tools`);
    console.log(`  /history    - Show conversation history`);
    console.log(`  /settings   - Show current settings`);
    console.log(`  /auth       - Set API key`);
    console.log(`  /debug      - Toggle debug mode`);
    console.log(`  /stats      - Show session statistics`);
    console.log(`  /analyze    - Analyze code file`);
    console.log(`  /context    - Show current context`);
    console.log(`  /reset      - Reset session`);
    console.log(`  /yolo       - Toggle YOLO mode`);
    console.log(`  /cd         - Change directory`);
    console.log(`  /webserver  - Control web server`);
    console.log(`  /readall    - Read all files in directory`);
    console.log(`  /login      - Login with Google OAuth`);
    console.log(`  /logout     - Logout from OAuth`);
    console.log(`  /index      - Index files in current directory`);
    console.log(`  /search     - Search indexed files and prompts`);
    console.log(`  /history    - Show recent history`);
    console.log(`  /stats      - Show modal database statistics`);
    console.log(`  /cleanup    - Clean up old data`);
    console.log(``);
    console.log(`${colors.bright}Tool Usage:${colors.reset}`);
    console.log(`  @list_directory path=.`);
    console.log(`  @read_file path=filename.txt`);
    console.log(`  @write_file path=filename.txt content=Hello World`);
    console.log(`  @run_shell_command command=ls -la`);
    console.log(`  @read_all_files path=. exclude=node_modules,.git`);
    console.log(`  @cd path=../`);
    console.log(`  @yolo_mode action=enable`);
    console.log(`  @code_analysis path=filename.js`);
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
                   entry.type === 'tool' ? colors.magenta : 
                   entry.type === 'analysis' ? colors.yellow : colors.red;
      console.log(`${colors.gray}[${time}]${colors.reset} ${type}${entry.type}:${colors.reset} ${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}`);
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

  showStats() {
    const stats = this.history.getSessionStats();
    console.log(`${colors.bright}Session Statistics:${colors.reset}`);
    console.log(`  User messages: ${stats.userMessages}`);
    console.log(`  Assistant messages: ${stats.assistantMessages}`);
    console.log(`  Tool calls: ${stats.toolCalls}`);
    console.log(`  Total messages: ${stats.totalMessages}`);
    console.log(`  Session duration: ${stats.sessionDuration} seconds`);
    console.log(`  Current directory: ${this.currentDirectory}`);
    console.log(`  YOLO mode: ${this.yoloMode.isEnabled() ? 'Enabled' : 'Disabled'}`);
    console.log(`  Web server: ${this.webServer.isRunning ? 'Running' : 'Stopped'}`);
  }

  showContext() {
    if (!this.context) {
      console.log(`${colors.yellow}No context yet${colors.reset}`);
      return;
    }
    console.log(`${colors.bright}Current Context:${colors.reset}`);
    console.log(this.context);
  }

  resetSession() {
    this.history.clear();
    this.context = '';
    console.log(`${colors.green}Session reset successfully${colors.reset}`);
  }

  handleAuth(apiKey) {
    if (!apiKey) {
      console.log(`${colors.yellow}Usage: /auth <your-api-key>${colors.reset}`);
      return;
    }
    
    this.settings.set('apiKey', apiKey);
    this.geminiAPI = new GeminiAPI(apiKey);
    console.log(`${colors.green}API key set successfully${colors.reset}`);
  }

  toggleDebug() {
    const currentDebug = this.settings.get('debugMode');
    this.settings.set('debugMode', !currentDebug);
    console.log(`${colors.green}Debug mode ${!currentDebug ? 'enabled' : 'disabled'}${colors.reset}`);
  }

  clear() {
    console.clear();
    console.log(`${colors.cyan}${colors.bright}Enhanced CLI Agent v${CONFIG.version}${colors.reset}`);
    console.log(`${colors.yellow}Type /help for available commands${colors.reset}\n`);
  }

  quit() {
    const stats = this.history.getSessionStats();
    console.log(`${colors.yellow}Session Summary:${colors.reset}`);
    console.log(`  Total messages: ${stats.totalMessages}`);
    console.log(`  Session duration: ${stats.sessionDuration} seconds`);
    console.log(`  YOLO mode: ${this.yoloMode.isEnabled() ? 'Enabled' : 'Disabled'}`);
    console.log(`  Web server: ${this.webServer.isRunning ? 'Running' : 'Stopped'}`);
    
    if (this.webServer.isRunning) {
      this.webServer.stop();
    }
    
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
    const agent = new EnhancedCLIAgent();
    await agent.initialize();
  } catch (error) {
    console.error(`${colors.red}Error starting CLI agent: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the application
main(); 
