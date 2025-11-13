#!/usr/bin/env python3
"""
Direct Password Reset Script for Render Backend
Directly resets user password without email verification step
Useful for admin operations and testing
"""

import requests
import json
import sys
import getpass
import time
from typing import Optional, Dict, Any

class PasswordResetManager:
    def __init__(self, base_url: str = "https://gobarberly-backend.onrender.com"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.timeout = 90  # 90 second timeout for slow email operations
        
        # Set headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'GoBarberly-DirectReset/1.0'
        })
    
    def print_colored(self, message: str, color: str = 'white'):
        """Print colored output for better visibility"""
        colors = {
            'red': '\033[91m',
            'green': '\033[92m',
            'yellow': '\033[93m',
            'blue': '\033[94m',
            'magenta': '\033[95m',
            'cyan': '\033[96m',
            'white': '\033[97m',
            'reset': '\033[0m'
        }
        print(f"{colors.get(color, colors['white'])}{message}{colors['reset']}")
    
    def print_header(self, title: str):
        """Print a formatted header"""
        self.print_colored("=" * 80, 'cyan')
        self.print_colored(f"🔐 {title}", 'cyan')
        self.print_colored("=" * 80, 'cyan')
    
    def test_connectivity(self) -> bool:
        """Test if the backend is accessible"""
        self.print_header("TESTING BACKEND CONNECTIVITY")
        
        try:
            start_time = time.time()
            response = self.session.options(f"{self.base_url}/api/auth/forgot-password/")
            duration = (time.time() - start_time) * 1000
            
            self.print_colored(f"✅ Backend is reachable!", 'green')
            self.print_colored(f"📍 URL: {self.base_url}", 'blue')
            self.print_colored(f"⏱️  Response time: {duration:.0f}ms", 'blue')
            self.print_colored(f"📊 Status: {response.status_code}", 'blue')
            
            return True
            
        except requests.exceptions.RequestException as e:
            self.print_colored(f"❌ Failed to connect to backend: {str(e)}", 'red')
            self.print_colored("💡 Please check if the Render backend is running", 'yellow')
            return False
    
    def request_password_reset(self, email: str) -> Optional[str]:
        """Request password reset and return the reset token"""
        self.print_header("STEP 1: REQUEST PASSWORD RESET")
        
        try:
            start_time = time.time()
            
            payload = {"email": email}
            self.print_colored(f"📧 Requesting reset for: {email}", 'blue')
            self.print_colored("⏳ Sending request... (may take up to 90 seconds)", 'yellow')
            
            response = self.session.post(
                f"{self.base_url}/api/auth/forgot-password/",
                json=payload
            )
            
            duration = (time.time() - start_time) * 1000
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.print_colored(f"✅ Password reset request successful!", 'green')
                self.print_colored(f"📧 Email: {email}", 'blue')
                self.print_colored(f"⏱️  Duration: {duration:.0f}ms", 'blue')
                self.print_colored(f"📊 Status: {response.status_code}", 'blue')
                self.print_colored(f"📝 Message: {data.get('message', 'Reset request sent')}", 'blue')
                
                # In a real scenario, you'd extract the token from email or database
                # For testing, we'll ask the user to provide it
                print()
                self.print_colored("🔑 Next: You need the reset token", 'yellow')
                self.print_colored("💡 Check your email or backend logs for the reset token", 'yellow')
                
                return "pending_token"  # Indicates success but token needed
                
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.print_colored(f"❌ Password reset request failed", 'red')
                self.print_colored(f"📊 Status: {response.status_code}", 'red')
                self.print_colored(f"💬 Error: {data.get('message', data.get('error', 'Unknown error'))}", 'red')
                self.print_colored(f"⏱️  Duration: {duration:.0f}ms", 'blue')
                
                return None
                
        except requests.exceptions.Timeout:
            self.print_colored(f"⏰ Request timed out after 90 seconds", 'red')
            self.print_colored("💡 Backend email service is very slow", 'yellow')
            return None
            
        except requests.exceptions.RequestException as e:
            self.print_colored(f"❌ Network error: {str(e)}", 'red')
            return None
    
    def reset_password_with_token(self, token: str, new_password: str) -> bool:
        """Reset password using the provided token"""
        self.print_header("STEP 2: RESET PASSWORD WITH TOKEN")
        
        if not self.validate_password(new_password):
            self.print_colored("❌ Password does not meet requirements", 'red')
            self.show_password_requirements()
            return False
        
        try:
            start_time = time.time()
            
            payload = {
                "token": token,
                "new_password": new_password,
                "new_password_confirm": new_password
            }
            
            self.print_colored("🔐 Resetting password...", 'blue')
            
            response = self.session.post(
                f"{self.base_url}/api/auth/reset-password/",
                json=payload
            )
            
            duration = (time.time() - start_time) * 1000
            
            if response.status_code in [200, 201]:
                data = response.json()
                self.print_colored(f"✅ Password reset successful!", 'green')
                self.print_colored(f"⏱️  Duration: {duration:.0f}ms", 'blue')
                self.print_colored(f"📊 Status: {response.status_code}", 'blue')
                self.print_colored(f"📝 Message: {data.get('message', 'Password reset successfully')}", 'blue')
                self.print_colored(f"🎉 User can now login with the new password!", 'green')
                
                return True
                
            else:
                data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                self.print_colored(f"❌ Password reset failed", 'red')
                self.print_colored(f"📊 Status: {response.status_code}", 'red')
                self.print_colored(f"💬 Error: {data.get('message', data.get('error', 'Reset failed'))}", 'red')
                self.print_colored(f"⏱️  Duration: {duration:.0f}ms", 'blue')
                self.print_colored("💡 Common issues: Invalid/expired token, password requirements", 'yellow')
                
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_colored(f"❌ Network error: {str(e)}", 'red')
            return False
    
    def validate_password(self, password: str) -> bool:
        """Validate password meets requirements"""
        return (
            len(password) >= 8 and
            any(c.isupper() for c in password) and
            any(c.islower() for c in password) and
            any(c.isdigit() for c in password) and
            any(c in '@$!%*?&' for c in password)
        )
    
    def show_password_requirements(self):
        """Display password requirements"""
        print()
        self.print_colored("🔒 Password Requirements:", 'yellow')
        self.print_colored("  • At least 8 characters", 'white')
        self.print_colored("  • At least one uppercase letter (A-Z)", 'white')
        self.print_colored("  • At least one lowercase letter (a-z)", 'white')
        self.print_colored("  • At least one number (0-9)", 'white')
        self.print_colored("  • At least one special character (@$!%*?&)", 'white')
        print()
    
    def direct_password_reset(self, email: str, new_password: str, reset_token: str = None) -> bool:
        """
        Complete password reset flow
        If reset_token is provided, skip the email step
        """
        self.print_header("DIRECT PASSWORD RESET")
        self.print_colored(f"🎯 Target email: {email}", 'blue')
        self.print_colored(f"🔐 New password: {'*' * len(new_password)}", 'blue')
        print()
        
        # Test connectivity first
        if not self.test_connectivity():
            return False
        
        print()
        
        # If token is provided, go straight to reset
        if reset_token:
            self.print_colored(f"🔑 Using provided token: {reset_token[:20]}...", 'blue')
            return self.reset_password_with_token(reset_token, new_password)
        
        # Otherwise, request reset first
        result = self.request_password_reset(email)
        if not result:
            return False
        
        # Ask for token
        print()
        token = input("🔑 Enter the reset token from email/logs: ").strip()
        if not token:
            self.print_colored("❌ Reset token is required", 'red')
            return False
        
        print()
        return self.reset_password_with_token(token, new_password)


