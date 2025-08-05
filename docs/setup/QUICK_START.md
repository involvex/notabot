# 🚀 NotABot Quick Start Guide

## ✅ **OAuth Integration Complete!**

Your NotABot is now fully configured with OAuth credentials and ready to use!

## 🎯 **Quick Start**

### **1. Start NotABot**
```bash
notabot
```

### **2. Login with OAuth**
```
/login
```

### **3. Set API Key (Alternative)**
```
/auth YOUR_GEMINI_API_KEY
```

## 🔧 **What's Working**

✅ **OAuth Credentials**: Properly configured  
✅ **Modal Database**: Loaded and ready  
✅ **Interactive CLI**: Fully functional  
✅ **Web Dashboard**: Available at http://localhost:4000  
✅ **Auto Mode**: Ready for automation  
✅ **Tools**: All tools available  

## 🎮 **Key Commands**

```
/help          - Show all commands
/login         - Login with Google OAuth
/auth          - Set API key
/webserver     - Control web dashboard
/auto          - Configure auto mode
/yolo          - Enable dangerous operations
/tools         - Show available tools
```

## 🌐 **Web Dashboard**

Start the web server:
```
/webserver start
```

Then visit: http://localhost:4000

## 🔐 **OAuth Authentication**

1. Run `/login`
2. Browser opens automatically
3. Sign in with Google
4. Grant permissions
5. Return to CLI - authenticated!

## 🛠️ **Troubleshooting**

### **App doesn't start?**
- Run: `node notabot.js`
- Check: `npm run start`

### **OAuth not working?**
- Run: `.\set-oauth-env.ps1`
- Then: `notabot`

### **Need API key instead?**
- Get one from: https://makersuite.google.com/app/apikey
- Use: `/auth YOUR_API_KEY`

## 🎉 **You're Ready!**

Your NotABot is fully configured with:
- ✅ OAuth authentication
- ✅ Web dashboard
- ✅ Auto mode
- ✅ All tools
- ✅ Modal database

**Start using it now: `notabot`** 
