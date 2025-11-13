#!/usr/bin/env python3
"""
SUPER SIMPLE PASSWORD CHANGER
Input: Email + Password
Output: Password changed in database
NO EMAIL VERIFICATION - DIRECT UPDATE
"""

import requests
import getpass

def test_backend_first():
    """Test if backend is accessible before attempting password change"""
    print("🔍 Testing backend connectivity...")
    
    try:
        # Test basic connectivity
        response = requests.get("http://localhost:8000/api/health/", timeout=10)
        if response.status_code == 200:
            print("✅ Backend is accessible")
            return True
        else:
            print(f"⚠️  Backend responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        print("💡 Make sure Django server is running with: python manage.py runserver")
        return False

def change_password(email, new_password):
    """Change password directly - no email, no verification"""
    
    print(f"🔄 Changing password for: {email}")
    
    # Test backend first
    if not test_backend_first():
        return False
    
    # Backend URL
    url = "http://localhost:8000"
    
    # Step 1: Generate reset token (but we'll use it immediately)
    print("📧 Requesting reset...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'GoBarberly-PasswordReset/1.0'
        }
        
        payload = {"email": email}
        print(f"🔍 Sending request to: {url}/api/auth/forgot-password/")
        print(f"🔍 Payload: {payload}")
        print(f"🔍 Headers: {headers}")
        
        response = requests.post(f"{url}/api/auth/forgot-password/", 
                               json=payload, 
                               headers=headers,
                               timeout=90)
        
        print(f"🔍 Response status: {response.status_code}")
        print(f"🔍 Response content-type: {response.headers.get('content-type', 'unknown')}")
        
        if response.status_code in [200, 201]:
            print("✅ Reset token generated")
            
            # In a real direct database update, you'd extract the token from logs
            # For now, ask user to get it from backend logs
            print("\n" + "="*50)
            print("🔍 BACKEND LOGS REQUIRED")
            print("="*50)
            print("1. Go to your Render dashboard")
            print("2. Open backend logs") 
            print("3. Look for: 'Password reset token generated'")
            print("4. Copy the token from the logs")
            print("="*50)
            
            token = input("\n🔑 Paste the reset token here: ").strip()
            
            if token:
                # Step 2: Use token immediately to set new password
                print("🔐 Setting new password...")
                
                reset_data = {
                    "token": token,
                    "new_password": new_password,
                    "new_password_confirm": new_password
                }
                
                reset_response = requests.post(f"{url}/api/auth/reset-password/",
                                             json=reset_data,
                                             timeout=30)
                
                if reset_response.status_code in [200, 201]:
                    print("✅ SUCCESS! Password changed!")
                    print(f"🔑 {email} can now login with new password")
                    return True
                else:
                    print("❌ Failed to reset password")
                    print(f"Error: {reset_response.status_code}")
                    return False
            else:
                print("❌ No token provided")
                return False
        else:
            print(f"❌ Failed to request reset: {response.status_code}")
            try:
                error_data = response.json()
                print(f"🔍 Error details: {error_data}")
            except:
                print(f"🔍 Raw error response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out (backend is slow)")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_forgot_password_endpoint():
    """Test the forgot password endpoint specifically"""
    print("\n🧪 Testing forgot-password endpoint...")
    
    try:
        response = requests.post("http://localhost:8000/api/auth/forgot-password/",
                               json={"email": "test@example.com"},
                               headers={'Content-Type': 'application/json'},
                               timeout=10)
        
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        print(f"Response: {response.text[:200]}...")
        
        return response.status_code in [200, 201, 400]  # 400 might be expected for invalid email
        
    except Exception as e:
        print(f"Error: {e}")
        return False

# Main execution
if __name__ == "__main__":
    print("🔐 SIMPLE PASSWORD CHANGER")
    print("="*40)
    
    # Quick endpoint test
    if not test_forgot_password_endpoint():
        print("\n❌ Backend endpoint test failed. Please check Django server.")
        exit(1)
    
    print("\n" + "="*40)
    
    # Get email
    email = input("📧 Email: ")
    
    # Get new password  
    password = getpass.getpass("🔑 New Password: ")
    
    # Change it
    if change_password(email, password):
        print("\n🎉 DONE!")
    else:
        print("\n❌ FAILED!")