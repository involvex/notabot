/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';
import { ApprovalMode } from '@google/gemini-cli-core';

export const yoloCommand: SlashCommand = {
  name: 'yolo',
  description: 'show YOLO mode status and instructions',
  kind: CommandKind.BUILT_IN,
  action: async (context, args): Promise<MessageActionReturn> => {
    const arg = args.trim().toLowerCase();
    
    if (arg === '') {
      // Show current status and instructions
      const currentMode = context.services.config?.getApprovalMode() || ApprovalMode.DEFAULT;
      const isYoloMode = currentMode === ApprovalMode.YOLO;
      
      const status = isYoloMode ? 'enabled' : 'disabled';
      const explanation = isYoloMode 
        ? 'All actions are automatically accepted without confirmation'
        : 'Actions require user confirmation before execution';
      
      return {
        type: 'message',
        messageType: 'info',
        content: `YOLO mode is currently ${status}. ${explanation}.\n\nTo change YOLO mode, restart notabot with:\n  notabot --yolo          # Enable YOLO mode\n  notabot --no-yolo       # Disable YOLO mode`,
      };
    } else {
      return {
        type: 'message',
        messageType: 'error',
        content: 'Usage: /yolo\n\nYOLO mode can only be changed by restarting notabot with the --yolo or --no-yolo flag.',
      };
    }
  },
  completion: async (_context, _partialArg) => [],
}; 
