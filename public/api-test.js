// Comprehensive Barbershop API Test
console.log('🔧 Starting Barbershop API Connection Test...');

async function testBarbershopConnection() {
    try {
        // Step 1: Test Login
        console.log('📋 Step 1: Testing Login...');
        const loginResponse = await fetch('http://127.0.0.1:8000/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: '524410034@nitkkr.ac.in',
                password: 'Customer@123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('✅ Login Response:', loginData);
        
        if (!loginData.success) {
            throw new Error('Login failed');
        }
        
        // Store tokens with correct keys
        localStorage.setItem('gobarberly_access_token', loginData.data.access);
        localStorage.setItem('gobarberly_refresh_token', loginData.data.refresh);
        
        const token = loginData.data.access;
        
        // Step 2: Test Dashboard Stats
        console.log('📊 Step 2: Testing Dashboard Stats...');
        const dashboardResponse = await fetch('http://127.0.0.1:8000/api/barbershop/dashboard/stats/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const dashboardData = await dashboardResponse.json();
        console.log('✅ Dashboard Data:', dashboardData);
        
        // Step 3: Test Appointments
        console.log('📅 Step 3: Testing Appointments...');
        const appointmentsResponse = await fetch('http://127.0.0.1:8000/api/barbershop/appointments/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const appointmentsData = await appointmentsResponse.json();
        console.log('✅ Appointments Data:', appointmentsData);
        
        // Step 4: Test Sales
        console.log('💰 Step 4: Testing Sales...');
        const salesResponse = await fetch('http://127.0.0.1:8000/api/barbershop/sales/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const salesData = await salesResponse.json();
        console.log('✅ Sales Data:', salesData);
        
        // Step 5: Test Staff
        console.log('👥 Step 5: Testing Staff...');
        const staffResponse = await fetch('http://127.0.0.1:8000/api/barbershop/staff/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const staffData = await staffResponse.json();
        console.log('✅ Staff Data:', staffData);
        
        // Step 6: Test Customers
        console.log('🧑‍🤝‍🧑 Step 6: Testing Customers...');
        const customersResponse = await fetch('http://127.0.0.1:8000/api/barbershop/customers/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const customersData = await customersResponse.json();
        console.log('✅ Customers Data:', customersData);
        
        // Step 7: Test Inventory
        console.log('📦 Step 7: Testing Inventory...');
        const inventoryResponse = await fetch('http://127.0.0.1:8000/api/barbershop/inventory/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const inventoryData = await inventoryResponse.json();
        console.log('✅ Inventory Data:', inventoryData);
        
        // Step 8: Test Activity Logs
        console.log('📋 Step 8: Testing Activity Logs...');
        const logsResponse = await fetch('http://127.0.0.1:8000/api/barbershop/activity-logs/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const logsData = await logsResponse.json();
        console.log('✅ Activity Logs Data:', logsData);
        
        console.log('🎉 All API endpoints are working correctly!');
        
        return {
            login: loginData,
            dashboard: dashboardData,
            appointments: appointmentsData,
            sales: salesData,
            staff: staffData,
            customers: customersData,
            inventory: inventoryData,
            logs: logsData
        };
        
    } catch (error) {
        console.error('❌ API Test Failed:', error);
        throw error;
    }
}

// Run the test
testBarbershopConnection()
    .then(results => {
        console.log('📈 Test Results Summary:');
        console.log('- Login:', results.login.success ? '✅' : '❌');
        console.log('- Dashboard:', results.dashboard ? '✅' : '❌');
        console.log('- Appointments:', results.appointments ? '✅' : '❌');
        console.log('- Sales:', results.sales ? '✅' : '❌');
        console.log('- Staff:', results.staff ? '✅' : '❌');
        console.log('- Customers:', results.customers ? '✅' : '❌');
        console.log('- Inventory:', results.inventory ? '✅' : '❌');
        console.log('- Activity Logs:', results.logs ? '✅' : '❌');
    })
    .catch(error => {
        console.error('🚨 Test Suite Failed:', error);
    });