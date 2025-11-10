#!/usr/bin/env node

/**
 * Reset Password Testing Script for Render Backend
 * Tests the complete password reset flow
 */

const https = require('http');
const readline = require('readline');

const API_BASE_URL = 'http://127.0.0.1:8000';
const TIMEOUT = 90000; // 90 seconds - increased for slow email services on Render

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utility functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logHeader(message) {
    console.log();
    log(`${'='.repeat(60)}`, 'cyan');
    log(`${message}`, 'cyan');
    log(`${'='.repeat(60)}`, 'cyan');
}

// HTTP request wrapper with timeout
function makeRequest(url, options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data,
                        headers: res.headers
                    });
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(TIMEOUT, () => {
            req.destroy();
            reject(new Error(`Request timeout after ${TIMEOUT}ms`));
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Test connectivity to the backend
async function testConnectivity() {
    logHeader('🔗 TESTING BACKEND CONNECTIVITY');
    
    try {
        const startTime = Date.now();
        
        const response = await makeRequest(`${API_BASE_URL}/api/auth/forgot-password/`, {
            method: 'OPTIONS',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const duration = Date.now() - startTime;
        
        logSuccess(`Backend is reachable!`);
        logInfo(`URL: ${API_BASE_URL}`);
        logInfo(`Response time: ${duration}ms`);
        logInfo(`Status: ${response.statusCode}`);
        
        return true;
    } catch (error) {
        logError(`Failed to connect to backend: ${error.message}`);
        logWarning('Please check if the Render backend is running and accessible');
        return false;
    }
}

// Request password reset
async function requestPasswordReset(email) {
    logHeader('📧 STEP 1: REQUEST PASSWORD RESET');
    
    logWarning('Email services on Render can be slow. This may take up to 90 seconds...');
    console.log();
    
    try {
        const startTime = Date.now();
        
        // Progress indicator for long requests
        let progressTimer;
        let seconds = 0;
        
        const showProgress = () => {
            seconds += 5;
            if (seconds <= 90) {
                process.stdout.write(`\r⏳ Waiting for email service... ${seconds}s elapsed (max 90s)`);
            }
        };
        
        progressTimer = setInterval(showProgress, 5000);
        
        const postData = JSON.stringify({ email: email });
        
        const response = await makeRequest(`${API_BASE_URL}/api/auth/forgot-password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, postData);
        
        clearInterval(progressTimer);
        process.stdout.write('\r' + ' '.repeat(60) + '\r'); // Clear progress line
        
        const duration = Date.now() - startTime;
        
        if (response.statusCode === 200 || response.statusCode === 201) {
            logSuccess('Password reset request sent successfully!');
            logInfo(`Email: ${email}`);
            logInfo(`Duration: ${duration}ms`);
            logInfo(`Status: ${response.statusCode}`);
            logInfo(`Message: ${response.data.message || 'Check your email for reset instructions'}`);
            
            console.log();
            logWarning('Next step: Check your email for the reset token');
            logWarning('Or check your backend logs for the generated token');
            
            return true;
        } else {
            logError('Password reset request failed');
            logInfo(`Status: ${response.statusCode}`);
            logInfo(`Error: ${response.data.message || response.data.error || 'Unknown error'}`);
            logInfo(`Duration: ${duration}ms`);
            
            return false;
        }
    } catch (error) {
        if (progressTimer) {
            clearInterval(progressTimer);
            process.stdout.write('\r' + ' '.repeat(60) + '\r'); // Clear progress line
        }
        
        if (error.message.includes('timeout')) {
            logError(`Request timed out after ${TIMEOUT}ms (90 seconds)`);
            logWarning('Your backend email service is taking longer than 90 seconds');
            logWarning('This indicates a serious performance issue with your email provider');
            logInfo('Possible solutions:');
            console.log('  • Check your SMTP server configuration');
            console.log('  • Verify email credentials are correct');
            console.log('  • Consider switching to a faster email service (SendGrid, AWS SES)');
            console.log('  • Check Render backend logs for email service errors');
        } else {
            logError(`Network error: ${error.message}`);
        }
        return false;
    }
}

// Reset password with token
async function resetPassword(token, newPassword, confirmPassword) {
    logHeader('🔐 STEP 2: RESET PASSWORD');
    
    if (newPassword !== confirmPassword) {
        logError('Passwords do not match');
        return false;
    }
    
    if (!validatePassword(newPassword)) {
        logError('Password does not meet requirements');
        showPasswordRequirements();
        return false;
    }
    
    try {
        const startTime = Date.now();
        
        const postData = JSON.stringify({
            token: token,
            new_password: newPassword,
            new_password_confirm: confirmPassword
        });
        
        const response = await makeRequest(`${API_BASE_URL}/api/auth/reset-password/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, postData);
        
        const duration = Date.now() - startTime;
        
        if (response.statusCode === 200 || response.statusCode === 201) {
            logSuccess('Password reset successful!');
            logInfo(`Duration: ${duration}ms`);
            logInfo(`Status: ${response.statusCode}`);
            logInfo(`Message: ${response.data.message || 'Password has been reset successfully'}`);
            
            console.log();
            logSuccess('🎉 Password reset flow completed successfully!');
            logInfo('You can now login with your new password');
            
            return true;
        } else {
            logError('Password reset failed');
            logInfo(`Status: ${response.statusCode}`);
            logInfo(`Error: ${response.data.message || response.data.error || 'Reset failed'}`);
            logInfo(`Duration: ${duration}ms`);
            logWarning('Common issues: Invalid/expired token, password requirements not met');
            
            return false;
        }
    } catch (error) {
        if (error.message.includes('timeout')) {
            logError(`Request timed out after ${TIMEOUT}ms`);
        } else {
            logError(`Network error: ${error.message}`);
        }
        return false;
    }
}

// Password validation
function validatePassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[@$!%*?&]/.test(password);
}

// Show password requirements
function showPasswordRequirements() {
    console.log();
    logInfo('Password must contain:');
    console.log('  • At least 8 characters');
    console.log('  • At least one uppercase letter (A-Z)');
    console.log('  • At least one lowercase letter (a-z)');
    console.log('  • At least one number (0-9)');
    console.log('  • At least one special character (@$!%*?&)');
    console.log();
}

// Interactive prompts
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

function promptPassword(question) {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        let password = '';
        
        process.stdout.write(question);
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        
        stdin.on('data', function(ch) {
            ch = ch + '';
            
            switch (ch) {
                case '\n':
                case '\r':
                case '\u0004':
                    stdin.setRawMode(false);
                    stdin.pause();
                    process.stdout.write('\n');
                    resolve(password);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f': // Backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    password += ch;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

// Main execution
async function main() {
    console.clear();
    
    logHeader('🔐 RESET PASSWORD TEST SCRIPT');
    logInfo('Testing Render Backend Password Reset Functionality');
    logInfo(`Backend URL: ${API_BASE_URL}`);
    logInfo(`Timeout: ${TIMEOUT}ms (90 seconds - increased for email services)`);
    console.log();
    
    try {
        // Test connectivity first
        const isConnected = await testConnectivity();
        if (!isConnected) {
            logError('Cannot proceed without backend connectivity');
            process.exit(1);
        }
        
        console.log();
        log('Press Enter to continue or Ctrl+C to exit...', 'yellow');
        await prompt('');
        
        // Step 1: Request password reset
        const email = await prompt('Enter email address (default: test@example.com): ') || 'test@example.com';
        
        const resetRequested = await requestPasswordReset(email);
        if (!resetRequested) {
            logError('Failed to request password reset. Exiting.');
            process.exit(1);
        }
        
        console.log();
        log('Check your email or backend logs for the reset token', 'yellow');
        const token = await prompt('Enter the reset token: ');
        
        if (!token) {
            logError('Reset token is required. Exiting.');
            process.exit(1);
        }
        
        // Step 2: Reset password
        console.log();
        showPasswordRequirements();
        
        const newPassword = await promptPassword('Enter new password: ');
        const confirmPassword = await promptPassword('Confirm new password: ');
        
        const resetSuccessful = await resetPassword(token, newPassword, confirmPassword);
        
        if (resetSuccessful) {
            console.log();
            logSuccess('✨ Password reset test completed successfully!');
        } else {
            logError('Password reset test failed');
            process.exit(1);
        }
        
    } catch (error) {
        logError(`Unexpected error: ${error.message}`);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log();
    logInfo('Test interrupted by user');
    rl.close();
    process.exit(0);
});

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testConnectivity,
    requestPasswordReset,
    resetPassword,
    validatePassword
};