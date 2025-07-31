#!/usr/bin/env node

/**
 * Setup script for Enhanced CLI Agents
 * Handles global installation and initial setup
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

class SetupManager {
  constructor() {
    this.homeDir = os.homedir();
    this.simpleSettingsDir = path.join(this.homeDir, '.simple-cli');
    this.enhancedSettingsDir = path.join(this.homeDir, '.enhanced-cli');
  }

  async run() {
    console.log(`${colors.cyan}${colors.bright}Enhanced CLI Agents Setup${colors.reset}`);
    console.log(`${colors.yellow}Setting up global installation...${colors.reset}\n`);

    try {
      // Create settings directories
      await this.createSettingsDirectories();
      
      // Create default settings files
      await this.createDefaultSettings();
      
      // Create batch files for Windows
      await this.createBatchFiles();
      
      // Add to PATH (Windows)
      await this.addToPath();
      
      // Install dependencies
      await this.installDependencies();
      
      console.log(`\n${colors.green}✅ Setup completed successfully!${colors.reset}`);
      this.showUsageInstructions();
      
    } catch (error) {
      console.error(`${colors.red}❌ Setup failed: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  async createSettingsDirectories() {
    console.log(`${colors.blue}Creating settings directories...${colors.reset}`);
    
    const dirs = [this.simpleSettingsDir, this.enhancedSettingsDir];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`${colors.green}Created: ${dir}${colors.reset}`);
      } else {
        console.log(`${colors.gray}Exists: ${dir}${colors.reset}`);
      }
    }
  }

  async createDefaultSettings() {
    console.log(`${colors.blue}Creating default settings files...${colors.reset}`);
    
    const simpleSettings = {
      theme: 'default',
      model: 'gemini-1.5-flash',
      authType: 'api-key',
      apiKey: process.env.GEMINI_API_KEY || '',
      showMemoryUsage: false,
      debugMode: false,
      maxSessionTurns: 50,
      tools: ['list_directory', 'read_file', 'write_file', 'run_shell_command']
    };

    const enhancedSettings = {
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
    };

    const simpleSettingsFile = path.join(this.simpleSettingsDir, 'settings.json');
    const enhancedSettingsFile = path.join(this.enhancedSettingsDir, 'settings.json');

    if (!fs.existsSync(simpleSettingsFile)) {
      fs.writeFileSync(simpleSettingsFile, JSON.stringify(simpleSettings, null, 2));
      console.log(`${colors.green}Created: ${simpleSettingsFile}${colors.reset}`);
    }

    if (!fs.existsSync(enhancedSettingsFile)) {
      fs.writeFileSync(enhancedSettingsFile, JSON.stringify(enhancedSettings, null, 2));
      console.log(`${colors.green}Created: ${enhancedSettingsFile}${colors.reset}`);
    }
  }

  async createBatchFiles() {
    if (process.platform === 'win32') {
      console.log(`${colors.blue}Creating batch files for Windows...${colors.reset}`);
      
      const installDir = path.join(this.homeDir, '.cli-agents');
      if (!fs.existsSync(installDir)) {
        fs.mkdirSync(installDir, { recursive: true });
      }

      const batchFiles = [
        {
          name: 'enhanced-cli.bat',
          content: `@echo off\nnode "${path.resolve(__dirname, 'enhanced-cli-agent.js')}" %*`
        },
        {
          name: 'simple-cli.bat',
          content: `@echo off\nnode "${path.resolve(__dirname, 'simple-cli-agent.js')}" %*`
        },
        {
          name: 'ecli.bat',
          content: `@echo off\nnode "${path.resolve(__dirname, 'enhanced-cli-agent.js')}" %*`
        },
        {
          name: 'scli.bat',
          content: `@echo off\nnode "${path.resolve(__dirname, 'simple-cli-agent.js')}" %*`
        }
      ];

      for (const batchFile of batchFiles) {
        const batchPath = path.join(installDir, batchFile.name);
        fs.writeFileSync(batchPath, batchFile.content);
        console.log(`${colors.green}Created: ${batchPath}${colors.reset}`);
      }
    }
  }

  async addToPath() {
    if (process.platform === 'win32') {
      console.log(`${colors.blue}Adding to PATH...${colors.reset}`);
      
      const installDir = path.join(this.homeDir, '.cli-agents');
      const { execSync } = await import('child_process');
      
      try {
        // Check if already in PATH
        const pathOutput = execSync('echo %PATH%', { encoding: 'utf8' });
        if (!pathOutput.includes(installDir)) {
          // Add to user PATH
          execSync(`setx PATH "%PATH%;${installDir}"`, { stdio: 'inherit' });
          console.log(`${colors.green}Added ${installDir} to PATH${colors.reset}`);
        } else {
          console.log(`${colors.gray}Already in PATH: ${installDir}${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.yellow}Warning: Could not add to PATH automatically${colors.reset}`);
        console.log(`${colors.yellow}Please add ${installDir} to your PATH manually${colors.reset}`);
      }
    }
  }

  async installDependencies() {
    console.log(`${colors.blue}Installing dependencies...${colors.reset}`);
    
    try {
      const { execSync } = await import('child_process');
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
      console.log(`${colors.green}Dependencies installed successfully${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}Warning: Could not install dependencies automatically${colors.reset}`);
      console.log(`${colors.yellow}Please run 'npm install' manually${colors.reset}`);
    }
  }

  showUsageInstructions() {
    console.log(`\n${colors.cyan}${colors.bright}Usage Instructions:${colors.reset}`);
    console.log(`${colors.white}================================${colors.reset}`);
    
    console.log(`\n${colors.green}Global Commands Available:${colors.reset}`);
    console.log(`  enhanced-cli  - Enhanced CLI agent with AI integration`);
    console.log(`  ecli          - Short alias for enhanced-cli`);
    console.log(`  simple-cli    - Simple CLI agent with basic tools`);
    console.log(`  scli          - Short alias for simple-cli`);
    console.log(`  gemini-cli    - Alias for enhanced-cli`);
    
    console.log(`\n${colors.green}Quick Start:${colors.reset}`);
    console.log(`  1. Start enhanced CLI: ${colors.cyan}enhanced-cli${colors.reset}`);
    console.log(`  2. Set API key: ${colors.cyan}/auth YOUR_API_KEY${colors.reset}`);
    console.log(`  3. Or use OAuth: ${colors.cyan}/login${colors.reset}`);
    console.log(`  4. Start web dashboard: ${colors.cyan}/webserver start${colors.reset}`);
    
    console.log(`\n${colors.green}Environment Variables:${colors.reset}`);
    console.log(`  GEMINI_API_KEY=your-api-key`);
    console.log(`  GOOGLE_CLIENT_ID=your-oauth-client-id`);
    console.log(`  GOOGLE_CLIENT_SECRET=your-oauth-client-secret`);
    
    console.log(`\n${colors.green}Settings Files:${colors.reset}`);
    console.log(`  Simple CLI: ${this.simpleSettingsDir}/settings.json`);
    console.log(`  Enhanced CLI: ${this.enhancedSettingsDir}/settings.json`);
    
    console.log(`\n${colors.green}Documentation:${colors.reset}`);
    console.log(`  README.md - Main documentation`);
    console.log(`  ENHANCED-FEATURES-README.md - Advanced features`);
    console.log(`  OAUTH-AUTOCOMPLETE-README.md - OAuth and autocomplete`);
    console.log(`  FINAL-FEATURES-SUMMARY.md - Complete feature summary`);
    
    console.log(`\n${colors.yellow}For OAuth setup, visit: https://console.cloud.google.com/${colors.reset}`);
    console.log(`${colors.yellow}For API key, visit: https://makersuite.google.com/app/apikey${colors.reset}`);
  }
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new SetupManager();
  setup.run();
}

export { SetupManager }; 
