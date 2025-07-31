/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
}

export const gitCommand: SlashCommand = {
  name: 'git',
  altNames: ['github', 'repo'],
  description: 'search GitHub repositories and use them in CLI',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<MessageActionReturn> => {
    const query = args.trim();

    if (!query) {
      return {
        type: 'message',
        messageType: 'error',
        content:
          'Usage: /git <search_query>\nExamples:\n  /git react\n  /git "machine learning"\n  /git user:username repo:repo-name\n  /git language:javascript stars:>1000',
      };
    }

    try {
      // Search GitHub repositories using GitHub API
      const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

      const response = await fetch(searchUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Notabot-CLI/1.0',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          return {
            type: 'message',
            messageType: 'error',
            content:
              'GitHub API rate limit exceeded. Please try again later or use a GitHub token.',
          };
        }
        return {
          type: 'message',
          messageType: 'error',
          content: `GitHub API error: ${response.status} ${response.statusText}`,
        };
      }

      const data = await response.json();
      const repos: GitHubRepo[] = data.items || [];

      if (repos.length === 0) {
        return {
          type: 'message',
          messageType: 'info',
          content: `No repositories found for query: "${query}"`,
        };
      }

      // Format the results
      let result = `🔍 **GitHub Search Results for "${query}"**\n\n`;

      repos.forEach((repo, index) => {
        const stars = repo.stargazers_count.toLocaleString();
        const language = repo.language || 'Unknown';
        const updated = new Date(repo.updated_at).toLocaleDateString();

        result += `${index + 1}. **${repo.full_name}** ⭐${stars}\n`;
        result += `   📝 ${repo.description || 'No description'}\n`;
        result += `   💻 ${language} | 📅 Updated: ${updated}\n`;
        result += `   🔗 ${repo.html_url}\n\n`;
      });

      result += `💡 **Usage Tips:**\n`;
      result += `• Use /git clone <repo-name> to clone a repository\n`;
      result += `• Use /git browse <repo-name> to open in browser\n`;
      result += `• Add language:javascript to filter by language\n`;
      result += `• Add stars:>1000 to filter by star count\n`;

      return {
        type: 'message',
        messageType: 'info',
        content: result,
      };
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Failed to search GitHub: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
  completion: async (context, partialArg) => {
    // Provide common search suggestions
    const suggestions = [
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'machine learning',
      'typescript',
      'javascript',
      'docker',
      'kubernetes',
      'language:javascript',
      'language:python',
      'stars:>1000',
      'user:facebook',
      'user:google',
      'user:microsoft',
    ];

    return suggestions
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(partialArg.toLowerCase()),
      )
      .slice(0, 10);
  },
};
