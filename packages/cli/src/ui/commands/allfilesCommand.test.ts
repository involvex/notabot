/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { allfilesCommand } from './allfilesCommand.js';
import { SettingScope } from '../../config/settings.js';

describe('allfilesCommand', () => {
  const mockContext = {
    services: {
      config: null,
      settings: {
        merged: {
          fileFiltering: {
            respectGitIgnore: true,
            respectGeminiIgnore: true,
          },
        },
        setValue: vi.fn(),
        forScope: vi.fn(() => ({
          path: '/test/settings.json',
          settings: {},
        })),
      } as Record<string, unknown>,
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
    it('should enable all files when true is provided', async () => {
      const result = await allfilesCommand.action!(mockContext, 'true');

      expect(mockContext.services.settings.setValue).toHaveBeenCalledWith(
        SettingScope.User,
        'fileFiltering',
        {
          respectGitIgnore: false,
          respectGeminiIgnore: false,
        },
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content:
          'All files setting enabled. Git and Gemini ignore files will be bypassed. This change will take effect on the next restart.',
      });
    });

    it('should disable all files when false is provided', async () => {
      const result = await allfilesCommand.action!(mockContext, 'false');

      expect(mockContext.services.settings.setValue).toHaveBeenCalledWith(
        SettingScope.User,
        'fileFiltering',
        {
          respectGitIgnore: true,
          respectGeminiIgnore: true,
        },
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content:
          'All files setting disabled. Git and Gemini ignore files will be respected. This change will take effect on the next restart.',
      });
    });

    it('should toggle current setting when no argument is provided', async () => {
      const result = await allfilesCommand.action!(mockContext, '');

      expect(mockContext.services.settings.setValue).toHaveBeenCalledWith(
        SettingScope.User,
        'fileFiltering',
        {
          respectGitIgnore: true,
          respectGeminiIgnore: true,
        },
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content:
          'All files setting disabled. Git and Gemini ignore files will be respected. This change will take effect on the next restart.',
      });
    });

    it('should handle various true values', async () => {
      const trueValues = ['on', '1', 'yes'];

      for (const value of trueValues) {
        vi.clearAllMocks();
        const result = await allfilesCommand.action!(mockContext, value);

        expect(mockContext.services.settings.setValue).toHaveBeenCalledWith(
          SettingScope.User,
          'fileFiltering',
          {
            respectGitIgnore: false,
            respectGeminiIgnore: false,
          },
        );

        expect(result).toMatchObject({
          type: 'message',
          messageType: 'info',
        });
        expect(result.content).toContain('enabled');
      }
    });

    it('should handle various false values', async () => {
      const falseValues = ['off', '0', 'no'];

      for (const value of falseValues) {
        vi.clearAllMocks();
        const result = await allfilesCommand.action!(mockContext, value);

        expect(mockContext.services.settings.setValue).toHaveBeenCalledWith(
          SettingScope.User,
          'fileFiltering',
          {
            respectGitIgnore: true,
            respectGeminiIgnore: true,
          },
        );

        expect(result).toMatchObject({
          type: 'message',
          messageType: 'info',
        });
        expect(result.content).toContain('disabled');
      }
    });

    it('should return error for invalid arguments', async () => {
      const result = await allfilesCommand.action!(mockContext, 'invalid');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content:
          'Usage: /allfiles [true|false|on|off|yes|no]\nExamples:\n  /allfiles true    # Enable all files (disable git ignore)\n  /allfiles false   # Disable all files (enable git ignore)\n  /allfiles         # Toggle current setting',
      });
    });

    it('should handle missing fileFiltering settings', async () => {
      mockContext.services.settings.merged.fileFiltering = undefined;

      const result = await allfilesCommand.action!(mockContext, 'true');

      expect(mockContext.services.settings.setValue).toHaveBeenCalledWith(
        SettingScope.User,
        'fileFiltering',
        {
          respectGitIgnore: false,
          respectGeminiIgnore: false,
        },
      );

      expect(result).toMatchObject({
        type: 'message',
        messageType: 'info',
      });
    });
  });

  describe('completion', () => {
    it('should return completion options', async () => {
      const result = await allfilesCommand.completion!(mockContext, 't');

      expect(result).toEqual(['true']);
    });

    it('should filter options based on partial input', async () => {
      const result = await allfilesCommand.completion!(mockContext, 'f');

      expect(result).toEqual(['false', 'off']);
    });

    it('should return all options for empty input', async () => {
      const result = await allfilesCommand.completion!(mockContext, '');

      expect(result).toEqual(['true', 'false', 'on', 'off', 'yes', 'no']);
    });
  });

  describe('command properties', () => {
    it('should have correct name and description', () => {
      expect(allfilesCommand.name).toBe('allfiles');
      expect(allfilesCommand.altNames).toEqual(['all-files']);
      expect(allfilesCommand.description).toBe(
        'toggle all files setting (include ALL files in context)',
      );
      expect(allfilesCommand.kind).toBe('built-in');
    });
  });
});
