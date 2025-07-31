/**
 * Autocomplete Module for Enhanced CLI Agent
 * Provides command and tool autocomplete functionality
 */

export class AutocompleteManager {
  constructor() {
    this.commands = [
      '/help', '/quit', '/exit', '/clear', '/tools', '/history', '/settings',
      '/auth', '/debug', '/stats', '/analyze', '/context', '/reset', '/yolo',
      '/cd', '/webserver', '/readall', '/login', '/logout'
    ];
    
    this.tools = [
      'list_directory', 'read_file', 'write_file', 'run_shell_command',
      'read_all_files', 'cd', 'yolo_mode', 'code_analysis', 'web_search'
    ];
    
    this.webserverCommands = ['start', 'stop', 'status'];
    this.yoloActions = ['enable', 'disable', 'toggle'];
    
    this.commandHistory = [];
    this.toolHistory = [];
  }

  getCompletions(input, context = {}) {
    const trimmedInput = input.trim();
    
    if (trimmedInput.startsWith('/')) {
      return this.getCommandCompletions(trimmedInput, context);
    } else if (trimmedInput.startsWith('@')) {
      return this.getToolCompletions(trimmedInput, context);
    } else {
      return this.getGeneralCompletions(trimmedInput, context);
    }
  }

  getCommandCompletions(input, context) {
    const partial = input.slice(1).toLowerCase(); // Remove '/'
    const completions = [];
    
    for (const command of this.commands) {
      const cmdName = command.slice(1).toLowerCase(); // Remove '/'
      if (cmdName.startsWith(partial)) {
        completions.push(command);
      }
    }

    // Add context-specific completions
    if (partial.startsWith('web')) {
      completions.push('/webserver');
    } else if (partial.startsWith('auth')) {
      completions.push('/auth');
    } else if (partial.startsWith('cd')) {
      completions.push('/cd');
    } else if (partial.startsWith('read')) {
      completions.push('/readall');
    }

    return completions;
  }

  getToolCompletions(input, context) {
    const partial = input.slice(1).toLowerCase(); // Remove '@'
    const completions = [];
    
    for (const tool of this.tools) {
      if (tool.toLowerCase().startsWith(partial)) {
        completions.push(`@${tool}`);
      }
    }

    // Add tool-specific argument suggestions
    if (partial.startsWith('list_directory')) {
      completions.push('@list_directory path=.');
    } else if (partial.startsWith('read_file')) {
      completions.push('@read_file path=filename.txt');
    } else if (partial.startsWith('write_file')) {
      completions.push('@write_file path=file.txt content=Hello World');
    } else if (partial.startsWith('run_shell_command')) {
      completions.push('@run_shell_command command=ls -la');
    } else if (partial.startsWith('read_all_files')) {
      completions.push('@read_all_files path=. exclude=node_modules,.git');
    } else if (partial.startsWith('cd')) {
      completions.push('@cd path=../');
    } else if (partial.startsWith('yolo_mode')) {
      completions.push('@yolo_mode action=enable');
    } else if (partial.startsWith('code_analysis')) {
      completions.push('@code_analysis path=filename.js');
    }

    return completions;
  }

  getGeneralCompletions(input, context) {
    const completions = [];
    
    // Add common file extensions
    const fileExtensions = ['.js', '.ts', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.html', '.css'];
    for (const ext of fileExtensions) {
      if (input.toLowerCase().includes(ext.slice(1))) {
        completions.push(input + ext);
      }
    }

    // Add common directories
    const commonDirs = ['src', 'dist', 'build', 'node_modules', '.git', 'docs', 'tests'];
    for (const dir of commonDirs) {
      if (input.toLowerCase().includes(dir.toLowerCase())) {
        completions.push(dir);
      }
    }

    return completions;
  }

  getSubCommandCompletions(command, subCommand) {
    switch (command) {
      case '/webserver':
        return this.webserverCommands.filter(cmd => 
          cmd.toLowerCase().startsWith(subCommand.toLowerCase())
        );
      case '/yolo':
        return this.yoloActions.filter(action => 
          action.toLowerCase().startsWith(subCommand.toLowerCase())
        );
      case '/auth':
        return ['api-key', 'google', 'oauth'];
      default:
        return [];
    }
  }

  addToHistory(input) {
    if (input.startsWith('/')) {
      this.commandHistory.unshift(input);
      this.commandHistory = this.commandHistory.slice(0, 10); // Keep last 10
    } else if (input.startsWith('@')) {
      this.toolHistory.unshift(input);
      this.toolHistory = this.toolHistory.slice(0, 10); // Keep last 10
    }
  }

  getHistoryCompletions(input) {
    const allHistory = [...this.commandHistory, ...this.toolHistory];
    const partial = input.toLowerCase();
    
    return allHistory.filter(item => 
      item.toLowerCase().includes(partial)
    );
  }

  getSuggestions(input, context = {}) {
    const completions = this.getCompletions(input, context);
    const historyCompletions = this.getHistoryCompletions(input);
    
    // Combine and deduplicate
    const allSuggestions = [...new Set([...completions, ...historyCompletions])];
    
    // Sort by relevance (exact matches first, then partial)
    return allSuggestions.sort((a, b) => {
      const aExact = a.toLowerCase().startsWith(input.toLowerCase());
      const bExact = b.toLowerCase().startsWith(input.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.localeCompare(b);
    });
  }
} 
