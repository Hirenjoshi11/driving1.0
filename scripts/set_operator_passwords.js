const bcrypt = require('bcryptjs');
const { getDb } = require('../database/db');

const db = getDb();
const hash = bcrypt.hashSync('operator123', 10);
const adminHash = bcrypt.hashSync('admin123', 10);

const res = db.prepare("UPDATE users SET password_hash = ? WHERE role = 'operator'").run(hash);
console.log(`Updated ${res.changes} operator accounts with password: operator123`);

const resAdmin = db.prepare("UPDATE users SET password_hash = ? WHERE role = 'admin'").run(adminHash);
console.log(`Verified ${resAdmin.changes} admin accounts with password: admin123`);
