#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * NotABot Database Manager
 * Handles all persistent storage for conversations, settings, and user data
 */
class NotABotDatabase {
  constructor() {
    this.dbPath = path.join(os.homedir(), '.notabot', 'notabot.db');
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Open database
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Create tables
      await this.createTables();
      this.initialized = true;
      
      console.log(`📊 Database initialized: ${this.dbPath}`);
    } catch (error) {
      console.error(`❌ Database initialization failed: ${error.message}`);
      throw error;
    }
  }

  async createTables() {
    // Conversations table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_message TEXT,
        assistant_message TEXT,
        tool_calls TEXT,
        context TEXT,
        settings TEXT,
        metadata TEXT
      )
    `);

    // Sessions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        total_messages INTEGER DEFAULT 0,
        user_messages INTEGER DEFAULT 0,
        assistant_messages INTEGER DEFAULT 0,
        tool_calls INTEGER DEFAULT 0,
        settings TEXT,
        metadata TEXT
      )
    `);

    // Settings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User profiles table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        oauth_data TEXT,
        preferences TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // Indexed files table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS indexed_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT UNIQUE NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER,
        file_type TEXT,
        content_hash TEXT,
        indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_modified DATETIME,
        metadata TEXT
      )
    `);

    // Search history table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        results_count INTEGER,
        search_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id TEXT
      )
    `);

    // Auto mode logs table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS auto_mode_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        command TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN,
        output TEXT,
        error TEXT,
        session_id TEXT
      )
    `);

    // Web server logs table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS web_server_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT,
        method TEXT,
        status_code INTEGER,
        response_time INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT,
        ip_address TEXT
      )
    `);

    // Create indexes for better performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
      CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
      CREATE INDEX IF NOT EXISTS idx_indexed_files_path ON indexed_files(file_path);
      CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
    `);
  }

  // Conversation methods
  async saveConversation(sessionId, userMessage, assistantMessage, toolCalls = null, context = null, settings = null) {
    try {
      const metadata = {
        timestamp: new Date().toISOString(),
        toolCalls: toolCalls,
        context: context,
        settings: settings
      };

      await this.db.run(`
        INSERT INTO conversations (session_id, user_message, assistant_message, tool_calls, context, settings, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        sessionId,
        userMessage,
        assistantMessage,
        toolCalls ? JSON.stringify(toolCalls) : null,
        context,
        settings ? JSON.stringify(settings) : null,
        JSON.stringify(metadata)
      ]);

      return true;
    } catch (error) {
      console.error(`❌ Failed to save conversation: ${error.message}`);
      return false;
    }
  }

  async getConversations(sessionId = null, limit = 50, offset = 0) {
    try {
      let query = `
        SELECT * FROM conversations 
        ${sessionId ? 'WHERE session_id = ?' : ''}
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
      `;
      
      const params = sessionId ? [sessionId, limit, offset] : [limit, offset];
      const rows = await this.db.all(query, params);
      
      return rows.map(row => ({
        ...row,
        tool_calls: row.tool_calls ? JSON.parse(row.tool_calls) : null,
        settings: row.settings ? JSON.parse(row.settings) : null,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));
    } catch (error) {
      console.error(`❌ Failed to get conversations: ${error.message}`);
      return [];
    }
  }

  // Session methods
  async createSession(sessionId, settings = null) {
    try {
      await this.db.run(`
        INSERT INTO sessions (session_id, settings)
        VALUES (?, ?)
      `, [sessionId, settings ? JSON.stringify(settings) : null]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to create session: ${error.message}`);
      return false;
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const { totalMessages, userMessages, assistantMessages, toolCalls, endTime } = updates;
      
      await this.db.run(`
        UPDATE sessions 
        SET total_messages = ?, user_messages = ?, assistant_messages = ?, tool_calls = ?, end_time = ?
        WHERE session_id = ?
      `, [totalMessages, userMessages, assistantMessages, toolCalls, endTime, sessionId]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to update session: ${error.message}`);
      return false;
    }
  }

  async getSessions(limit = 20) {
    try {
      const rows = await this.db.all(`
        SELECT * FROM sessions 
        ORDER BY start_time DESC 
        LIMIT ?
      `, [limit]);
      
      return rows.map(row => ({
        ...row,
        settings: row.settings ? JSON.parse(row.settings) : null
      }));
    } catch (error) {
      console.error(`❌ Failed to get sessions: ${error.message}`);
      return [];
    }
  }

  // Settings methods
  async saveSetting(key, value) {
    try {
      await this.db.run(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [key, JSON.stringify(value)]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to save setting: ${error.message}`);
      return false;
    }
  }

  async getSetting(key) {
    try {
      const row = await this.db.get(`
        SELECT value FROM settings WHERE key = ?
      `, [key]);
      
      return row ? JSON.parse(row.value) : null;
    } catch (error) {
      console.error(`❌ Failed to get setting: ${error.message}`);
      return null;
    }
  }

  async getAllSettings() {
    try {
      const rows = await this.db.all(`
        SELECT key, value FROM settings
      `);
      
      const settings = {};
      rows.forEach(row => {
        settings[row.key] = JSON.parse(row.value);
      });
      
      return settings;
    } catch (error) {
      console.error(`❌ Failed to get settings: ${error.message}`);
      return {};
    }
  }

  // User profile methods
  async saveUserProfile(email, name, oauthData = null, preferences = null) {
    try {
      await this.db.run(`
        INSERT OR REPLACE INTO user_profiles (email, name, oauth_data, preferences, last_login)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        email,
        name,
        oauthData ? JSON.stringify(oauthData) : null,
        preferences ? JSON.stringify(preferences) : null
      ]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to save user profile: ${error.message}`);
      return false;
    }
  }

  async getUserProfile(email) {
    try {
      const row = await this.db.get(`
        SELECT * FROM user_profiles WHERE email = ?
      `, [email]);
      
      if (row) {
        return {
          ...row,
          oauth_data: row.oauth_data ? JSON.parse(row.oauth_data) : null,
          preferences: row.preferences ? JSON.parse(row.preferences) : null
        };
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Failed to get user profile: ${error.message}`);
      return null;
    }
  }

  // File indexing methods
  async saveIndexedFile(filePath, fileName, fileSize, fileType, contentHash, lastModified, metadata = null) {
    try {
      await this.db.run(`
        INSERT OR REPLACE INTO indexed_files (file_path, file_name, file_size, file_type, content_hash, last_modified, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        filePath,
        fileName,
        fileSize,
        fileType,
        contentHash,
        lastModified,
        metadata ? JSON.stringify(metadata) : null
      ]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to save indexed file: ${error.message}`);
      return false;
    }
  }

  async getIndexedFiles(query = null, limit = 100) {
    try {
      let sql = `SELECT * FROM indexed_files`;
      const params = [];
      
      if (query) {
        sql += ` WHERE file_name LIKE ? OR file_path LIKE ?`;
        params.push(`%${query}%`, `%${query}%`);
      }
      
      sql += ` ORDER BY indexed_at DESC LIMIT ?`;
      params.push(limit);
      
      const rows = await this.db.all(sql, params);
      
      return rows.map(row => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));
    } catch (error) {
      console.error(`❌ Failed to get indexed files: ${error.message}`);
      return [];
    }
  }

  // Search history methods
  async saveSearchHistory(query, resultsCount, searchType, sessionId) {
    try {
      await this.db.run(`
        INSERT INTO search_history (query, results_count, search_type, session_id)
        VALUES (?, ?, ?, ?)
      `, [query, resultsCount, searchType, sessionId]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to save search history: ${error.message}`);
      return false;
    }
  }

  async getSearchHistory(limit = 20) {
    try {
      const rows = await this.db.all(`
        SELECT * FROM search_history 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      console.error(`❌ Failed to get search history: ${error.message}`);
      return [];
    }
  }

  // Auto mode logging
  async logAutoModeCommand(command, success, output = null, error = null, sessionId = null) {
    try {
      await this.db.run(`
        INSERT INTO auto_mode_logs (command, success, output, error, session_id)
        VALUES (?, ?, ?, ?, ?)
      `, [command, success, output, error, sessionId]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to log auto mode command: ${error.message}`);
      return false;
    }
  }

  async getAutoModeLogs(limit = 50) {
    try {
      const rows = await this.db.all(`
        SELECT * FROM auto_mode_logs 
        ORDER BY executed_at DESC 
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      console.error(`❌ Failed to get auto mode logs: ${error.message}`);
      return [];
    }
  }

  // Web server logging
  async logWebServerRequest(endpoint, method, statusCode, responseTime, userAgent = null, ipAddress = null) {
    try {
      await this.db.run(`
        INSERT INTO web_server_logs (endpoint, method, status_code, response_time, user_agent, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [endpoint, method, statusCode, responseTime, userAgent, ipAddress]);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to log web server request: ${error.message}`);
      return false;
    }
  }

  // Statistics methods
  async getDatabaseStats() {
    try {
      const stats = {};
      
      // Get counts for each table
      const tables = ['conversations', 'sessions', 'settings', 'user_profiles', 'indexed_files', 'search_history', 'auto_mode_logs', 'web_server_logs'];
      
      for (const table of tables) {
        const result = await this.db.get(`SELECT COUNT(*) as count FROM ${table}`);
        stats[`${table}_count`] = result.count;
      }
      
      // Get database size
      const dbStats = await this.db.get(`PRAGMA page_count`);
      const pageSize = await this.db.get(`PRAGMA page_size`);
      stats.database_size_bytes = dbStats.page_count * pageSize.page_size;
      
      // Get recent activity
      const recentConversations = await this.db.get(`
        SELECT COUNT(*) as count FROM conversations 
        WHERE timestamp > datetime('now', '-24 hours')
      `);
      stats.recent_conversations_24h = recentConversations.count;
      
      return stats;
    } catch (error) {
      console.error(`❌ Failed to get database stats: ${error.message}`);
      return {};
    }
  }

  // Cleanup methods
  async cleanupOldData(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Clean up old conversations
      await this.db.run(`
        DELETE FROM conversations 
        WHERE timestamp < ?
      `, [cutoffDate.toISOString()]);
      
      // Clean up old sessions
      await this.db.run(`
        DELETE FROM sessions 
        WHERE start_time < ?
      `, [cutoffDate.toISOString()]);
      
      // Clean up old search history
      await this.db.run(`
        DELETE FROM search_history 
        WHERE timestamp < ?
      `, [cutoffDate.toISOString()]);
      
      // Clean up old auto mode logs
      await this.db.run(`
        DELETE FROM auto_mode_logs 
        WHERE executed_at < ?
      `, [cutoffDate.toISOString()]);
      
      // Clean up old web server logs
      await this.db.run(`
        DELETE FROM web_server_logs 
        WHERE timestamp < ?
      `, [cutoffDate.toISOString()]);
      
      console.log(`🧹 Cleaned up data older than ${daysToKeep} days`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to cleanup old data: ${error.message}`);
      return false;
    }
  }

  // Backup and restore
  async backup(backupPath) {
    try {
      const backupDb = await open({
        filename: backupPath,
        driver: sqlite3.Database
      });
      
      // Copy all data to backup
      await this.db.backup(backupDb);
      await backupDb.close();
      
      console.log(`💾 Database backed up to: ${backupPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to backup database: ${error.message}`);
      return false;
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      console.log('📊 Database connection closed');
    }
  }
}

export { NotABotDatabase }; 
