/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { yoloCommand } from './yoloCommand.js';
import { ApprovalMode } from '@google/gemini-cli-core';

describe('yoloCommand', () => {
  const mockContext = {
    services: {
      config: {
        getApprovalMode: vi.fn(() => ApprovalMode.DEFAULT),
      },
      settings: {} as Record<string, unknown>,
      git: undefined,
      logger: {} as Record<string, unknown>,
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
      stats: {} as Record<string, unknown>,
      sessionShellAllowlist: new Set<string>(),
    },
  } as Record<string, unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('action', () => {
    it('should show yolo mode status when no argument is provided', async () => {
      const result = await yoloCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content:
          'YOLO mode is currently disabled. Actions require user confirmation before execution.\n\nTo change YOLO mode, restart notabot with:\n  notabot --yolo          # Enable YOLO mode\n  notabot --no-yolo       # Disable YOLO mode',
      });
    });

    it('should show enabled status when yolo mode is active', async () => {
      mockContext.services.config.getApprovalMode = vi.fn(
        () => ApprovalMode.YOLO,
      );

      const result = await yoloCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content:
          'YOLO mode is currently enabled. All actions are automatically accepted without confirmation.\n\nTo change YOLO mode, restart notabot with:\n  notabot --yolo          # Enable YOLO mode\n  notabot --no-yolo       # Disable YOLO mode',
      });
    });

    it('should return error for invalid arguments', async () => {
      const result = await yoloCommand.action!(mockContext, 'invalid');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content:
          'Usage: /yolo\n\nYOLO mode can only be changed by restarting notabot with the --yolo or --no-yolo flag.',
      });
    });

    it('should handle missing config', async () => {
      mockContext.services.config = null;

      const result = await yoloCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content:
          'YOLO mode is currently disabled. Actions require user confirmation before execution.\n\nTo change YOLO mode, restart notabot with:\n  notabot --yolo          # Enable YOLO mode\n  notabot --no-yolo       # Disable YOLO mode',
      });
    });
  });

  describe('completion', () => {
    it('should return empty array', async () => {
      const result = await yoloCommand.completion!(mockContext, '');

      expect(result).toEqual([]);
    });
  });

  describe('command properties', () => {
    it('should have correct name and description', () => {
      expect(yoloCommand.name).toBe('yolo');
      expect(yoloCommand.description).toBe(
        'show YOLO mode status and instructions',
      );
      expect(yoloCommand.kind).toBe('built-in');
    });
  });
});
