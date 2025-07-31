/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { randomUUID } from 'crypto';
import { Config } from '@google/gemini-cli-core';
import { LoadedSettings, SettingScope, saveSettings } from '../../config/settings.js';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  source?: string;
}

interface ServerState {
  isRunning: boolean;
  port: number;
  url: string;
  logs: LogEntry[];
  startTime: string;
}

interface ConfigurationData {
  model: string;
  provider: string;
  availableModels: string[];
  availableProviders: string[];
  settings: Record<string, unknown>;
  currentConfig: Record<string, unknown>;
}

// Global web server instance for console logging
let globalWebServer: WebServer | null = null;

export class WebServer {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private io: SocketIOServer;
  private state: ServerState;
  private logBuffer: LogEntry[] = [];
  private maxLogEntries = 1000;
  private config: Config | null = null;
  private settings: LoadedSettings | null = null;

  constructor(config?: Config, settings?: LoadedSettings) {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      },
    });

    this.state = {
      isRunning: false,
      port: 0,
      url: '',
      logs: [],
      startTime: new Date().toISOString(),
    };

    this.config = config || null;
    this.settings = settings || null;

    this.setupRoutes();
    this.setupWebSocket();

    // Set as global instance for console logging
    globalWebServer = this;
  }

  // Static method to log console messages to web server
  public static logConsoleMessage(
    type: 'log' | 'warn' | 'error' | 'debug',
    message: string,
    source?: string,
  ) {
    if (globalWebServer && globalWebServer.state.isRunning) {
      globalWebServer.addLog(type, message, source || 'console');
    }
  }

  private setupRoutes() {
    // Serve static files
    this.app.use(express.static(path.join(process.cwd(), '.gemini-web')));
    this.app.use(express.json());

    // Serve Socket.IO client
    this.app.get('/socket.io/socket.io.js', (req, res) => {
      res.sendFile(
        path.join(
          process.cwd(),
          'node_modules/socket.io/client-dist/socket.io.js',
        ),
      );
    });

    // API Routes
    this.app.get('/api/status', (req, res) => {
      res.json(this.state);
    });

    this.app.get('/api/logs', (req, res) => {
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      const logs = this.state.logs.slice(offset, offset + limit);
      res.json({
        logs,
        total: this.state.logs.length,
        hasMore: offset + limit < this.state.logs.length,
      });
    });

    this.app.post('/api/logs', (req, res) => {
      const { level, message, source } = req.body;
      this.addLog(level || 'info', message, source);
      res.json({ success: true });
    });

    this.app.delete('/api/logs', (req, res) => {
      this.clearLogs();
      res.json({ success: true });
    });

    // Configuration API Routes
    this.app.get('/api/config', (req, res) => {
      const configData = this.getConfigurationData();
      res.json(configData);
    });

    this.app.put('/api/config/model', (req, res) => {
      const { model } = req.body;
      if (model && this.config) {
        try {
          this.config.setModel(model);
          this.addLog('info', `Model changed to: ${model}`, 'config');
          res.json({ success: true, model });
        } catch (error) {
          res.status(400).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      } else {
        res.status(400).json({ success: false, error: 'Invalid model or config not available' });
      }
    });

    this.app.put('/api/config/provider', (req, res) => {
      const { provider } = req.body;
      if (provider && this.settings) {
        try {
          // Update provider in settings
          this.settings.setValue(SettingScope.User, 'selectedProvider', provider);
          saveSettings(this.settings.user);
          this.addLog('info', `Provider changed to: ${provider}`, 'config');
          res.json({ success: true, provider });
        } catch (error) {
          res.status(400).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      } else {
        res.status(400).json({ success: false, error: 'Invalid provider or settings not available' });
      }
    });

    this.app.put('/api/config/settings', (req, res) => {
      const { scope, key, value } = req.body;
      if (scope && key && this.settings) {
        try {
          const settingScope = scope as SettingScope;
          this.settings.setValue(settingScope, key, value);
          saveSettings(this.settings.forScope(settingScope));
          this.addLog('info', `Setting updated: ${key} = ${value}`, 'config');
          res.json({ success: true });
        } catch (error) {
          res.status(400).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      } else {
        res.status(400).json({ success: false, error: 'Invalid parameters' });
      }
    });

    this.app.get('/api/config/available-models', (req, res) => {
      const models = this.getAvailableModels();
      res.json({ models });
    });

    this.app.get('/api/config/available-providers', (req, res) => {
      const providers = this.getAvailableProviders();
      res.json({ providers });
    });

    // Serve the main HTML page
    this.app.get('/', (req, res) => {
      res.send(this.getHTML());
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        uptime: Date.now() - new Date(this.state.startTime).getTime(),
      });
    });
  }

  private setupWebSocket() {
    this.io.on('connection', (socket: any) => {
      console.log('✅ Client connected to web interface');

      // Send current state to new client
      socket.emit('state', this.state);

      // Send configuration data
      const configData = this.getConfigurationData();
      socket.emit('config', configData);

      socket.on('disconnect', () => {
        console.log('❌ Client disconnected from web interface');
      });

      socket.on('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
      });

      // Handle configuration updates
      socket.on('updateModel', (data: { model: string }) => {
        if (this.config) {
          try {
            this.config.setModel(data.model);
            this.addLog('info', `Model changed to: ${data.model}`, 'config');
            socket.emit('configUpdated', this.getConfigurationData());
          } catch (error) {
            socket.emit('configError', { 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
      });

      socket.on('updateProvider', (data: { provider: string }) => {
        if (this.settings) {
          try {
            this.settings.setValue(SettingScope.User, 'selectedProvider', data.provider);
            saveSettings(this.settings.user);
            this.addLog('info', `Provider changed to: ${data.provider}`, 'config');
            socket.emit('configUpdated', this.getConfigurationData());
          } catch (error) {
            socket.emit('configError', { 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
      });
    });

    this.io.on('error', (error: any) => {
      console.error('❌ Socket.IO server error:', error);
    });
  }

  private getConfigurationData(): ConfigurationData {
    const currentModel = this.config?.getModel() || 'gemini-2.5-pro';
    const currentProvider = this.settings?.merged.selectedProvider || 'google';
    
    return {
      model: currentModel,
      provider: currentProvider,
      availableModels: this.getAvailableModels(),
      availableProviders: this.getAvailableProviders(),
      settings: this.settings?.merged as Record<string, unknown> || {},
      currentConfig: {
        model: currentModel,
        provider: currentProvider,
        debugMode: this.config?.getDebugMode() || false,
        approvalMode: this.config?.getApprovalMode() || 'default',
        showMemoryUsage: this.config?.getShowMemoryUsage() || false,
      }
    };
  }

  private getAvailableModels(): string[] {
    return [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision',
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku',
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'llama-3.1-8b',
      'llama-3.1-70b',
      'mistral-7b',
      'mixtral-8x7b',
    ];
  }

  private getAvailableProviders(): string[] {
    return [
      'google',
      'openai',
      'anthropic',
      'meta',
      'mistral',
      'perplexity',
      'cohere',
      'local',
    ];
  }

  private addLog(level: string, message: string, source?: string) {
    const logEntry: LogEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      level: level as any,
      message,
      source,
    };

    this.state.logs.unshift(logEntry);

    // Keep only the latest logs
    if (this.state.logs.length > this.maxLogEntries) {
      this.state.logs = this.state.logs.slice(0, this.maxLogEntries);
    }

    // Broadcast to all connected clients
    this.io.emit('newLog', logEntry);
    this.io.emit('state', this.state);
  }

  private clearLogs() {
    this.state.logs = [];
    this.io.emit('logsCleared');
    this.io.emit('state', this.state);
  }

  public start(port: number = 4000): Promise<number> {
    return new Promise((resolve, reject) => {
      console.log(`Starting web server on port ${port}...`);

      this.server.listen(port, () => {
        const address = this.server.address();
        if (address && typeof address !== 'string') {
          this.state.port = address.port;
          this.state.url = `http://localhost:${address.port}`;
          this.state.isRunning = true;
          this.state.startTime = new Date().toISOString();

          console.log(
            `✅ Web server started successfully on ${this.state.url}`,
          );
          this.addLog(
            'info',
            `Web server started on ${this.state.url}`,
            'server',
          );

          resolve(address.port);
        } else {
          reject(new Error('Failed to get server address'));
        }
      });

      this.server.on('error', (error: Error) => {
        console.error('❌ Web server error:', error.message);
        reject(error);
      });
    });
  }

  public stop(): void {
    if (this.server) {
      this.server.close();
      this.state.isRunning = false;
      this.addLog('info', 'Web server stopped', 'server');
    }
  }

  public log(level: string, message: string, source?: string) {
    this.addLog(level, message, source);
  }

  public isRunning(): boolean {
    return this.state.isRunning;
  }

  public getState(): ServerState {
    return { ...this.state };
  }

  private getHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notabot CLI Web Interface</title>
    <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #2d2d2d;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            color: #00ff88;
            font-size: 2rem;
        }
        
        .status {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #00ff88;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .controls {
            display: flex;
            gap: 10px;
        }
        
        button {
            background: #00ff88;
            color: #1a1a1a;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
        }
        
        button:hover {
            background: #00cc6a;
        }
        
        button.danger {
            background: #ff4444;
        }
        
        button.danger:hover {
            background: #cc3333;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .config-panel {
            background: #2d2d2d;
            border-radius: 8px;
            padding: 20px;
        }
        
        .config-panel h2 {
            color: #00ff88;
            margin-bottom: 20px;
        }
        
        .config-group {
            margin-bottom: 20px;
        }
        
        .config-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        .config-group select,
        .config-group input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #444;
            border-radius: 4px;
            background: #1a1a1a;
            color: #ffffff;
            font-size: 14px;
        }
        
        .config-group select:focus,
        .config-group input:focus {
            outline: none;
            border-color: #00ff88;
        }
        
        .logs-container {
            background: #2d2d2d;
            border-radius: 8px;
            padding: 20px;
            height: 600px;
            overflow-y: auto;
        }
        
        .log-entry {
            padding: 8px 12px;
            margin-bottom: 4px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }
        
        .log-entry.info {
            background: #1a3a1a;
            border-left: 4px solid #00ff88;
        }
        
        .log-entry.error {
            background: #3a1a1a;
            border-left: 4px solid #ff4444;
        }
        
        .log-entry.warn {
            background: #3a3a1a;
            border-left: 4px solid #ffaa00;
        }
        
        .log-entry.debug {
            background: #1a1a3a;
            border-left: 4px solid #4444ff;
        }
        
        .log-timestamp {
            color: #888;
            font-size: 12px;
        }
        
        .log-source {
            color: #00ff88;
            font-weight: bold;
        }
        
        .log-message {
            margin-top: 4px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: #2d2d2d;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #00ff88;
        }
        
        .stat-label {
            color: #888;
            margin-top: 8px;
        }
        
        .config-status {
            background: #1a3a1a;
            border: 1px solid #00ff88;
            border-radius: 4px;
            padding: 12px;
            margin-top: 10px;
        }
        
        .config-status.error {
            background: #3a1a1a;
            border-color: #ff4444;
        }
        
        .config-status.success {
            background: #1a3a1a;
            border-color: #00ff88;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Notabot CLI</h1>
            <div class="status">
                <div class="status-indicator" id="statusIndicator"></div>
                <span id="statusText">Connecting...</span>
                <div class="controls">
                    <button onclick="clearLogs()">Clear Logs</button>
                    <button onclick="exportLogs()">Export Logs</button>
                </div>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value" id="totalLogs">0</div>
                <div class="stat-label">Total Logs</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="uptime">0s</div>
                <div class="stat-label">Uptime</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="connectedClients">0</div>
                <div class="stat-label">Connected Clients</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="currentModel">-</div>
                <div class="stat-label">Current Model</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="config-panel">
                <h2>⚙️ Configuration</h2>
                
                <div class="config-group">
                    <label for="modelSelect">AI Model:</label>
                    <select id="modelSelect" onchange="updateModel(this.value)">
                        <option value="">Loading models...</option>
                    </select>
                </div>
                
                <div class="config-group">
                    <label for="providerSelect">AI Provider:</label>
                    <select id="providerSelect" onchange="updateProvider(this.value)">
                        <option value="">Loading providers...</option>
                    </select>
                </div>
                
                <div class="config-group">
                    <label for="debugMode">Debug Mode:</label>
                    <input type="checkbox" id="debugMode" onchange="updateSetting('debugMode', this.checked)">
                </div>
                
                <div class="config-group">
                    <label for="showMemoryUsage">Show Memory Usage:</label>
                    <input type="checkbox" id="showMemoryUsage" onchange="updateSetting('showMemoryUsage', this.checked)">
                </div>
                
                <div class="config-status" id="configStatus" style="display: none;">
                    <span id="configMessage"></span>
                </div>
            </div>
            
            <div class="logs-container" id="logsContainer">
                <div class="log-entry info">
                    <div class="log-timestamp">Loading...</div>
                    <div class="log-message">Connecting to server...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const socket = io();
        let serverState = {};
        let connectedClients = 0;
        let currentConfig = {};

        socket.on('connect', () => {
            updateStatus('Connected', true);
            updateConnectedClients(1);
        });

        socket.on('disconnect', () => {
            updateStatus('Disconnected', false);
            updateConnectedClients(0);
        });

        socket.on('state', (state) => {
            serverState = state;
            updateStats();
        });

        socket.on('config', (config) => {
            currentConfig = config;
            updateConfigUI(config);
        });

        socket.on('configUpdated', (config) => {
            currentConfig = config;
            updateConfigUI(config);
            showConfigStatus('Configuration updated successfully!', 'success');
        });

        socket.on('configError', (error) => {
            showConfigStatus('Configuration error: ' + error.error, 'error');
        });

        socket.on('newLog', (logEntry) => {
            addLogEntry(logEntry);
            updateStats();
        });

        socket.on('logsCleared', () => {
            clearLogsDisplay();
            updateStats();
        });

        function updateStatus(text, isConnected) {
            document.getElementById('statusText').textContent = text;
            const indicator = document.getElementById('statusIndicator');
            indicator.style.background = isConnected ? '#00ff88' : '#ff4444';
        }

        function updateConnectedClients(count) {
            connectedClients = count;
            updateStats();
        }

        function updateStats() {
            document.getElementById('totalLogs').textContent = serverState.logs?.length || 0;
            
            if (serverState.startTime) {
                const uptime = Math.floor((Date.now() - new Date(serverState.startTime).getTime()) / 1000);
                document.getElementById('uptime').textContent = formatUptime(uptime);
            }
            
            document.getElementById('connectedClients').textContent = connectedClients;
            document.getElementById('currentModel').textContent = currentConfig.model || '-';
        }

        function updateConfigUI(config) {
            // Update model select
            const modelSelect = document.getElementById('modelSelect');
            modelSelect.innerHTML = '';
            config.availableModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                if (model === config.model) {
                    option.selected = true;
                }
                modelSelect.appendChild(option);
            });

            // Update provider select
            const providerSelect = document.getElementById('providerSelect');
            providerSelect.innerHTML = '';
            config.availableProviders.forEach(provider => {
                const option = document.createElement('option');
                option.value = provider;
                option.textContent = provider;
                if (provider === config.provider) {
                    option.selected = true;
                }
                providerSelect.appendChild(option);
            });

            // Update checkboxes
            document.getElementById('debugMode').checked = config.currentConfig?.debugMode || false;
            document.getElementById('showMemoryUsage').checked = config.currentConfig?.showMemoryUsage || false;
        }

        function updateModel(model) {
            socket.emit('updateModel', { model });
        }

        function updateProvider(provider) {
            socket.emit('updateProvider', { provider });
        }

        function updateSetting(key, value) {
            fetch('/api/config/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scope: 'User',
                    key: key,
                    value: value
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showConfigStatus('Setting updated successfully!', 'success');
                } else {
                    showConfigStatus('Failed to update setting: ' + data.error, 'error');
                }
            })
            .catch(error => {
                showConfigStatus('Error updating setting: ' + error.message, 'error');
            });
        }

        function showConfigStatus(message, type) {
            const status = document.getElementById('configStatus');
            const messageEl = document.getElementById('configMessage');
            
            status.className = 'config-status ' + type;
            messageEl.textContent = message;
            status.style.display = 'block';
            
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }

        function formatUptime(seconds) {
            if (seconds < 60) return seconds + 's';
            if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + (seconds % 60) + 's';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + minutes + 'm';
        }

        function addLogEntry(logEntry) {
            const container = document.getElementById('logsContainer');
            const logDiv = document.createElement('div');
            logDiv.className = \`log-entry \${logEntry.level}\`;
            
            const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
            const source = logEntry.source ? \`[\${logEntry.source}]\` : '';
            
            logDiv.innerHTML = \`
                <div class="log-timestamp">\${timestamp}</div>
                \${source ? \`<div class="log-source">\${source}</div>\` : ''}
                <div class="log-message">\${logEntry.message}</div>
            \`;
            
            container.insertBefore(logDiv, container.firstChild);
            
            // Keep only the latest 100 logs in the display
            const logs = container.querySelectorAll('.log-entry');
            if (logs.length > 100) {
                logs[logs.length - 1].remove();
            }
        }

        function clearLogsDisplay() {
            document.getElementById('logsContainer').innerHTML = '';
        }

        function clearLogs() {
            fetch('/api/logs', { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Logs cleared');
                    }
                })
                .catch(error => console.error('Error clearing logs:', error));
        }

        function exportLogs() {
            fetch('/api/logs?limit=1000')
                .then(response => response.json())
                .then(data => {
                    const logsText = data.logs.map(log => 
                        \`[\${log.timestamp}] [\${log.level.toUpperCase()}] \${log.source ? '[' + log.source + '] ' : ''}\${log.message}\`
                    ).join('\\n');
                    
                    const blob = new Blob([logsText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`notabot-logs-\${new Date().toISOString().split('T')[0]}.txt\`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                })
                .catch(error => console.error('Error exporting logs:', error));
        }

        // Auto-scroll to bottom
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.scrollTop = logsContainer.scrollHeight;
    </script>
</body>
</html>
    `;
  }
}

let webServer: WebServer | null = null;

export const serverCommand: SlashCommand = {
  name: 'server',
  altNames: ['web', 'dashboard'],
  description: 'start web interface for viewing logs and managing CLI configuration',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<MessageActionReturn> => {
    const action = args.trim().toLowerCase();

    if (!action || action === 'start') {
      if (webServer && webServer.isRunning()) {
        const state = webServer.getState();
        return {
          type: 'message',
          messageType: 'info',
          content: `Web server is already running at ${state.url}`,
        };
      }

      try {
        webServer = new WebServer(context.services.config || undefined, context.services.settings);
        await webServer.start(4000);

        return {
          type: 'message',
          messageType: 'info',
          content: `✅ Web server started successfully!\n🌐 Open your browser to: http://localhost:4000\n📊 View logs, monitor CLI status, and manage your Notabot instance.\n⚙️  Full configuration management including model and provider swapping.\n💡 The server will always run on port 4000 for easy access.`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('EADDRINUSE')) {
          return {
            type: 'message',
            messageType: 'error',
            content: `❌ Port 4000 is already in use!\n💡 Try:\n  1. /server stop (if another instance is running)\n  2. Close other applications using port 4000\n  3. Restart the CLI and try again`,
          };
        }
        return {
          type: 'message',
          messageType: 'error',
          content: `Failed to start web server: ${errorMessage}`,
        };
      }
    } else if (action === 'stop') {
      if (!webServer || !webServer.isRunning()) {
        return {
          type: 'message',
          messageType: 'info',
          content: 'Web server is not running.',
        };
      }

      webServer.stop();
      return {
        type: 'message',
        messageType: 'info',
        content: '✅ Web server stopped successfully.',
      };
    } else if (action === 'status') {
      if (!webServer || !webServer.isRunning()) {
        return {
          type: 'message',
          messageType: 'info',
          content: 'Web server is not running.',
        };
      }

      const state = webServer.getState();
      const uptime = Math.floor(
        (Date.now() - new Date(state.startTime).getTime()) / 1000,
      );

      return {
        type: 'message',
        messageType: 'info',
        content: `🌐 Web Server Status:\n📊 URL: ${state.url}\n⏱️  Uptime: ${Math.floor(uptime / 60)}m ${uptime % 60}s\n📝 Logs: ${state.logs.length} entries\n🚀 Status: Running\n⚙️  Features: Configuration management, model swapping, provider switching`,
      };
    } else if (action === 'help') {
      return {
        type: 'message',
        messageType: 'info',
        content: `📋 Web Server Commands:\n\n/server start - Start the web interface\n/server stop - Stop the web interface\n/server status - Show server status\n/server help - Show this help\n\n🌐 Features:\n• Real-time log viewing\n• CLI status monitoring\n• Log export functionality\n• Web-based dashboard\n• AI model configuration\n• Provider switching\n• Settings management`,
      };
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: `Unknown action: ${action}\nUse /server help for available commands.`,
      };
    }
  },
  completion: async (context, partialArg) => {
    const actions = ['start', 'stop', 'status', 'help'];
    return actions.filter((action) =>
      action.toLowerCase().includes(partialArg.toLowerCase()),
    );
  },
};
