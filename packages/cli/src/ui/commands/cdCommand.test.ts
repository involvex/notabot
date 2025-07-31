/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cdCommand } from './cdCommand.js';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);

describe('cdCommand', () => {
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
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.cwd to return a test directory
    vi.spyOn(process, 'cwd').mockReturnValue('/test/current/dir');
    vi.spyOn(process, 'chdir').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('action', () => {
    it('should return error when no directory is provided', () => {
      const result = cdCommand.action!(mockContext, '');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Usage: /cd <directory>\nExamples:\n  /cd /path/to/directory\n  /cd ../parent\n  /cd dir1/dir2/dir3\n  /cd ..\\..\\parent\\child\n  /cd @filename.txt (changes to directory of referenced file)',
      });
    });

    it('should return error when directory does not exist', () => {
      mockPath.resolve.mockReturnValue('/test/nonexistent');
      mockFs.existsSync.mockReturnValue(false);

      const result = cdCommand.action!(mockContext, 'nonexistent');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Directory does not exist: nonexistent',
      });
    });

    it('should return error when path is not a directory', () => {
      mockPath.resolve.mockReturnValue('/test/file.txt');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => false,
      } as fs.Stats);

      const result = cdCommand.action!(mockContext, 'file.txt');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Path is not a directory: file.txt',
      });
    });

    it('should successfully change directory', () => {
      const targetDir = '/test/new/directory';
      mockPath.resolve.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, 'new/directory');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle relative paths', () => {
      const targetDir = '/test/current/dir/subdir';
      mockPath.resolve.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, 'subdir');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle multiple directory paths', () => {
      const targetDir = '/test/current/dir/dir1/dir2/dir3';
      mockPath.resolve.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, 'dir1/dir2/dir3');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle Windows-style backslash paths', () => {
      const targetDir = '/test/current/dir/parent/child';
      mockPath.resolve.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, 'parent\\child');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle mixed path separators', () => {
      const targetDir = '/test/current/dir/mixed/path';
      mockPath.resolve.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, 'mixed\\path');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle parent directory navigation with multiple levels', () => {
      const targetDir = '/test/parent/grandparent';
      mockPath.resolve.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, '../../parent');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    // New tests for @ reference functionality
    it('should return error when @ reference has no filename', () => {
      const result = cdCommand.action!(mockContext, '@');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Usage: /cd @filename (changes to directory of referenced file)',
      });
    });

    it('should return error when @ referenced file does not exist', () => {
      mockPath.resolve.mockReturnValue('/test/current/dir/nonexistent.txt');
      mockFs.existsSync.mockReturnValue(false);

      const result = cdCommand.action!(mockContext, '@nonexistent.txt');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Referenced file does not exist: nonexistent.txt',
      });
    });

    it('should successfully change to directory of @ referenced file', () => {
      const filePath = '/test/current/dir/subdir/file.txt';
      const targetDir = '/test/current/dir/subdir';
      
      mockPath.resolve.mockReturnValue(filePath);
      mockPath.dirname.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, '@file.txt');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle @ reference with relative path', () => {
      const filePath = '/test/current/dir/subdir/file.txt';
      const targetDir = '/test/current/dir/subdir';
      
      mockPath.resolve.mockReturnValue(filePath);
      mockPath.dirname.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, '@subdir/file.txt');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle @ reference with Windows-style path', () => {
      const filePath = '/test/current/dir/subdir/file.txt';
      const targetDir = '/test/current/dir/subdir';
      
      mockPath.resolve.mockReturnValue(filePath);
      mockPath.dirname.mockReturnValue(targetDir);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.spyOn(process, 'cwd').mockReturnValue(targetDir);

      const result = cdCommand.action!(mockContext, '@subdir\\file.txt');
      
      expect(process.chdir).toHaveBeenCalledWith(targetDir);
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${targetDir}`,
      });
    });

    it('should handle errors gracefully', () => {
      mockPath.resolve.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = cdCommand.action!(mockContext, 'restricted');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Failed to change directory: Permission denied',
      });
    });
  });

  describe('completion', () => {
    it('should return directory suggestions for regular cd', async () => {
      const mockItems = [
        { name: 'dir1', isDirectory: () => true },
        { name: 'dir2', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false },
        { name: 'dir3', isDirectory: () => true },
      ];

      mockFs.readdirSync.mockReturnValue(mockItems as fs.Dirent[]);

      const result = await cdCommand.completion!(mockContext, 'dir');
      
      expect(result).toEqual(['dir1', 'dir2', 'dir3']);
    });

    it('should return file suggestions for @ references', async () => {
      const mockItems = [
        { name: 'dir1', isDirectory: () => true },
        { name: 'file1.txt', isDirectory: () => false },
        { name: 'file2.txt', isDirectory: () => false },
        { name: 'dir2', isDirectory: () => true },
      ];

      mockFs.readdirSync.mockReturnValue(mockItems as fs.Dirent[]);

      const result = await cdCommand.completion!(mockContext, '@file');
      
      expect(result).toEqual(['@file1.txt', '@file2.txt']);
    });

    it('should return both files and directories for @ references', async () => {
      const mockItems = [
        { name: 'dir1', isDirectory: () => true },
        { name: 'file1.txt', isDirectory: () => false },
        { name: 'dir2', isDirectory: () => true },
        { name: 'file2.txt', isDirectory: () => false },
      ];

      mockFs.readdirSync.mockReturnValue(mockItems as fs.Dirent[]);

      const result = await cdCommand.completion!(mockContext, '@');
      
      expect(result).toEqual(['@dir1', '@dir2', '@file1.txt', '@file2.txt']);
    });

    it('should filter suggestions based on partial input', async () => {
      const mockItems = [
        { name: 'project1', isDirectory: () => true },
        { name: 'project2', isDirectory: () => true },
        { name: 'other', isDirectory: () => true },
      ];

      mockFs.readdirSync.mockReturnValue(mockItems as fs.Dirent[]);

      const result = await cdCommand.completion!(mockContext, 'proj');
      
      expect(result).toEqual(['project1', 'project2']);
    });

    it('should limit suggestions to 10 items', async () => {
      const mockItems = Array.from({ length: 15 }, (_, i) => ({
        name: `dir${i}`,
        isDirectory: () => true,
      }));

      mockFs.readdirSync.mockReturnValue(mockItems as fs.Dirent[]);

      const result = await cdCommand.completion!(mockContext, '');
      
      expect(result).toHaveLength(10);
    });

    it('should return empty array on error', async () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await cdCommand.completion!(mockContext, '');
      
      expect(result).toEqual([]);
    });
  });

  describe('command properties', () => {
    it('should have correct name and description', () => {
      expect(cdCommand.name).toBe('cd');
      expect(cdCommand.altNames).toEqual(['chdir']);
      expect(cdCommand.description).toBe('change working directory (supports multiple directories and @ references)');
      expect(cdCommand.kind).toBe('built-in');
    });
  });
}); 
