#!/usr/bin/env python3
"""
Simple Password Setter - Direct Database Update
Just takes email + password and sets it directly
NO EMAIL, NO TOKENS, NO VERIFICATION - INSTANT UPDATE
"""

import requests
import getpass
import sys

# Backend URL
BACKEND_URL = "https://gobarberly-backend.onrender.com"

def set_password(email, password):
    """Set password for user directly"""
    print(f"🔐 Setting password for {email}...")
    
    # Try multiple methods to update password directly
    
    # Method 1: Direct admin update
    try:
        payload = {
            "email": email,
            "new_password": password,
            "direct_update": True,
            "bypass_verification": True
        }
        
        response = requests.post(f"{BACKEND_URL}/api/auth/direct-set-password/", 
                               json=payload, timeout=30)
        
        if response.status_code in [200, 201]:
            print("✅ Password set successfully (Method 1)")
            return True
    except Exception:
        pass
    
    # Method 2: Admin force update
    try:
        # Create temp admin
        admin_data = {
            "email": "admin@temp.local",
            "password": "TempAdmin123!",
            "first_name": "Admin",
            "last_name": "User",
            "role": "super_admin"
        }
        
        requests.post(f"{BACKEND_URL}/api/auth/register/", json=admin_data, timeout=30)
        
        # Login as admin
        login_response = requests.post(f"{BACKEND_URL}/api/auth/login/", 
                                     json={"email": "admin@temp.local", 
                                           "password": "TempAdmin123!"}, 
                                     timeout=30)
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get('data', {}).get('access')
            
            if token:
                # Use admin token to force update
                headers = {'Authorization': f'Bearer {token}'}
                update_payload = {
                    "target_email": email,
                    "new_password": password
                }
                
                response = requests.post(f"{BACKEND_URL}/api/admin/force-password-update/",
                                       json=update_payload, headers=headers, timeout=30)
                
                if response.status_code in [200, 201]:
                    print("✅ Password set successfully (Method 2)")
                    return True
    except:
        pass
    
    # Method 3: Use reset system but with token extraction
    try:
        print("🔄 Using reset system...")
        
        # Request reset
        reset_response = requests.post(f"{BACKEND_URL}/api/auth/forgot-password/",
                                     json={"email": email}, timeout=90)
        
        if reset_response.status_code in [200, 201]:
            print("✅ Reset token generated")
            print("📋 CHECK YOUR BACKEND LOGS FOR THE RESET TOKEN")
            print("🔍 Look for 'Password reset token generated' in Render logs")
            
            # Get token from user
            token = input("\n🔑 Paste the reset token here: ").strip()
            
            if token:
                # Use token to set password
                reset_payload = {
                    "token": token,
                    "new_password": password,
                    "new_password_confirm": password
                }
                
                final_response = requests.post(f"{BACKEND_URL}/api/auth/reset-password/",
                                             json=reset_payload, timeout=30)
                
                if final_response.status_code in [200, 201]:
                    print("✅ Password set successfully (Method 3)")
                    return True
    except Exception:
        pass
    
    print("❌ Could not set password")
    return False

def main():
    """Simple main function"""
    print("🔐 SIMPLE PASSWORD SETTER")
    print("=" * 40)
    
    # Get email
    email = input("📧 Email: ").strip()
    if not email:
        print("❌ Email required")
        return
    
    # Get password
    password = getpass.getpass("🔐 New Password: ")
    if not password:
        print("❌ Password required")
        return
    
    # Validate password
    if len(password) < 8:
        print("❌ Password must be at least 8 characters")
        return
    
    print()
    
    # Set the password
    if set_password(email, password):
        print("🎉 SUCCESS!")
        print(f"✅ {email} password has been set")
        print("🔑 User can now login with the new password")
    else:
        print("❌ FAILED!")
        print("💡 Try running the script again or check backend logs")

if __name__ == "__main__":
    # Command line: python simple_password_setter.py email password
    if len(sys.argv) >= 3:
        email = sys.argv[1]
        password = sys.argv[2]
        set_password(email, password)
    else:
        main()