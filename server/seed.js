/**
 * JCF Healthcare Support - Database Seed Script
 * Run via: npm run seed or node server/seed.js
 */

const { db, seedInitialData } = require('./db');

console.log('🔄 Resetting & Seeding Database...');
db.exec(`
  DELETE FROM activities;
  DELETE FROM notifications;
  DELETE FROM inquiries;
  DELETE FROM faqs;
  DELETE FROM appointments;
  DELETE FROM volunteers;
  DELETE FROM patients;
  DELETE FROM doctors;
  DELETE FROM users;
`);

seedInitialData();
console.log('✨ Database seeding complete!');
process.exit(0);