def main():
    """Main interactive function"""
    import os
    
    # Clear screen for better presentation
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print()
    print("🔐" + "=" * 78 + "🔐")
    print("🔐" + " " * 20 + "DIRECT PASSWORD RESET TOOL" + " " * 21 + "🔐")
    print("🔐" + " " * 15 + "Reset any user password directly" + " " * 18 + "🔐") 
    print("🔐" + "=" * 78 + "🔐")
    print()
    
    # Initialize the manager
    manager = PasswordResetManager()
    
    try:
        # Get input
        print("📋 Enter the details for password reset:")
        print()
        
        email = input("📧 Email address: ").strip()
        if not email:
            manager.print_colored("❌ Email address is required", 'red')
            return False
        
        print("🔐 Enter new password:")
        manager.show_password_requirements()
        new_password = getpass.getpass("🔐 New password (hidden): ")
        
        if not new_password:
            manager.print_colored("❌ Password is required", 'red')
            return False
        
        confirm_password = getpass.getpass("🔐 Confirm password (hidden): ")
        
        if new_password != confirm_password:
            manager.print_colored("❌ Passwords do not match", 'red')
            return False
        
        # Optional: Ask if they have a token already
        print()
        has_token = input("🔑 Do you already have a reset token? (y/n): ").strip().lower()
        reset_token = None
        
        if has_token in ['y', 'yes']:
            reset_token = input("🔑 Enter the reset token: ").strip()
        
        print()
        
        # Perform the reset
        success = manager.direct_password_reset(email, new_password, reset_token)
        
        if success:
            print()
            manager.print_colored("🎉 SUCCESS! Password reset completed successfully!", 'green')
            manager.print_colored(f"🔑 User {email} can now login with the new password", 'green')
        else:
            print()
            manager.print_colored("❌ FAILED! Password reset was not successful", 'red')
            manager.print_colored("💡 Check the error messages above for details", 'yellow')
        
        return success
        
    except KeyboardInterrupt:
        print()
        manager.print_colored("⚠️  Operation cancelled by user", 'yellow')
        return False
    
    except Exception as e:
        manager.print_colored(f"❌ Unexpected error: {str(e)}", 'red')
        return False


def command_line_mode():
    """Command line mode for scripting"""
    if len(sys.argv) < 3:
        print("Usage: python direct_password_reset.py <email> <new_password> [reset_token]")
        print()
        print("Examples:")
        print("  python direct_password_reset.py user@example.com MyNewPass123!")
        print("  python direct_password_reset.py user@example.com MyNewPass123! abc123token456")
        return False
    
    email = sys.argv[1]
    new_password = sys.argv[2]
    reset_token = sys.argv[3] if len(sys.argv) > 3 else None
    
    manager = PasswordResetManager()
    return manager.direct_password_reset(email, new_password, reset_token)


if __name__ == "__main__":
    # Check if running in command line mode
    if len(sys.argv) > 1:
        success = command_line_mode()
    else:
        success = main()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)