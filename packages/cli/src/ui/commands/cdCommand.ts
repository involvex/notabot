/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';
import * as fs from 'fs';
import path from 'path';

export const cdCommand: SlashCommand = {
  name: 'cd',
  altNames: ['chdir'],
  description:
    'change working directory (supports multiple directories and @ references)',
  kind: CommandKind.BUILT_IN,
  action: (context, args): MessageActionReturn => {
    const targetPath = args.trim();

    if (!targetPath) {
      return {
        type: 'message',
        messageType: 'error',
        content:
          'Usage: /cd <directory>\nExamples:\n  /cd /path/to/directory\n  /cd ../parent\n  /cd dir1/dir2/dir3\n  /cd ..\\..\\parent\\child\n  /cd @filename.txt (changes to directory of referenced file)',
      };
    }

    try {
      let resolvedPath: string;

      // Handle @ references - switch to directory of referenced file
      if (targetPath.startsWith('@')) {
        const filePath = targetPath.substring(1); // Remove the @ symbol

        if (!filePath) {
          return {
            type: 'message',
            messageType: 'error',
            content:
              'Usage: /cd @filename (changes to directory of referenced file)',
          };
        }

        // Resolve the file path relative to current working directory
        const normalizedFilePath = filePath.replace(/\\/g, '/');
        const fullFilePath = path.resolve(process.cwd(), normalizedFilePath);

        // Check if the file exists
        if (!fs.existsSync(fullFilePath)) {
          return {
            type: 'message',
            messageType: 'error',
            content: `Referenced file does not exist: ${filePath}`,
          };
        }

        // Get the directory of the file
        resolvedPath = path.dirname(fullFilePath);

        // Check if the directory exists (should always exist if file exists)
        if (!fs.existsSync(resolvedPath)) {
          return {
            type: 'message',
            messageType: 'error',
            content: `Directory of referenced file does not exist: ${resolvedPath}`,
          };
        }
      } else {
        // Handle regular directory paths
        // Handle multiple directory separators (both / and \)
        const normalizedPath = targetPath.replace(/\\/g, '/');

        // Resolve the path relative to current working directory
        resolvedPath = path.resolve(process.cwd(), normalizedPath);

        // Check if the path exists
        if (!fs.existsSync(resolvedPath)) {
          return {
            type: 'message',
            messageType: 'error',
            content: `Directory does not exist: ${targetPath}`,
          };
        }
      }

      // Check if it's actually a directory
      const stats = fs.statSync(resolvedPath);
      if (!stats.isDirectory()) {
        return {
          type: 'message',
          messageType: 'error',
          content: `Path is not a directory: ${targetPath}`,
        };
      }

      // Change to the directory
      process.chdir(resolvedPath);

      // Update the config's working directory if possible
      if (context.services.config) {
        // Note: Config doesn't have setTargetDir method, but the working directory change
        // will be reflected in subsequent operations
      }

      const newCwd = process.cwd();

      return {
        type: 'message',
        messageType: 'info',
        content: `Changed working directory to: ${newCwd}`,
      };
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Failed to change directory: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
  completion: async (context, partialArg) => {
    try {
      const currentDir = process.cwd();

      // If the partial argument starts with @, suggest files
      if (partialArg.startsWith('@')) {
        const filePrefix = partialArg.substring(1);
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        return items
          .filter((item) => item.isFile() || item.isDirectory())
          .map((item) => `@${item.name}`)
          .filter((name) =>
            name.toLowerCase().includes(filePrefix.toLowerCase()),
          )
          .slice(0, 10); // Limit to 10 suggestions
      } else {
        // Suggest directories for regular cd
        const items = fs.readdirSync(currentDir, { withFileTypes: true });

        return items
          .filter((item) => item.isDirectory())
          .map((item) => item.name)
          .filter((name) =>
            name.toLowerCase().includes(partialArg.toLowerCase()),
          )
          .slice(0, 10); // Limit to 10 suggestions
      }
    } catch (_error) {
      return [];
    }
  },
};
