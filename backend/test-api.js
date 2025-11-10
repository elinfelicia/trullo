// Simple Node.js test script for Trullo API
const http = require('http');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let userId = '';
let taskId = '';
let projectId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: parsed, raw: body });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, raw: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Test functions
async function testRoot() {
    console.log('\n1. Testing root endpoint...');
    const result = await makeRequest('GET', '/');
    if (result.status === 200) {
        console.log('✓ Root endpoint works:', result.data);
        return true;
    } else {
        console.log('✗ Root endpoint failed:', result.status, result.data);
        return false;
    }
}

async function testCreateUser() {
    console.log('\n2. Testing user registration...');
    // Try with single user first (should work now)
    const result = await makeRequest('POST', '/api/users', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
    });
    
    if (result.status === 201) {
        console.log('✓ User created successfully');
        const userData = Array.isArray(result.data) ? result.data[0] : result.data;
        userId = userData._id;
        console.log('User ID:', userId);
        return true;
    } else {
        console.log('✗ User creation failed:', result.status, result.data);
        return false;
    }
}

async function testLogin() {
    console.log('\n3. Testing user login...');
    const result = await makeRequest('POST', '/api/users/login', {
        email: 'test@example.com',
        password: 'testpassword123'
    });
    
    if (result.status === 200 && result.data.token) {
        console.log('✓ Login successful');
        authToken = result.data.token;
        console.log('Token:', authToken.substring(0, 50) + '...');
        return true;
    } else {
        console.log('✗ Login failed:', result.status, result.data);
        return false;
    }
}

async function testGetUsers() {
    console.log('\n4. Testing get users (authenticated)...');
    const result = await makeRequest('GET', '/api/users', null, authToken);
    
    if (result.status === 200) {
        console.log('✓ Get users successful');
        console.log('Users count:', Array.isArray(result.data) ? result.data.length : 1);
        return true;
    } else {
        console.log('✗ Get users failed:', result.status, result.data);
        return false;
    }
}

async function testCreateTask() {
    console.log('\n5. Testing create task (authenticated)...');
    const result = await makeRequest('POST', '/api/tasks', {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'To Do',
        assignedTo: userId
    }, authToken);
    
    if (result.status === 201) {
        console.log('✓ Task created successfully');
        taskId = result.data._id;
        console.log('Task ID:', taskId);
        console.log('Task:', result.data.title);
        return true;
    } else {
        console.log('✗ Task creation failed:', result.status, result.data);
        return false;
    }
}

async function testGetTasks() {
    console.log('\n6. Testing get tasks (authenticated)...');
    const result = await makeRequest('GET', '/api/tasks', null, authToken);
    
    if (result.status === 200) {
        console.log('✓ Get tasks successful');
        if (result.data.docs) {
            console.log('Tasks count:', result.data.docs.length);
            console.log('Total:', result.data.totalDocs);
        } else {
            console.log('Tasks:', Array.isArray(result.data) ? result.data.length : 1);
        }
        return true;
    } else {
        console.log('✗ Get tasks failed:', result.status, result.data);
        return false;
    }
}

async function testCreateProject() {
    console.log('\n7. Testing create project (authenticated)...');
    const result = await makeRequest('POST', '/api/projects', {
        name: 'Test Project',
        description: 'This is a test project'
    }, authToken);
    
    if (result.status === 201) {
        console.log('✓ Project created successfully');
        projectId = result.data._id;
        console.log('Project ID:', projectId);
        console.log('Project:', result.data.name);
        return true;
    } else {
        console.log('✗ Project creation failed:', result.status, result.data);
        return false;
    }
}

async function testGetProjects() {
    console.log('\n8. Testing get projects (authenticated)...');
    const result = await makeRequest('GET', '/api/projects', null, authToken);
    
    if (result.status === 200) {
        console.log('✓ Get projects successful');
        console.log('Projects count:', Array.isArray(result.data) ? result.data.length : 1);
        return true;
    } else {
        console.log('✗ Get projects failed:', result.status, result.data);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('=== Testing Trullo API ===\n');
    
    const tests = [
        { name: 'Root endpoint', fn: testRoot },
        { name: 'Create user', fn: testCreateUser },
        { name: 'Login', fn: testLogin },
        { name: 'Get users', fn: testGetUsers },
        { name: 'Create task', fn: testCreateTask },
        { name: 'Get tasks', fn: testGetTasks },
        { name: 'Create project', fn: testCreateProject },
        { name: 'Get projects', fn: testGetProjects },
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) passed++;
            else failed++;
        } catch (error) {
            console.error(`✗ ${test.name} threw error:`, error.message);
            failed++;
        }
    }
    
    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
}

// Check if server is running first
makeRequest('GET', '/')
    .then(() => {
        runTests().catch(console.error);
    })
    .catch((error) => {
        console.error('Cannot connect to server. Make sure the server is running on port 3000.');
        console.error('Error:', error.message);
        process.exit(1);
    });

