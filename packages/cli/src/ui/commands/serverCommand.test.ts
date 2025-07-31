/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serverCommand } from './serverCommand.js';

describe('serverCommand', () => {
  const mockContext = {
    services: {
      config: null,
      settings: {} as any,
      git: undefined,
      logger: {} as any,
    },
    ui: {
      addItem: vi.fn(),
      clear: vi.fn(),
      setDebugMessage: vi.fn(),
      pendingItem: null,
      setPendingItem: vi.fn(),
      loadHistory: vi.fn(),
      toggleCorgiMode: vi.fn(),
      toggleVimEnabled: vi.fn(),
    },
    session: {
      stats: {} as any,
      sessionShellAllowlist: new Set<string>(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('action', () => {
    it('should start server when no action provided', async () => {
      const result = await serverCommand.action!(mockContext, '');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('✅ Web server started successfully!'),
      });
    });

    it('should start server when start action provided', async () => {
      const result = await serverCommand.action!(mockContext, 'start');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('✅ Web server started successfully!'),
      });
    });

    it('should stop server when stop action provided', async () => {
      // First start the server
      await serverCommand.action!(mockContext, 'start');
      
      // Then stop it
      const result = await serverCommand.action!(mockContext, 'stop');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: '✅ Web server stopped successfully.',
      });
    });

    it('should show status when status action provided', async () => {
      // First start the server
      await serverCommand.action!(mockContext, 'start');
      
      // Then check status
      const result = await serverCommand.action!(mockContext, 'status');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('🌐 Web Server Status:'),
      });
    });

    it('should show help when help action provided', async () => {
      const result = await serverCommand.action!(mockContext, 'help');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('📋 Web Server Commands:'),
      });
    });

    it('should show error for unknown action', async () => {
      const result = await serverCommand.action!(mockContext, 'unknown');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Unknown action: unknown'),
      });
    });

    it('should show server already running message', async () => {
      // Start server first time
      await serverCommand.action!(mockContext, 'start');
      
      // Try to start again
      const result = await serverCommand.action!(mockContext, 'start');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Web server is already running at'),
      });
    });

    it('should show server not running message for stop', async () => {
      const result = await serverCommand.action!(mockContext, 'stop');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'Web server is not running.',
      });
    });

    it('should show server not running message for status', async () => {
      const result = await serverCommand.action!(mockContext, 'status');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'Web server is not running.',
      });
    });
  });

  describe('completion', () => {
    it('should return all actions when no partial input', async () => {
      const result = await serverCommand.completion!(mockContext, '');
      
      expect(result).toEqual(['start', 'stop', 'status', 'help']);
    });

    it('should filter actions based on partial input', async () => {
      const result = await serverCommand.completion!(mockContext, 'st');
      
      expect(result).toEqual(['start', 'stop', 'status']);
    });

    it('should return empty array for non-matching input', async () => {
      const result = await serverCommand.completion!(mockContext, 'xyz');
      
      expect(result).toEqual([]);
    });
  });

  describe('command properties', () => {
    it('should have correct name and description', () => {
      expect(serverCommand.name).toBe('server');
      expect(serverCommand.altNames).toEqual(['web', 'dashboard']);
      expect(serverCommand.description).toBe('start web interface for viewing logs and managing CLI');
      expect(serverCommand.kind).toBe('built-in');
    });
  });
}); 
