/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gitCommand } from './gitCommand.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('gitCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('action', () => {
    it('should return error when no query is provided', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      const result = await gitCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Usage: /git <search_query>'),
      });
    });

    it('should handle GitHub API errors', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const result = await gitCommand.action!(mockContext, 'react');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'GitHub API rate limit exceeded. Please try again later or use a GitHub token.',
      });
    });

    it('should handle successful GitHub search', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      const mockRepos = [
        {
          name: 'react',
          full_name: 'facebook/react',
          description: 'A JavaScript library for building user interfaces',
          html_url: 'https://github.com/facebook/react',
          stargazers_count: 200000,
          language: 'JavaScript',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ items: mockRepos }),
      });

      const result = await gitCommand.action!(mockContext, 'react');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('GitHub Search Results for "react"'),
      });
    });

    it('should handle no results found', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      });

      const result = await gitCommand.action!(mockContext, 'nonexistent');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'No repositories found for query: "nonexistent"',
      });
    });

    it('should handle network errors', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await gitCommand.action!(mockContext, 'react');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: 'Failed to search GitHub: Network error',
      });
    });
  });

  describe('completion', () => {
    it('should return filtered suggestions', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      const result = await gitCommand.completion!(mockContext, 'react');

      expect(result).toContain('react');
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array for no matches', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      const result = await gitCommand.completion!(mockContext, 'xyz');

      expect(result).toEqual([]);
    });

    it('should handle case-insensitive matching', async () => {
      const mockContext = {
        services: {
          config: null,
        },
        sessionShellAllowlist: new Set<string>(),
      } as any;

      const result = await gitCommand.completion!(mockContext, 'REACT');

      expect(result).toContain('react');
    });
  });
}); 
