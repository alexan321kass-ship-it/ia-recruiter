const http = require('http');

async function test() {
  // 1. Login to get token
  const loginData = JSON.stringify({
    email: 'error@test.com',
    password: 'password123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const loginRes = await new Promise((resolve) => {
    const req = http.request(loginOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.write(loginData);
    req.end();
  });

  console.log('LOGIN STATUS:', loginRes.status);
  const token = loginRes.body.access_token;

  // 2. Create Job
  const jobData = JSON.stringify({
    title: 'Automated Test Job',
    description: 'This is a test description',
    skills: ['Node', 'Prisma'],
    experience: 2
  });

  const jobOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/jobs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': jobData.length,
      'Authorization': `Bearer ${token}`
    }
  };

  const jobRes = await new Promise((resolve) => {
    const req = http.request(jobOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.write(jobData);
    req.end();
  });

  console.log('JOB CREATE STATUS:', jobRes.status);
  console.log('JOB CREATE BODY:', jobRes.body);
}

test();
