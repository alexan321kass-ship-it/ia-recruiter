const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'test' + Math.random() + '@example.com',
  password: 'password123',
  role: 'CANDIDATE'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${body}`);
  });
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
