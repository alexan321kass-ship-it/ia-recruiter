const pg = require('pg');
const passwords = ['password123', 'admin123', 'postgres', 'admin', 'password', 'root'];
const users = ['postgres', 'admin'];

async function tryConnect() {
  for (const user of users) {
    for (const password of passwords) {
      const pool = new pg.Pool({
        user,
        password,
        host: 'localhost',
        port: 5433,
        database: 'postgres', // try default db first
      });
      try {
        await pool.connect();
        console.log(`SUCCESS: user=${user}, password=${password}`);
        await pool.end();
        return;
      } catch (err) {
        console.log(`FAILED: user=${user}, password=${password} - ${err.message}`);
      }
    }
  }
}

tryConnect();
