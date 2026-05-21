const http = require('http');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  const email = 'test' + Date.now() + '@example.com';
  
  // 1. Register
  const regData = JSON.stringify({
    name: 'Test Candidate',
    email: email,
    password: 'password123',
    role: 'CANDIDATE'
  });

  const regRes = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': regData.length }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.write(regData);
    req.end();
  });

  console.log('REGISTER STATUS:', regRes.status);
  const token = regRes.body.access_token;

  // 2. Upload PDF
  const filePath = path.join(__dirname, 'cv_test.pdf');
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  
  let data = `--${boundary}\r\n`;
  data += `Content-Disposition: form-data; name="file"; filename="cv_test.pdf"\r\n`;
  data += `Content-Type: application/pdf\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/cvs/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('UPLOAD STATUS:', res.statusCode);
      console.log('UPLOAD BODY:', body);
    });
  });

  req.write(data);
  fs.createReadStream(filePath).pipe(req, { end: false });
  fs.createReadStream(filePath).on('end', () => req.end(footer));
}

testUpload();
