/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';
import { SettingScope, saveSettings } from '../../config/settings.js';

export const allfilesCommand: SlashCommand = {
  name: 'allfiles',
  altNames: ['all-files'],
  description: 'toggle all files setting (include ALL files in context)',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<MessageActionReturn> => {
    const arg = args.trim().toLowerCase();
    
    // Parse the argument to determine the new value
    let newValue: boolean;
    if (arg === 'true' || arg === 'on' || arg === '1' || arg === 'yes') {
      newValue = true;
    } else if (arg === 'false' || arg === 'off' || arg === '0' || arg === 'no') {
      newValue = false;
    } else if (arg === '') {
      // Toggle current value - check if file filtering is currently restrictive
      const currentFileFiltering = context.services.settings.merged.fileFiltering;
      const isCurrentlyRestrictive = currentFileFiltering?.respectGitIgnore ?? true;
      newValue = !isCurrentlyRestrictive;
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Usage: /allfiles [true|false|on|off|yes|no]\nExamples:\n  /allfiles true    # Enable all files (disable git ignore)\n  /allfiles false   # Disable all files (enable git ignore)\n  /allfiles         # Toggle current setting',
      };
    }

    try {
      // Get current file filtering settings
      const currentFileFiltering = context.services.settings.merged.fileFiltering || {};
      
      // Update the file filtering settings
      const updatedFileFiltering = {
        ...currentFileFiltering,
        respectGitIgnore: !newValue, // When allFiles is true, we disable git ignore
        respectGeminiIgnore: !newValue, // When allFiles is true, we disable gemini ignore
      };

      // Update the setting in user scope
      context.services.settings.setValue(SettingScope.User, 'fileFiltering', updatedFileFiltering);
      
      // Save the settings
      const userSettingsFile = context.services.settings.forScope(SettingScope.User);
      saveSettings(userSettingsFile);

      const status = newValue ? 'enabled' : 'disabled';
      const explanation = newValue 
        ? 'Git and Gemini ignore files will be bypassed' 
        : 'Git and Gemini ignore files will be respected';
      
      return {
        type: 'message',
        messageType: 'info',
        content: `All files setting ${status}. ${explanation}. This change will take effect on the next restart.`,
      };
    } catch (error) {
      return {
        type: 'message',
        messageType: 'error',
        content: `Failed to update all files setting: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
  completion: async (context, partialArg) => {
    const options = ['true', 'false', 'on', 'off', 'yes', 'no'];
    return options.filter(option => 
      option.toLowerCase().includes(partialArg.toLowerCase())
    );
  },
}; 
