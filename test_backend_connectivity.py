#!/usr/bin/env python3
"""
Test Django Backend Connectivity
Check if the localhost backend is accessible
"""

import requests
import json

def test_backend():
    """Test basic connectivity to Django backend"""
    
    print("🔍 Testing Django Backend Connectivity")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Basic connectivity
    print("1. Testing basic connectivity...")
    try:
        response = requests.get(f"{base_url}/api/", timeout=10)
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📋 Response: {response.text[:100]}...")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: CORS preflight (OPTIONS)
    print("\n2. Testing CORS preflight...")
    try:
        response = requests.options(f"{base_url}/api/auth/forgot-password/", 
                                  headers={
                                      'Origin': 'http://localhost:3000',
                                      'Access-Control-Request-Method': 'POST',
                                      'Access-Control-Request-Headers': 'Content-Type'
                                  },
                                  timeout=10)
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📋 CORS Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Actual POST request
    print("\n3. Testing POST request...")
    try:
        response = requests.post(f"{base_url}/api/auth/forgot-password/",
                               json={"email": "test@example.com"},
                               headers={
                                   'Content-Type': 'application/json',
                                   'Origin': 'http://localhost:3000'
                               },
                               timeout=10)
        print(f"   ✅ Status: {response.status_code}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                data = response.json()
                print(f"   📋 Response: {json.dumps(data, indent=2)}")
            except:
                print(f"   📋 Raw Response: {response.text}")
        else:
            print(f"   📋 Raw Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Check Django settings
    print("\n4. Testing Django admin/debug info...")
    try:
        response = requests.get(f"{base_url}/admin/", timeout=10)
        print(f"   ✅ Admin accessible: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Admin error: {e}")

if __name__ == "__main__":
    test_backend()