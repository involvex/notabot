# Notabot CLI Setup Guide

This guide helps you set up Notabot CLI to work from any directory with proper API key configuration and themes.

## Quick Setup

### Option 1: Using PowerShell Script
```powershell
.\setup-notabot.ps1 "YOUR_GEMINI_API_KEY" "theme_name"
```

### Option 2: Using Batch File
```cmd
setup-notabot.bat "YOUR_GEMINI_API_KEY" "theme_name"
```

### Option 3: Manual Setup

1. **Create settings directory:**
   ```powershell
   mkdir $env:USERPROFILE\.gemini
   ```

2. **Create settings.json:**
   ```powershell
   $settings = @{
       selectedAuthType = "gemini-api-key"
       geminiApiKey = "YOUR_GEMINI_API_KEY"
       theme = "default"
       editor = "not_set"
   } | ConvertTo-Json
   
   Set-Content -Path "$env:USERPROFILE\.gemini\settings.json" -Value $settings
   ```

3. **Set environment variable:**
   ```powershell
   $env:GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
   ```

## Available Themes

- `default` - Default theme
- `dracula` - Dracula theme
- `github` - GitHub theme
- `atom-one-dark` - Atom One Dark
- `ayu` - Ayu theme
- `xcode` - Xcode theme
- `googlecode` - Google Code theme
- `shades-of-purple` - Shades of Purple
- `no-color` - No colors

## Usage Examples

### Interactive Mode
```bash
notabot-full
```

### Non-Interactive Mode
```bash
notabot-full -p "Hello world"
```

### With Custom Theme
```bash
notabot-full --theme dracula
```

### From Any Directory
```bash
cd C:\
notabot-full -p "List files in current directory"
```

## Troubleshooting

### Issue: "No API key found"
**Solution:** Make sure your API key is set in the settings file:
```powershell
type $env:USERPROFILE\.gemini\settings.json
```

### Issue: "No tools available"
**Solution:** The settings file should NOT have `coreTools` set. If it does, remove it:
```json
{
  "selectedAuthType": "gemini-api-key",
  "geminiApiKey": "YOUR_API_KEY",
  "theme": "default"
}
```

### Issue: "Theme not found"
**Solution:** Use one of the available themes listed above.

## File Locations

- **Settings:** `%USERPROFILE%\.gemini\settings.json`
- **Global installation:** Available via `notabot-full` command
- **Project installation:** Available via `npm run start` or `node bundle/gemini.js`

## Features

✅ **Works from any directory** - Configured globally  
✅ **All tools enabled** - File system, web search, shell commands, etc.  
✅ **Theme support** - Multiple themes available  
✅ **API key persistence** - Stored in user settings  
✅ **Environment variable support** - `GEMINI_API_KEY`  

## Next Steps

1. Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Run the setup script with your API key
3. Test Notabot from different directories
4. Enjoy using all the available tools!

## Commands

- `notabot-full` - Full Notabot CLI
- `notabot` - Alias for Notabot CLI  
- `gemini` - Original Gemini CLI 
