/**
 * Modal Database System for Enhanced CLI Agents
 * Provides file indexing, prompt memory, and history tracking
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ModalDatabase {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(process.env.HOME || process.env.USERPROFILE, '.enhanced-cli', 'modal-db.json');
    this.data = {
      files: {},           // File index with metadata
      prompts: {},         // Prompt history with responses
      history: [],         // Session history
      indexes: {},         // Search indexes
      stats: {             // Usage statistics
        totalPrompts: 0,
        totalFiles: 0,
        lastUsed: null,
        sessions: []
      }
    };
    this.loadDatabase();
  }

  /**
   * Load database from file
   */
  loadDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf8');
        this.data = { ...this.data, ...JSON.parse(data) };
        console.log(`📊 Modal DB loaded: ${this.data.stats.totalPrompts} prompts, ${this.data.stats.totalFiles} files`);
      } else {
        this.saveDatabase();
      }
    } catch (error) {
      console.error('Error loading modal database:', error);
      this.saveDatabase();
    }
  }

  /**
   * Save database to file
   */
  saveDatabase() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      this.data.stats.lastUsed = new Date().toISOString();
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving modal database:', error);
    }
  }

  /**
   * Index a file with metadata
   */
  async indexFile(filePath, content = null) {
    try {
      const stats = fs.statSync(filePath);
      const hash = this.generateFileHash(filePath);
      
      // Read content if not provided
      if (!content) {
        content = fs.readFileSync(filePath, 'utf8');
      }

      const fileData = {
        path: filePath,
        name: path.basename(filePath),
        extension: path.extname(filePath),
        size: stats.size,
        modified: stats.mtime.toISOString(),
        hash: hash,
        content: content.substring(0, 10000), // Store first 10KB for search
        lines: content.split('\n').length,
        language: this.detectLanguage(filePath),
        tags: this.extractTags(content),
        lastAccessed: new Date().toISOString()
      };

      this.data.files[filePath] = fileData;
      this.data.stats.totalFiles = Object.keys(this.data.files).length;
      
      // Update search index
      this.updateSearchIndex(filePath, fileData);
      
      this.saveDatabase();
      return fileData;
    } catch (error) {
      console.error(`Error indexing file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Index all files in a directory
   */
  async indexDirectory(dirPath, excludePatterns = []) {
    try {
      const files = await this.scanDirectory(dirPath, excludePatterns);
      const results = [];
      
      console.log(`📁 Found ${files.length} files to index...`);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const indexed = await this.indexFile(file);
          if (indexed) {
            results.push(indexed);
          }
          
          // Progress indicator
          if ((i + 1) % 10 === 0 || i === files.length - 1) {
            console.log(`📁 Indexed ${i + 1}/${files.length} files...`);
          }
        } catch (error) {
          console.error(`Error indexing ${file}:`, error.message);
        }
      }
      
      console.log(`📁 Indexed ${results.length} files in ${dirPath}`);
      return results;
    } catch (error) {
      console.error(`Error indexing directory ${dirPath}:`, error.message);
      return [];
    }
  }

  /**
   * Scan directory for files
   */
  async scanDirectory(dirPath, excludePatterns = []) {
    const files = [];
    
    function scan(currentPath) {
      try {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
          const fullPath = path.join(currentPath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Check if directory should be excluded
            const shouldExclude = excludePatterns.some(pattern => 
              fullPath.includes(pattern) || item === pattern
            );
            
            if (!shouldExclude) {
              scan(fullPath);
            }
          } else if (stat.isFile()) {
            // Check if file should be excluded
            const shouldExclude = excludePatterns.some(pattern => 
              fullPath.includes(pattern) || item === pattern
            );
            
            if (!shouldExclude) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${currentPath}:`, error);
      }
    }
    
    scan(dirPath);
    return files;
  }

  /**
   * Store a prompt with its response
   */
  storePrompt(prompt, response, context = {}) {
    const promptId = this.generatePromptId(prompt);
    const timestamp = new Date().toISOString();
    
    const promptData = {
      id: promptId,
      prompt: prompt,
      response: response,
      timestamp: timestamp,
      context: {
        currentDirectory: process.cwd(),
        ...context
      },
      metadata: {
        promptLength: prompt.length,
        responseLength: response.length,
        hasCode: this.containsCode(response),
        hasFiles: this.containsFileReferences(response)
      }
    };

    this.data.prompts[promptId] = promptData;
    this.data.stats.totalPrompts = Object.keys(this.data.prompts).length;
    
    // Add to history
    this.data.history.push({
      type: 'prompt',
      id: promptId,
      timestamp: timestamp,
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : '')
    });
    
    this.saveDatabase();
    return promptId;
  }

  /**
   * Search for similar prompts
   */
  searchPrompts(query, limit = 5) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [id, promptData] of Object.entries(this.data.prompts)) {
      const promptLower = promptData.prompt.toLowerCase();
      const responseLower = promptData.response.toLowerCase();
      
      // Calculate relevance score
      let score = 0;
      
      // Exact matches
      if (promptLower.includes(queryLower)) score += 10;
      if (responseLower.includes(queryLower)) score += 5;
      
      // Word matches
      const queryWords = queryLower.split(' ');
      const promptWords = promptLower.split(' ');
      const responseWords = responseLower.split(' ');
      
      for (const word of queryWords) {
        if (promptWords.includes(word)) score += 2;
        if (responseWords.includes(word)) score += 1;
      }
      
      if (score > 0) {
        results.push({
          id,
          score,
          prompt: promptData.prompt,
          response: promptData.response,
          timestamp: promptData.timestamp,
          metadata: promptData.metadata
        });
      }
    }
    
    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Search for files by content
   */
  searchFiles(query, limit = 10) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [filePath, fileData] of Object.entries(this.data.files)) {
      let score = 0;
      
      // File name match
      if (fileData.name.toLowerCase().includes(queryLower)) score += 5;
      
      // Content match
      if (fileData.content.toLowerCase().includes(queryLower)) score += 3;
      
      // Tag match
      for (const tag of fileData.tags) {
        if (tag.toLowerCase().includes(queryLower)) score += 2;
      }
      
      if (score > 0) {
        results.push({
          path: filePath,
          score,
          name: fileData.name,
          language: fileData.language,
          size: fileData.size,
          modified: fileData.modified,
          tags: fileData.tags
        });
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get recent history
   */
  getRecentHistory(limit = 20) {
    return this.data.history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      ...this.data.stats,
      recentPrompts: this.data.history.filter(h => h.type === 'prompt').length,
      indexedFiles: Object.keys(this.data.files).length,
      databaseSize: JSON.stringify(this.data).length
    };
  }

  getAllIndexedFiles(limit = 100) {
    const files = Object.values(this.data.files);
    return files
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, limit)
      .map(file => ({
        path: file.path,
        name: file.name,
        extension: file.extension,
        size: file.size,
        language: file.language,
        lines: file.lines,
        modified: file.modified,
        lastAccessed: file.lastAccessed
      }));
  }

  /**
   * Get file by path
   */
  getFile(filePath) {
    return this.data.files[filePath] || null;
  }

  /**
   * Get prompt by ID
   */
  getPrompt(promptId) {
    return this.data.prompts[promptId] || null;
  }

  /**
   * Update file access time
   */
  updateFileAccess(filePath) {
    if (this.data.files[filePath]) {
      this.data.files[filePath].lastAccessed = new Date().toISOString();
      this.saveDatabase();
    }
  }

  /**
   * Add session data
   */
  addSession(sessionData) {
    const session = {
      id: crypto.randomUUID(),
      startTime: new Date().toISOString(),
      ...sessionData
    };
    
    this.data.stats.sessions.push(session);
    this.data.history.push({
      type: 'session',
      id: session.id,
      timestamp: session.startTime,
      data: sessionData
    });
    
    this.saveDatabase();
    return session.id;
  }

  /**
   * Generate file hash
   */
  generateFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return crypto.randomUUID();
    }
  }

  /**
   * Generate prompt ID
   */
  generatePromptId(prompt) {
    return crypto.createHash('md5').update(prompt).digest('hex');
  }

  /**
   * Detect programming language
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown',
      '.txt': 'Text',
      '.sql': 'SQL',
      '.sh': 'Shell',
      '.ps1': 'PowerShell',
      '.bat': 'Batch',
      '.dockerfile': 'Dockerfile',
      '.gitignore': 'Git',
      '.env': 'Environment'
    };
    
    return languageMap[ext] || 'Unknown';
  }

  /**
   * Extract tags from content
   */
  extractTags(content) {
    const tags = new Set();
    
    // Extract common patterns
    const patterns = [
      /function\s+(\w+)/g,           // Function names
      /class\s+(\w+)/g,              // Class names
      /const\s+(\w+)/g,              // Constants
      /let\s+(\w+)/g,                // Variables
      /var\s+(\w+)/g,                // Variables
      /import\s+.*?from\s+['"]([^'"]+)['"]/g,  // Imports
      /require\s*\(\s*['"]([^'"]+)['"]/g,      // Requires
      /#\s*(\w+)/g,                  // Comments
      /\/\/\s*(\w+)/g,               // Comments
      /\/\*\s*(\w+)/g                // Comments
    ];
    
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 2) {
            tags.add(match.toLowerCase());
          }
        });
      }
    }
    
    return Array.from(tags);
  }

  /**
   * Update search index
   */
  updateSearchIndex(filePath, fileData) {
    const words = fileData.content.toLowerCase().split(/\s+/);
    const wordCount = {};
    
    words.forEach(word => {
      if (word.length > 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    this.data.indexes[filePath] = {
      words: wordCount,
      language: fileData.language,
      tags: fileData.tags
    };
  }

  /**
   * Check if response contains code
   */
  containsCode(response) {
    return /```[\s\S]*```/.test(response) || /`[^`]+`/.test(response);
  }

  /**
   * Check if response contains file references
   */
  containsFileReferences(response) {
    return /\.(js|ts|py|java|cpp|c|cs|php|rb|go|rs|swift|kt|scala|html|css|json|xml|yaml|yml|md|txt|sql|sh|ps1|bat)$/i.test(response);
  }

  /**
   * Clear old data
   */
  cleanup(maxAge = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAge);
    
    // Clean up old prompts
    const oldPrompts = [];
    for (const [id, promptData] of Object.entries(this.data.prompts)) {
      if (new Date(promptData.timestamp) < cutoff) {
        oldPrompts.push(id);
      }
    }
    
    oldPrompts.forEach(id => delete this.data.prompts[id]);
    
    // Clean up old history
    this.data.history = this.data.history.filter(item => 
      new Date(item.timestamp) >= cutoff
    );
    
    // Clean up old sessions
    this.data.stats.sessions = this.data.stats.sessions.filter(session => 
      new Date(session.startTime) >= cutoff
    );
    
    this.data.stats.totalPrompts = Object.keys(this.data.prompts).length;
    this.saveDatabase();
    
    console.log(`🧹 Cleaned up ${oldPrompts.length} old prompts and history`);
  }

  /**
   * Export database
   */
  exportDatabase() {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: this.data
    };
  }

  /**
   * Import database
   */
  importDatabase(data) {
    if (data.version && data.data) {
      this.data = { ...this.data, ...data.data };
      this.saveDatabase();
      console.log('📥 Database imported successfully');
      return true;
    }
    return false;
  }
} 
