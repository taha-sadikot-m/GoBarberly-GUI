# 🔐 Password Reset Tools for GoBarberly

Complete suite of tools to reset user passwords on your Render backend. Choose the method that best fits your needs.

## 📁 Available Tools

### 1. **Direct Password Reset** - `direct_password_reset.py`
- **Purpose:** Reset password with email verification step
- **Use Case:** Standard password reset flow for users
- **Process:** Email → Token → Password Reset

### 2. **Admin Password Reset** - `admin_password_reset.py` 
- **Purpose:** Force password reset using admin privileges
- **Use Case:** Admin operations, emergency resets
- **Process:** Admin Login → Direct Reset (no email needed)

### 3. **Batch Launcher** - `password_reset_tools.bat`
- **Purpose:** Easy-to-use menu system for Windows
- **Use Case:** Quick access to all tools
- **Process:** Menu-driven interface

## 🚀 Quick Start

### Option 1: Use the Menu System (Recommended)
```bash
# Windows
password_reset_tools.bat

# This will show you a menu with all options
```

### Option 2: Run Scripts Directly

#### Direct Password Reset:
```bash
# Interactive mode
python direct_password_reset.py

# Command line mode
python direct_password_reset.py user@example.com NewPassword123!
python direct_password_reset.py user@example.com NewPassword123! reset_token_here
```

#### Admin Password Reset:
```bash
# Interactive mode (recommended)
python admin_password_reset.py
```

## 🎯 Which Tool Should You Use?

### 📧 **Use Direct Reset When:**
- User forgot their password (normal case)
- You want to follow proper security flow
- Email service is working
- You have access to email or backend logs

### 🔧 **Use Admin Reset When:**
- Email service is down/slow
- Emergency password reset needed
- Bulk password resets
- You have admin credentials
- Testing purposes

### 📊 **Use Batch Launcher When:**
- You want a simple menu interface
- Not sure which tool to use
- Testing connectivity first
- Windows environment

## 🔒 Password Requirements

All tools enforce these security requirements:
- ✅ At least 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (@$!%*?&)

**Examples of valid passwords:**
- `MySecure123!`
- `Password@456`
- `NewPass2024$`

## 📋 Step-by-Step Examples

### Example 1: Reset User Password (Standard Flow)

```bash
$ python direct_password_reset.py

🔐 DIRECT PASSWORD RESET TOOL
📧 Email address: user@example.com
🔐 New password (hidden): ********
🔐 Confirm password (hidden): ********
🔑 Do you already have a reset token? (y/n): n

✅ Password reset request sent!
🔑 Enter the reset token from email/logs: abc123def456...
✅ Password reset successful!
🎉 User can now login with the new password!
```

### Example 2: Admin Force Reset (No Email)

```bash
$ python admin_password_reset.py

🔧 ADMIN PASSWORD RESET TOOL
📧 Admin email: admin@gobarberly.com
🔐 Admin password: ********
📧 Target user email: user@example.com
🔐 New password for user: ********
🔐 Confirm new password: ********

✅ Admin logged in successfully
✅ Password reset successful!
🎉 User password has been reset
```

## 🌐 Backend Configuration

### Render Backend Details
- **URL:** `https://gobarberly-backend.onrender.com`
- **Timeout:** 90 seconds (handles slow email service)
- **Endpoints Used:**
  - `POST /api/auth/forgot-password/` - Request reset
  - `POST /api/auth/reset-password/` - Reset with token
  - `POST /api/auth/login/` - Admin login
  - `POST /api/super-admin/reset-user-password/` - Admin reset

## 🛠️ Installation & Requirements

### Prerequisites
```bash
# Python 3.7 or higher
python --version

# Required packages (usually pre-installed)
pip install requests
```

### Setup
```bash
# 1. Download/create the scripts in your project directory
# 2. Make them executable (Linux/Mac)
chmod +x direct_password_reset.py
chmod +x admin_password_reset.py

# 3. Run the tools
python direct_password_reset.py
# or
./password_reset_tools.bat  # Windows
```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### "Backend unreachable"
```bash
# Test connectivity first
python -c "import requests; print(requests.get('https://gobarberly-backend.onrender.com').status_code)"

# Check:
1. Render service is running
2. Internet connection is working
3. No firewall blocking requests
```

#### "Request timed out after 90 seconds"
```bash
# The backend email service is very slow
# Solutions:
1. Use admin reset instead (bypasses email)
2. Check Render logs for performance issues
3. Consider upgrading Render plan for better performance
```

#### "Password does not meet requirements"
```bash
# Ensure password has:
✅ 8+ characters
✅ Uppercase letter (A-Z)
✅ Lowercase letter (a-z) 
✅ Number (0-9)
✅ Special character (@$!%*?&)
```

#### "Admin login failed"
```bash
# Create admin user first:
1. Register admin through your app
2. Set role to 'super_admin' in database
3. Or use the create_super_admin.py script
```

#### "Invalid/expired token"
```bash
# Token issues:
1. Check backend logs for generated token
2. Token expires after 1 hour usually
3. Generate new reset request
4. Copy token exactly (no extra spaces)
```

## 📊 Success Indicators

### ✅ **Everything Working When:**
- Backend responds within 90 seconds
- Email reset requests succeed
- Admin login works
- Password resets complete successfully
- Users can login with new passwords

### ❌ **Issues to Investigate:**
- Timeouts over 90 seconds
- 500 server errors
- "User not found" errors
- Email service failures

## 🔧 Advanced Usage

### Command Line Integration
```bash
# Batch process multiple resets
for email in user1@test.com user2@test.com user3@test.com; do
    python direct_password_reset.py "$email" "TempPass123!"
done
```

### Scripting Examples
```python
# Use as a module
from direct_password_reset import PasswordResetManager

manager = PasswordResetManager()
success = manager.direct_password_reset("user@test.com", "NewPass123!")
print(f"Reset successful: {success}")
```

## 📈 Performance Tips

1. **Use Admin Reset for Speed** - Bypasses slow email service
2. **Batch Operations** - Reset multiple users via admin
3. **Check Connectivity First** - Use the test option
4. **Monitor Backend Logs** - Track performance and errors

## 🔐 Security Notes

- **Admin Credentials:** Keep admin passwords secure
- **Token Handling:** Tokens are displayed only for testing
- **Password Validation:** All tools enforce strong passwords
- **Logging:** Operations are logged for audit trail
- **No Storage:** Scripts don't store credentials locally

## 📞 Support & Usage

### Quick Help
```bash
# Get help for any script
python direct_password_reset.py --help
python admin_password_reset.py --help
```

### Common Workflows

**For Users:** Use Direct Reset (standard email flow)
**For Admins:** Use Admin Reset (faster, no email)
**For Testing:** Use Batch Launcher (easy menu system)
**For Automation:** Use command line mode

---

## 🎉 Success!

**Your password reset tools are ready!**

Choose the method that works best for your situation:
- 📧 **Normal users:** Direct reset with email verification
- 🔧 **Admin operations:** Force reset without email 
- 📊 **Testing:** Menu system for easy access

The tools handle the slow email service issue by using 90-second timeouts and providing admin alternatives.