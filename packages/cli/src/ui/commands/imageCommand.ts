/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import { isValidImageFile } from '../utils/clipboardUtils.js';

export const imageCommand: SlashCommand = {
  name: 'image',
  altNames: ['img', 'photo'],
  description:
    'add image to prompt - supports file paths, clipboard, or drag-and-drop',
  kind: CommandKind.BUILT_IN,
  action: (context, args): MessageActionReturn => {
    const imagePath = args.trim();

    if (!imagePath) {
      return {
        type: 'message',
        messageType: 'error',
        content:
          'Usage: /image <file_path>\nExamples:\n  /image screenshot.png\n  /image /path/to/image.jpg\n  /image @clipboard (to paste from clipboard)\n  Drag and drop an image file onto the CLI',
      };
    }

    // Handle clipboard image
    if (imagePath === '@clipboard' || imagePath === 'clipboard') {
      return {
        type: 'message',
        messageType: 'info',
        content:
          'Use Ctrl+V to paste an image from clipboard, or drag and drop an image file onto the CLI.',
      };
    }

    try {
      // Resolve the path relative to current working directory
      const resolvedPath = path.resolve(process.cwd(), imagePath);

      // Check if the path exists
      if (!fs.existsSync(resolvedPath)) {
        return {
          type: 'message',
          messageType: 'error',
          content: `Image file does not exist: ${imagePath}`,
        };
      }

      // Check if it's actually a file
      const stats = fs.statSync(resolvedPath);
      if (!stats.isFile()) {
        return {
          type: 'message',
          messageType: 'error',
          content: `Path is not a file: ${imagePath}`,
        };
      }

      // Validate that it's an image file
      isValidImageFile(resolvedPath).then((isValid) => {
        if (!isValid) {
          return {
            type: 'message',
            messageType: 'error',
            content: `File is not a supported image format: ${imagePath}\nSupported formats: PNG, JPEG, GIF, BMP, TIFF, WebP`,
          };
        }
      });

      // Get relative path from current directory
      const relativePath = path.relative(process.cwd(), resolvedPath);

      return {
        type: 'message',
        messageType: 'info',
        content: `Image added: ${relativePath}\nUse @${relativePath} in your prompt to include this image.`,
      };
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Failed to process image: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
  completion: async (context, partialArg) => {
    try {
      const currentDir = process.cwd();
      const items = fs.readdirSync(currentDir, { withFileTypes: true });

      const imageFiles = items
        .filter((item) => item.isFile())
        .map((item) => item.name)
        .filter((name) => {
          const ext = path.extname(name).toLowerCase();
          return [
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.bmp',
            '.tiff',
            '.webp',
          ].includes(ext);
        })
        .filter((name) => name.toLowerCase().includes(partialArg.toLowerCase()))
        .slice(0, 10); // Limit to 10 suggestions

      // Add clipboard option if partial matches
      if (
        partialArg.toLowerCase().includes('clipboard') ||
        partialArg.toLowerCase().includes('clip')
      ) {
        imageFiles.unshift('@clipboard');
      }

      return imageFiles;
    } catch (_error) {
      return [];
    }
  },
};
