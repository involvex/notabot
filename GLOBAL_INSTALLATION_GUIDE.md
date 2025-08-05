# 🔧 NotABot Global Installation Guide

## ✅ **Updating Your Global Installation**

Your NotABot global installation has been updated with the latest settings and features. Here's how to ensure you have the most current version:

## 🚀 **Quick Update Commands**

### **Option 1: Force Reinstall (Recommended)**
```bash
# Navigate to your project directory
cd D:\repos\gemini-cli

# Force reinstall the global package
npm install -g . --force

# Run setup to ensure all settings are configured
npm run setup
```

### **Option 2: Uninstall and Reinstall**
```bash
# Uninstall current version
npm uninstall -g notabot

# Install latest version
npm install -g .

# Run setup
npm run setup
```

### **Option 3: Using Test Scripts**
```bash
# Run the PowerShell test script
.\test-install.ps1

# Or run the batch file
.\test-install.bat
```

## 📋 **What's Updated**

### ✅ **Package Configuration**
- **Repository URLs**: Updated to point to your GitHub repository
- **Author**: Set to "involvex"
- **Version**: Updated to 1.0.0
- **Bin Entries**: `notabot`, `nb`, `simple-cli`, `scli`

### ✅ **Global Commands Available**
```bash
notabot    # Main CLI agent
nb         # Short alias for notabot
simple-cli # Simple CLI version
scli       # Short alias for simple-cli
```

### ✅ **Settings and Configuration**
- **Database**: SQLite with persistent storage
- **OAuth**: Google authentication integration
- **Web Dashboard**: Real-time monitoring interface
- **Auto Mode**: Background automation
- **Tool System**: File operations and shell commands

## 🧪 **Testing Your Installation**

### **Test 1: Check Global Installation**
```bash
# Check if notabot is installed globally
npm list -g notabot

# Check available commands
where notabot
```

### **Test 2: Run NotABot**
```bash
# Start NotABot
notabot

# Or use the short alias
nb
```

### **Test 3: Check Settings**
```bash
# Start NotABot and check settings
notabot
/settings
```

## 🔧 **Troubleshooting**

### **Issue: Command Not Found**
```bash
# Check if npm global bin is in PATH
npm config get prefix

# Add to PATH if needed (Windows)
set PATH=%PATH%;%APPDATA%\npm

# Or reinstall with explicit path
npm install -g . --prefix %APPDATA%\npm
```

### **Issue: Permission Errors**
```bash
# Run as administrator (Windows)
# Right-click PowerShell and "Run as Administrator"

# Or use npx for testing
npx notabot
```

### **Issue: Module Not Found**
```bash
# Check if all dependencies are installed
npm install

# Reinstall dependencies
npm install --force
```

## 📁 **Settings Location**

Your NotABot settings are stored in:
```
~/.notabot/settings.json
```

### **Key Settings**
```json
{
  "apiKey": "your-gemini-api-key",
  "oauth": {
    "clientId": "your-google-client-id",
    "clientSecret": "your-google-client-secret"
  },
  "database": {
    "path": "~/.notabot/notabot.db"
  },
  "webServer": {
    "port": 4000,
    "enabled": false
  },
  "autoMode": {
    "enabled": false,
    "commands": [],
    "triggers": []
  }
}
```

## 🎯 **Quick Start After Update**

### **1. Start NotABot**
```bash
notabot
```

### **2. Set Up Authentication**
```bash
# Option A: OAuth (Recommended)
/login

# Option B: API Key
/auth YOUR_GEMINI_API_KEY
```

### **3. Start Web Dashboard**
```bash
/webserver start
```

### **4. Check Database**
```bash
/db status
```

## 📊 **Verification Commands**

### **Check Installation**
```bash
# Version check
notabot --version

# Help menu
notabot --help

# Settings check
notabot
/settings
```

### **Test Features**
```bash
# Test database
/db status

# Test web server
/webserver start

# Test auto mode
/auto status
```

## 🔄 **Updating in the Future**

### **Automatic Updates**
```bash
# Check for updates
npm outdated -g notabot

# Update to latest version
npm update -g notabot
```

### **Manual Updates**
```bash
# Pull latest changes
git pull origin main

# Reinstall globally
npm install -g . --force

# Run setup
npm run setup
```

## 🎉 **Success Indicators**

You'll know your global installation is working when:

- ✅ `notabot` command works from any directory
- ✅ Settings are loaded from `~/.notabot/settings.json`
- ✅ Database is accessible and working
- ✅ OAuth authentication works
- ✅ Web dashboard starts successfully
- ✅ All commands respond properly

## 🆘 **Getting Help**

### **If Installation Fails**
1. **Check Node.js version**: `node --version` (should be 16+)
2. **Check npm version**: `npm --version`
3. **Run test script**: `.\test-install.ps1`
4. **Check permissions**: Run as administrator if needed

### **If Commands Don't Work**
1. **Check PATH**: Ensure npm global bin is in PATH
2. **Reinstall**: `npm install -g . --force`
3. **Test locally**: `node notabot.js`
4. **Check settings**: Verify `~/.notabot/settings.json`

## 📞 **Support**

- **Documentation**: https://involvex.github.io/notabot
- **GitHub Issues**: https://github.com/involvex/notabot/issues
- **Repository**: https://github.com/involvex/notabot

---

**🎉 Your NotABot global installation is now updated with the latest settings and features!**

**Next step:** Run `notabot` to start using your updated CLI agent! 🚀 