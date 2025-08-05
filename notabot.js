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
import { NotABotDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  name: 'NotABot',
  version: '1.0.0',
  settingsFile: path.join(os.homedir(), '.notabot', 'settings.json'),
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
    webServerPort: 4000,
    autoMode: false,
    autoCommands: [],
    autoTriggers: [],
    webInterfaceEnabled: true,
    webInterfacePort: 4001
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
    this._isRunning = false;
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

      // Settings management routes
      app.post('/api/settings', express.json(), (req, res) => {
        try {
          const newSettings = req.body;
          this.agent.settings.updateSettings(newSettings);
          res.json({ success: true, message: 'Settings updated successfully' });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });

      app.post('/api/settings/:key', express.json(), (req, res) => {
        try {
          const { key } = req.params;
          const value = req.body.value;
          this.agent.settings.set(key, value);
          res.json({ success: true, message: `Setting ${key} updated successfully` });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Control routes
      app.post('/api/toggle-yolo', (req, res) => {
        this.agent.toggleYoloMode();
        res.json({ success: true, yoloMode: this.agent.yoloMode.isEnabled() });
      });

      app.post('/api/clear-history', (req, res) => {
        this.agent.history.clear();
        res.json({ success: true, message: 'History cleared' });
      });

      app.post('/api/reset-session', (req, res) => {
        this.agent.resetSession();
        res.json({ success: true, message: 'Session reset' });
      });

      app.post('/api/auto-mode', express.json(), (req, res) => {
        try {
          const { enabled, commands, triggers } = req.body;
          this.agent.settings.set('autoMode', enabled);
          this.agent.settings.set('autoCommands', commands || []);
          this.agent.settings.set('autoTriggers', triggers || []);
          res.json({ success: true, message: 'Auto mode updated' });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });

      app.post('/api/webserver/start', (req, res) => {
        try {
          this.agent.webServer.start();
          this.agent.settings.set('webServerEnabled', true);
          res.json({ success: true, message: 'Web server started' });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });

      app.post('/api/webserver/stop', (req, res) => {
        try {
          this.agent.webServer.stop();
          this.agent.settings.set('webServerEnabled', false);
          res.json({ success: true, message: 'Web server stopped' });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
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
        this._isRunning = true;
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
      this._isRunning = false;
      console.log(`${colors.yellow}Web server stopped${colors.reset}`);
    }
  }

  isRunning() {
    return this._isRunning;
  }

  getStatus() {
    const stats = this.agent.history.getSessionStats();
    return {
      isRunning: this._isRunning,
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
    <title>NotABot - Live Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1e1e1e; color: #fff; }
        .container { max-width: 1400px; margin: 0 auto; }
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
        .settings-form { background: #3d3d3d; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .form-group { margin: 10px 0; }
        .form-group label { display: block; margin-bottom: 5px; }
        .form-group input, .form-group select, .form-group textarea { 
            width: 100%; padding: 8px; background: #555; border: 1px solid #666; color: #fff; border-radius: 3px; 
        }
        .btn { padding: 8px 16px; margin: 5px; border: none; border-radius: 3px; cursor: pointer; }
        .btn-primary { background: #2196F3; color: white; }
        .btn-success { background: #4CAF50; color: white; }
        .btn-warning { background: #FF9800; color: white; }
        .btn-danger { background: #f44336; color: white; }
        .auto-mode { background: #4CAF50; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 NotABot Dashboard</h1>
            <p>Full automated CLI agent with live monitoring and control</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h2>📊 Status</h2>
                <div id="status"></div>
            </div>
            
            <div class="card">
                <h2>⚙️ Settings Management</h2>
                <div id="settings-form" class="settings-form">
                    <div class="form-group">
                        <label>Model:</label>
                        <select id="model" onchange="updateSetting('model', this.value)">
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Max Tokens:</label>
                        <input type="number" id="maxTokens" onchange="updateSetting('maxTokens', parseInt(this.value))" min="100" max="8192">
                    </div>
                    <div class="form-group">
                        <label>Temperature:</label>
                        <input type="number" id="temperature" onchange="updateSetting('temperature', parseFloat(this.value))" min="0" max="2" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Web Server Port:</label>
                        <input type="number" id="webServerPort" onchange="updateSetting('webServerPort', parseInt(this.value))" min="1000" max="9999">
                    </div>
                    <div class="form-group">
                        <label>Debug Mode:</label>
                        <input type="checkbox" id="debugMode" onchange="updateSetting('debugMode', this.checked)">
                    </div>
                    <div class="form-group">
                        <label>Auto Mode:</label>
                        <input type="checkbox" id="autoMode" onchange="updateSetting('autoMode', this.checked)">
                    </div>
                    <button class="btn btn-primary" onclick="saveAllSettings()">Save All Settings</button>
                </div>
            </div>
            
            <div class="card">
                <h2>🤖 Auto Mode Configuration</h2>
                <div id="auto-config" class="settings-form">
                    <div class="form-group">
                        <label>Auto Commands (one per line):</label>
                        <textarea id="autoCommands" rows="4" placeholder="Enter commands to run automatically..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Auto Triggers (one per line):</label>
                        <textarea id="autoTriggers" rows="4" placeholder="Enter trigger patterns..."></textarea>
                    </div>
                    <button class="btn btn-success" onclick="saveAutoMode()">Save Auto Mode</button>
                </div>
            </div>
            
            <div class="card">
                <h2>📝 Recent History</h2>
                <div id="history" class="history"></div>
            </div>
            
            <div class="card">
                <h2>🎮 Controls</h2>
                <button class="btn btn-warning" onclick="toggleYolo()">Toggle YOLO Mode</button>
                <button class="btn btn-danger" onclick="clearHistory()">Clear History</button>
                <button class="btn btn-primary" onclick="resetSession()">Reset Session</button>
                <button class="btn btn-success" onclick="startWebServer()">Start Web Server</button>
                <button class="btn btn-danger" onclick="stopWebServer()">Stop Web Server</button>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        let currentSettings = {};
        
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
                \${data.settings.autoMode ? '<div class="auto-mode">🤖 AUTO MODE ENABLED</div>' : ''}
            \`;
            
            updateSettingsForm(data.settings);
        }
        
        function updateSettingsForm(settings) {
            currentSettings = settings;
            
            // Update form fields
            if (document.getElementById('model')) document.getElementById('model').value = settings.model || 'gemini-1.5-flash';
            if (document.getElementById('maxTokens')) document.getElementById('maxTokens').value = settings.maxTokens || 4096;
            if (document.getElementById('temperature')) document.getElementById('temperature').value = settings.temperature || 0.7;
            if (document.getElementById('webServerPort')) document.getElementById('webServerPort').value = settings.webServerPort || 4000;
            if (document.getElementById('debugMode')) document.getElementById('debugMode').checked = settings.debugMode || false;
            if (document.getElementById('autoMode')) document.getElementById('autoMode').checked = settings.autoMode || false;
            
            // Update auto mode fields
            if (document.getElementById('autoCommands')) document.getElementById('autoCommands').value = (settings.autoCommands || []).join('\\n');
            if (document.getElementById('autoTriggers')) document.getElementById('autoTriggers').value = (settings.autoTriggers || []).join('\\n');
        }
        
        function updateSetting(key, value) {
            fetch(\`/api/settings/\${key}\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value })
            }).then(r => r.json()).then(data => {
                if (data.success) {
                    console.log(\`Setting \${key} updated\`);
                }
            });
        }
        
        function saveAllSettings() {
            const settings = {
                model: document.getElementById('model').value,
                maxTokens: parseInt(document.getElementById('maxTokens').value),
                temperature: parseFloat(document.getElementById('temperature').value),
                webServerPort: parseInt(document.getElementById('webServerPort').value),
                debugMode: document.getElementById('debugMode').checked,
                autoMode: document.getElementById('autoMode').checked
            };
            
            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            }).then(r => r.json()).then(data => {
                if (data.success) {
                    alert('Settings saved successfully!');
                }
            });
        }
        
        function saveAutoMode() {
            const commands = document.getElementById('autoCommands').value.split('\\n').filter(cmd => cmd.trim());
            const triggers = document.getElementById('autoTriggers').value.split('\\n').filter(trigger => trigger.trim());
            
            fetch('/api/auto-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled: document.getElementById('autoMode').checked,
                    commands,
                    triggers
                })
            }).then(r => r.json()).then(data => {
                if (data.success) {
                    alert('Auto mode configuration saved!');
                }
            });
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
        
        function startWebServer() {
            fetch('/api/webserver/start', { method: 'POST' });
        }
        
        function stopWebServer() {
            fetch('/api/webserver/stop', { method: 'POST' });
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

// Auto Mode Manager
class AutoModeManager {
  constructor(agent) {
    this.agent = agent;
    this.isEnabled = false;
    this.commands = [];
    this.triggers = [];
    this.lastCheck = Date.now();
    this.checkInterval = null;
  }

  enable() {
    this.isEnabled = true;
    this.startMonitoring();
    console.log(`${colors.green}🤖 Auto mode enabled${colors.reset}`);
  }

  disable() {
    this.isEnabled = false;
    this.stopMonitoring();
    console.log(`${colors.yellow}Auto mode disabled${colors.reset}`);
  }

  setCommands(commands) {
    this.commands = commands;
  }

  setTriggers(triggers) {
    this.triggers = triggers;
  }

  startMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(() => {
      this.checkAutoActions();
    }, 5000); // Check every 5 seconds
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async checkAutoActions() {
    if (!this.isEnabled) return;

    try {
      // Check for trigger conditions
      const shouldExecute = this.checkTriggers();
      
      if (shouldExecute) {
        await this.executeAutoCommands();
      }
    } catch (error) {
      console.log(`${colors.red}Auto mode error: ${error.message}${colors.reset}`);
    }
  }

  checkTriggers() {
    // Simple trigger checking - can be enhanced
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - this.lastCheck;
    
    // Check if enough time has passed (basic trigger)
    if (timeSinceLastCheck > 30000) { // 30 seconds
      this.lastCheck = currentTime;
      return true;
    }
    
    return false;
  }

  async executeAutoCommands() {
    for (const command of this.commands) {
      if (command.trim()) {
        console.log(`${colors.blue}[AUTO] Executing: ${command}${colors.reset}`);
        await this.agent.handleInput(command);
      }
    }
  }
}

// Main NotABot class
class NotABotAgent {
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
    this.database = new NotABotDatabase();
    this.autoMode = new AutoModeManager(this);
    this.isRunning = false;
    this.rl = null;
    this.context = '';
    this.currentDirectory = process.cwd();
    this.currentInput = '';
    this.suggestionIndex = 0;
    this.suggestions = [];
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initialize() {
    console.log(`${colors.cyan}${colors.bright}NotABot v${CONFIG.version}${colors.reset}`);
    console.log(`${colors.yellow}Type /help for available commands${colors.reset}\n`);
    
    // Initialize database
    try {
      await this.database.initialize();
      await this.database.createSession(this.sessionId, this.settings.settings);
      console.log(`📊 Database connected and session created: ${this.sessionId}`);
    } catch (error) {
      console.log(`${colors.red}❌ Database initialization failed: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}Continuing without database...${colors.reset}`);
    }
    
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

    // Initialize auto mode if enabled
    if (this.settings.get('autoMode')) {
      this.autoMode.enable();
      this.autoMode.setCommands(this.settings.get('autoCommands') || []);
      this.autoMode.setTriggers(this.settings.get('autoTriggers') || []);
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
        await this.quit();
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
      
      case 'auto':
        this.handleAutoMode(args);
        break;
      
      case 'db':
        this.handleDatabase(args);
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
      
      // Save to database
      if (this.database.initialized) {
        await this.database.saveConversation(
          this.sessionId,
          message,
          response,
          null, // toolCalls
          this.context,
          this.settings.settings
        );
      }
      
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
        console.log(`${colors.blue}Web server status: ${this.webServer.isRunning() ? 'Running' : 'Stopped'}${colors.reset}`);
        if (this.webServer.isRunning()) {
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

  async handleAutoMode(args) {
    const action = args[0] || 'status';
    
    switch (action) {
      case 'enable':
        this.autoMode.enable();
        this.settings.set('autoMode', true);
        break;
      case 'disable':
        this.autoMode.disable();
        this.settings.set('autoMode', false);
        break;
      case 'status':
        console.log(`${colors.blue}Auto Mode Status:${colors.reset}`);
        console.log(`  Enabled: ${this.autoMode.isEnabled ? 'Yes' : 'No'}`);
        console.log(`  Commands: ${this.autoMode.commands.length}`);
        console.log(`  Triggers: ${this.autoMode.triggers.length}`);
        break;
      case 'commands':
        const commands = args.slice(1);
        this.autoMode.setCommands(commands);
        this.settings.set('autoCommands', commands);
        console.log(`${colors.green}Auto commands updated${colors.reset}`);
        break;
      case 'triggers':
        const triggers = args.slice(1);
        this.autoMode.setTriggers(triggers);
        this.settings.set('autoTriggers', triggers);
        console.log(`${colors.green}Auto triggers updated${colors.reset}`);
        break;
      default:
        console.log(`${colors.yellow}Usage: /auto [enable|disable|status|commands|triggers]${colors.reset}`);
    }
  }

  async handleDatabase(args) {
    const action = args[0] || 'status';
    
    if (!this.database.initialized) {
      console.log(`${colors.red}❌ Database not initialized${colors.reset}`);
      return;
    }
    
    switch (action) {
      case 'status':
        const stats = await this.database.getDatabaseStats();
        console.log(`${colors.blue}📊 Database Statistics:${colors.reset}`);
        console.log(`  Conversations: ${stats.conversations_count || 0}`);
        console.log(`  Sessions: ${stats.sessions_count || 0}`);
        console.log(`  Settings: ${stats.settings_count || 0}`);
        console.log(`  Indexed Files: ${stats.indexed_files_count || 0}`);
        console.log(`  Search History: ${stats.search_history_count || 0}`);
        console.log(`  Auto Mode Logs: ${stats.auto_mode_logs_count || 0}`);
        console.log(`  Web Server Logs: ${stats.web_server_logs_count || 0}`);
        console.log(`  Recent Conversations (24h): ${stats.recent_conversations_24h || 0}`);
        console.log(`  Database Size: ${((stats.database_size_bytes || 0) / 1024).toFixed(2)} KB`);
        break;
      
      case 'conversations':
        const limit = parseInt(args[1]) || 10;
        const conversations = await this.database.getConversations(null, limit);
        console.log(`${colors.blue}📝 Recent Conversations:${colors.reset}`);
        conversations.forEach((conv, index) => {
          const date = new Date(conv.timestamp).toLocaleString();
          console.log(`  ${index + 1}. [${date}] ${conv.user_message?.substring(0, 50)}...`);
        });
        break;
      
      case 'sessions':
        const sessions = await this.database.getSessions(10);
        console.log(`${colors.blue}🕐 Recent Sessions:${colors.reset}`);
        sessions.forEach((session, index) => {
          const startDate = new Date(session.start_time).toLocaleString();
          console.log(`  ${index + 1}. [${startDate}] ${session.session_id} (${session.total_messages} messages)`);
        });
        break;
      
      case 'search':
        const query = args.slice(1).join(' ');
        if (!query) {
          console.log(`${colors.yellow}Usage: /db search <query>${colors.reset}`);
          return;
        }
        const searchHistory = await this.database.getSearchHistory(20);
        const filteredHistory = searchHistory.filter(h => 
          h.query.toLowerCase().includes(query.toLowerCase())
        );
        console.log(`${colors.blue}🔍 Search History for "${query}":${colors.reset}`);
        filteredHistory.forEach((item, index) => {
          const date = new Date(item.timestamp).toLocaleString();
          console.log(`  ${index + 1}. [${date}] "${item.query}" (${item.results_count} results)`);
        });
        break;
      
      case 'cleanup':
        const days = parseInt(args[1]) || 30;
        console.log(`${colors.yellow}🧹 Cleaning up data older than ${days} days...${colors.reset}`);
        await this.database.cleanupOldData(days);
        console.log(`${colors.green}✅ Cleanup completed${colors.reset}`);
        break;
      
      case 'backup':
        const backupPath = args[1] || `notabot_backup_${Date.now()}.db`;
        console.log(`${colors.yellow}💾 Creating backup...${colors.reset}`);
        await this.database.backup(backupPath);
        console.log(`${colors.green}✅ Backup created: ${backupPath}${colors.reset}`);
        break;
      
      default:
        console.log(`${colors.yellow}Database Commands:${colors.reset}`);
        console.log(`  /db status        - Show database statistics`);
        console.log(`  /db conversations [limit] - Show recent conversations`);
        console.log(`  /db sessions      - Show recent sessions`);
        console.log(`  /db search <query> - Search history`);
        console.log(`  /db cleanup [days] - Clean up old data`);
        console.log(`  /db backup [path]  - Create database backup`);
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
    console.log(`  /auto       - Control auto mode`);
    console.log(`  /db         - Database management`);
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
    console.log(`  Web server: ${this.webServer.isRunning() ? 'Running' : 'Stopped'}`);
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
    console.log(`${colors.cyan}${colors.bright}NotABot v${CONFIG.version}${colors.reset}`);
    console.log(`${colors.yellow}Type /help for available commands${colors.reset}\n`);
  }

  async quit() {
    const stats = this.history.getSessionStats();
    console.log(`${colors.yellow}Session Summary:${colors.reset}`);
    console.log(`  Total messages: ${stats.totalMessages}`);
    console.log(`  Session duration: ${stats.sessionDuration} seconds`);
    console.log(`  YOLO mode: ${this.yoloMode.isEnabled() ? 'Enabled' : 'Disabled'}`);
    console.log(`  Web server: ${this.webServer.isRunning() ? 'Running' : 'Stopped'}`);
    
    // Save session data to database
    if (this.database.initialized) {
      try {
        await this.database.updateSession(this.sessionId, {
          totalMessages: stats.totalMessages,
          userMessages: stats.userMessages,
          assistantMessages: stats.assistantMessages,
          toolCalls: stats.toolCalls,
          endTime: new Date().toISOString()
        });
        console.log(`${colors.green}✅ Session data saved to database${colors.reset}`);
      } catch (error) {
        console.log(`${colors.red}❌ Failed to save session data: ${error.message}${colors.reset}`);
      }
      
      // Close database connection
      await this.database.close();
    }
    
    if (this.webServer.isRunning()) {
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
    const agent = new NotABotAgent();
    await agent.initialize();
  } catch (error) {
    console.error(`${colors.red}Error starting NotABot: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the application if this is the main module
const isMainModule = process.argv[1] && process.argv[1].endsWith('notabot.js');
if (isMainModule) {
  main();
}

export { main }; 
