import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TokenManager, AuthService } from '../services/api';
import { superAdminService } from '../services/superAdminApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AuthDebug: React.FC = () => {
  const { state } = useAuth();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [authInfo, setAuthInfo] = useState<any>({});

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setDebugLog(prev => [...prev, logEntry]);
    console.log(logEntry);
  };

  const checkAuthState = () => {
    log('🔍 Checking authentication state...');
    
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    const isExpired = TokenManager.isTokenExpired();
    
    log(`📱 Access Token: ${accessToken ? 'Present' : 'Missing'}`);
    log(`🔄 Refresh Token: ${refreshToken ? 'Present' : 'Missing'}`);
    log(`❓ Is Expired: ${isExpired}`);
    log(`👤 Auth State User: ${state.user ? JSON.stringify(state.user) : 'None'}`);
    log(`🔐 Auth State: ${JSON.stringify({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error
    })}`);

    // Try to decode JWT token
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        log(`🎫 Token payload: ${JSON.stringify(payload, null, 2)}`);
        setAuthInfo({ ...authInfo, tokenPayload: payload });
      } catch (e) {
        log('❌ Failed to decode token payload');
      }
    }

    setAuthInfo({
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isExpired,
      authStateUser: state.user,
      authState: {
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error
      }
    });
  };

  const testSuperAdminAPI = async () => {
    log('🧪 Testing SuperAdmin API...');
    try {
      const result = await superAdminService.getBarbershops();
      log('✅ SuperAdmin API test successful');
      log(`📄 Result: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      log('❌ SuperAdmin API test failed');
      log(`❌ Error: ${error.message}`);
    }
  };

  const testLogoutAPI = async () => {
    log('🧪 Testing Logout API...');
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        log('❌ No refresh token available for logout test');
        return;
      }
      
      log('🔄 Starting logout API test with debug logging...');
      log('ℹ️ This will test multiple payload formats automatically');
      
      // Call the actual logout API method
      const result = await AuthService.logout();
      
      log('✅ Logout API test completed');
      log(`📄 Result: ${JSON.stringify(result, null, 2)}`);
      
      // Refresh auth state after logout test
      checkAuthState();
      
    } catch (error: any) {
      log('❌ Logout API test failed');
      log(`❌ Error: ${error.message}`);
    }
  };

  const clearAuthData = () => {
    log('🗑️ Clearing authentication data...');
    TokenManager.clearTokens();
    setAuthInfo({});
    log('✅ Authentication data cleared');
  };

  useEffect(() => {
    checkAuthState();
  }, [state]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Card>
        <div style={{ padding: '2rem' }}>
          <h1>🔍 Authentication Debug</h1>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>🔑 Current Auth State</h3>
            <div style={{
              background: authInfo.hasAccessToken && !authInfo.isExpired ? '#f0fff4' : '#fff5f5',
              border: `1px solid ${authInfo.hasAccessToken && !authInfo.isExpired ? '#38a169' : '#e53e3e'}`,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <strong>Status:</strong> {
                authInfo.hasAccessToken && !authInfo.isExpired 
                  ? '✅ Authenticated with valid token'
                  : '❌ Not authenticated or token expired'
              }
              <br />
              <strong>User Role:</strong> {state.user?.role || 'Not available'}
              <br />
              <strong>User Email:</strong> {state.user?.email || 'Not available'}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>🧪 API Tests</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button onClick={checkAuthState}>🔄 Refresh Auth Status</Button>
              <Button onClick={testSuperAdminAPI}>Test SuperAdmin API</Button>
              <Button onClick={testLogoutAPI}>Test Logout API</Button>
              <Button onClick={clearAuthData} className="danger-btn">
                🗑️ Clear Auth Data
              </Button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>📋 Debug Log</h3>
            <div style={{
              background: '#1a202c',
              color: '#e2e8f0',
              padding: '1rem',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              maxHeight: '400px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {debugLog.join('\n')}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={() => setDebugLog([])}>
                🗑️ Clear Log
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthDebug;