/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { imageCommand } from './imageCommand.js';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
vi.mock('fs');
vi.mock('path');

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);

describe('imageCommand', () => {
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
    // Mock process.cwd to return a test directory
    vi.spyOn(process, 'cwd').mockReturnValue('/test/current/dir');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('action', () => {
    it('should return usage help when no arguments provided', () => {
      const result = imageCommand.action!(mockContext, '');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Usage: /image <file_path>\nExamples:\n  /image screenshot.png\n  /image /path/to/image.jpg\n  /image @clipboard (to paste from clipboard)\n  Drag and drop an image file onto the CLI',
      });
    });

    it('should handle clipboard reference', () => {
      const result = imageCommand.action!(mockContext, '@clipboard');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'Use Ctrl+V to paste an image from clipboard, or drag and drop an image file onto the CLI.',
      });
    });

    it('should handle clipboard reference without @', () => {
      const result = imageCommand.action!(mockContext, 'clipboard');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'Use Ctrl+V to paste an image from clipboard, or drag and drop an image file onto the CLI.',
      });
    });

    it('should return error when image file does not exist', () => {
      mockPath.resolve.mockReturnValue('/test/nonexistent.png');
      mockFs.existsSync.mockReturnValue(false);

      const result = imageCommand.action!(mockContext, 'nonexistent.png');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Image file does not exist: nonexistent.png',
      });
    });

    it('should return error when path is not a file', () => {
      mockPath.resolve.mockReturnValue('/test/directory');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isFile: () => false,
      } as any);

      const result = imageCommand.action!(mockContext, 'directory');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Path is not a file: directory',
      });
    });

    it('should successfully process valid image file', () => {
      const imagePath = '/test/current/dir/image.png';
      mockPath.resolve.mockReturnValue(imagePath);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
      } as any);
      mockPath.relative.mockReturnValue('image.png');

      const result = imageCommand.action!(mockContext, 'image.png');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'Image added: image.png\nUse @image.png in your prompt to include this image.',
      });
    });

    it('should handle errors gracefully', () => {
      mockPath.resolve.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = imageCommand.action!(mockContext, 'restricted.png');
      
      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Failed to process image: Permission denied',
      });
    });
  });

  describe('completion', () => {
    it('should return image file suggestions', async () => {
      const mockItems = [
        { name: 'image1.png', isFile: () => true },
        { name: 'image2.jpg', isFile: () => true },
        { name: 'text.txt', isFile: () => true },
        { name: 'image3.gif', isFile: () => true },
      ];

      mockFs.readdirSync.mockReturnValue(mockItems as any);

      const result = await imageCommand.completion!(mockContext, 'image');
      
      expect(result).toEqual(['image1.png', 'image2.jpg', 'image3.gif']);
    });

    it('should filter suggestions based on partial input', async () => {
      const mockItems = [
        { name: 'screenshot.png', isFile: () => true },
        { name: 'photo.jpg', isFile: () => true },
        { name: 'other.txt', isFile: () => true },
      ];

      mockFs.readdirSync.mockReturnValue(mockItems as any);

      const result = await imageCommand.completion!(mockContext, 'screen');
      
      expect(result).toEqual(['screenshot.png']);
    });

    it('should include clipboard option when partial matches', async () => {
      const mockItems = [
        { name: 'image.png', isFile: () => true },
      ];

      mockFs.readdirSync.mockReturnValue(mockItems as any);

      const result = await imageCommand.completion!(mockContext, 'clip');
      
      expect(result).toEqual(['@clipboard', 'image.png']);
    });

    it('should limit suggestions to 10 items', async () => {
      const mockItems = Array.from({ length: 15 }, (_, i) => ({
        name: `image${i}.png`,
        isFile: () => true,
      }));

      mockFs.readdirSync.mockReturnValue(mockItems as any);

      const result = await imageCommand.completion!(mockContext, '');
      
      expect(result).toHaveLength(10);
    });

    it('should return empty array on error', async () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = await imageCommand.completion!(mockContext, '');
      
      expect(result).toEqual([]);
    });
  });

  describe('command properties', () => {
    it('should have correct name and description', () => {
      expect(imageCommand.name).toBe('image');
      expect(imageCommand.altNames).toEqual(['img', 'photo']);
      expect(imageCommand.description).toBe('add image to prompt - supports file paths, clipboard, or drag-and-drop');
      expect(imageCommand.kind).toBe('built-in');
    });
  });
}); 
