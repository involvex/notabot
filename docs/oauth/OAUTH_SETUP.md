# OAuth Setup Guide for NotABot

## 🔐 Setting up Google OAuth Authentication

NotABot supports Google OAuth authentication for secure access to Gemini API. Follow these steps to set it up:

## 📋 Prerequisites

1. **Google Cloud Project**: You need a Google Cloud project
2. **OAuth 2.0 Credentials**: Create OAuth 2.0 client credentials
3. **Environment Variables**: Set up the credentials in your environment

## 🚀 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Desktop application" as the application type
4. Give it a name like "NotABot CLI"
5. Click "Create"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "NotABot"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add test users if needed
6. Save and continue

### 4. Set Environment Variables

Set the following environment variables:

#### Windows (PowerShell)
```powershell
$env:GOOGLE_CLIENT_ID="your-client-id-here"
$env:GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

#### Windows (Command Prompt)
```cmd
set GOOGLE_CLIENT_ID=your-client-id-here
set GOOGLE_CLIENT_SECRET=your-client-secret-here
```

#### Linux/macOS
```bash
export GOOGLE_CLIENT_ID="your-client-id-here"
export GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### 5. Permanent Environment Variables

#### Windows
1. Open System Properties > Environment Variables
2. Add new user variables:
   - `GOOGLE_CLIENT_ID` = your-client-id
   - `GOOGLE_CLIENT_SECRET` = your-client-secret

#### Linux/macOS
Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):
```bash
export GOOGLE_CLIENT_ID="your-client-id-here"
export GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## 🎯 Using OAuth with NotABot

### 1. Start NotABot
```bash
notabot
```

### 2. Login with OAuth
```bash
/login
```

### 3. Follow the Authentication Flow
1. Browser will open automatically (or visit http://localhost:3000/auth)
2. Sign in with your Google account
3. Grant permissions to NotABot
4. Return to the CLI - authentication complete!

## 🔧 Troubleshooting

### Issue: "OAuth credentials not configured"
**Solution**: Set the environment variables as shown above.

### Issue: "Authentication failed"
**Solution**: 
1. Check that OAuth consent screen is configured
2. Verify the redirect URI is `http://localhost:3000/auth/callback`
3. Make sure you're using the correct client ID and secret

### Issue: "Browser doesn't open automatically"
**Solution**: 
1. Manually visit http://localhost:3000/auth
2. Or check if your system has a default browser set

### Issue: "Invalid redirect URI"
**Solution**: 
1. In Google Cloud Console, go to OAuth 2.0 credentials
2. Add `http://localhost:3000/auth/callback` to authorized redirect URIs

## 🔒 Security Notes

- **Never commit credentials**: Don't add environment variables to version control
- **Use environment variables**: Store credentials in environment variables, not in code
- **Rotate secrets**: Regularly update your OAuth client secret
- **Limit scopes**: Only request the scopes you actually need

## 📝 Example Configuration

### Complete Environment Setup (Windows PowerShell)
```powershell
# Set OAuth credentials
$env:GOOGLE_CLIENT_ID="123456789-abcdef.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"

# Set Gemini API key (alternative to OAuth)
$env:GEMINI_API_KEY="your-gemini-api-key"

# Start NotABot
notabot
```

### Complete Environment Setup (Linux/macOS)
```bash
# Set OAuth credentials
export GOOGLE_CLIENT_ID="123456789-abcdef.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"

# Set Gemini API key (alternative to OAuth)
export GEMINI_API_KEY="your-gemini-api-key"

# Start NotABot
notabot
```

## 🎉 Success!

Once configured, you can use OAuth authentication with NotABot:

```bash
notabot
/login
```

The authentication will be secure and tokens will be stored locally for future use.

---

**Need help?** Check the main documentation in `NOTABOT_README.md` or create an issue on GitHub. 
