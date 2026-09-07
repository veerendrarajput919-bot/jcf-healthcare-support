/**
 * JCF Healthcare Support - SQLite Database Engine
 * Powered by Node.js native SQLite (node:sqlite)
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'jcf_healthcare.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize SQLite Database
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Schema
function initSchema() {
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schemaSql);
  }
}

// Initial Seed Data
function seedInitialData() {
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (usersCount > 0) return; // Already seeded

  console.log('🌱 Seeding initial records into SQLite Database...');

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, phone, city, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('USR-ADMIN', 'Board Administrator', 'admin@jcfhealthcare.org', 'Admin@2026', 'admin', '+91 1800 200 8899', 'New Delhi', '👨‍💼');
  insertUser.run('USR-DOC-1', 'Dr. Rajesh Varma', 'rajesh.varma@jcfhealthcare.org', 'Doctor@2026', 'doctor', '+91 98111 44556', 'New Delhi', '👨‍⚕️');
  insertUser.run('USR-DOC-2', 'Dr. Ananya Sharma', 'ananya.sharma@jcfhealthcare.org', 'Doctor@2026', 'doctor', '+91 98222 55667', 'Mumbai', '👩‍⚕️');
  insertUser.run('USR-PAT-1', 'Amina Khatun', 'amina.khatun@gmail.com', 'Patient@2026', 'patient', '+91 98765 43210', 'Bhopal', '👤');
  insertUser.run('USR-VOL-1', 'Dr. Sameer Siddiqui', 'sameer.s@jcfhealthcare.org', 'Volunteer@2026', 'volunteer', '+91 98444 77889', 'Lucknow', '🤝');

  // 2. Seed Doctors
  const insertDoc = db.prepare(`
    INSERT INTO doctors (id, user_id, name, specialty, department, qualifications, experience_years, hospital_affiliation, rating, reviews_count, opd_slots, status, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDoc.run(
    'DOC-101', 'USR-DOC-1', 'Dr. Rajesh Varma', 'Senior Cardiologist & Interventionist', 'Cardiology',
    'MBBS, MD (Medicine), DM (Cardiology) - AIIMS New Delhi', 18,
    'Apollo Hospitals & Honorary Chief Medical Advisor, JCF', 4.95, 340,
    'Mon, Wed, Fri (10:00 AM - 1:00 PM)', 'Available', 'images/doctor-rajesh.jpg'
  );

  insertDoc.run(
    'DOC-102', 'USR-DOC-2', 'Dr. Ananya Sharma', 'Pediatric Specialist & Child Health', 'Pediatrics',
    'MBBS, MD (Pediatrics), Fellowship in Neonatology', 12,
    'Max Super Speciality Hospital, Mumbai', 4.92, 280,
    'Tue, Thu, Sat (11:00 AM - 3:00 PM)', 'Available', 'images/doctor-ananya.jpg'
  );

  insertDoc.run(
    'DOC-103', null, 'Dr. Pooja Rao', 'Medical Oncologist & Cancer Care', 'Oncology',
    'MBBS, MD, DNB (Medical Oncology) - Tata Memorial', 15,
    'Tata Memorial Hospital & JCF Oncology Cell', 4.88, 210,
    'Wed, Sat (2:00 PM - 5:00 PM)', 'Available', 'images/doctor-pooja.jpg'
  );

  insertDoc.run(
    'DOC-104', 'USR-VOL-1', 'Dr. Sameer Siddiqui', 'Community Medicine & Public Health', 'General OPD & Community Health',
    'MBBS, MPH - Community Health Specialist', 10,
    'Civil Hospital & Lead Volunteer Coordinator, JCF', 4.90, 195,
    'Daily (9:00 AM - 12:00 PM)', 'Available', 'images/doctor-sameer.jpg'
  );

  // 3. Seed Patients & Aid Applications
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, user_id, name, age, gender, phone, email, city, department, aid_type, priority, details, document_name, ai_summary, status, assigned_doctor_id, assigned_doctor_name, assigned_volunteer_id, assigned_volunteer_name, admin_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPatient.run(
    'JCF-PAT-7814', 'USR-PAT-1', 'Amina Khatun', 42, 'Female', '+91 98765 43210', 'amina.khatun@gmail.com', 'Bhopal',
    'Cardiology', 'Free Prescription Medicines', 'Urgent',
    'Requires 3-month supply of chronic heart failure medications (Enalapril 5mg & Bisoprolol 2.5mg). Family income below BPL limit.',
    'Prescription_AIIMS_Cardio_Sep2026.pdf',
    '42yo Female, Bhopal | Cardiology: High priority refill needed for chronic heart failure. Socio-economic threshold eligible.',
    'Approved', 'DOC-101', 'Dr. Rajesh Varma', 'VOL-1044', 'Dr. Sameer Siddiqui',
    'Prescription verified with AIIMS OPD slip. Approved 3-month pharmacy voucher dispatch.'
  );

  insertPatient.run(
    'JCF-PAT-9032', null, 'Rohan Sharma', 8, 'Male', '+91 98111 22334', 'parent.sharma@example.com', 'Mumbai',
    'Pediatrics', 'Surgery Financial Aid', 'Emergency',
    'Urgent congenital hernia repair assistance needed at civic municipal hospital. Hospital bill estimate ₹45,000.',
    'Hospital_Surgery_Estimate_Bill.pdf',
    '8yo Male, Mumbai | Pediatrics: CRITICAL emergency surgery grant. Estimate ₹45,000. Immediate board sanction required.',
    'In Progress', 'DOC-102', 'Dr. Ananya Sharma', 'VOL-1044', 'Dr. Sameer Siddiqui',
    'Grant of ₹40,000 sanctioned directly to hospital billing department.'
  );

  insertPatient.run(
    'JCF-PAT-6421', null, 'Gurpreet Singh', 58, 'Male', '+91 97888 33445', 'gurpreet.s@example.com', 'Lucknow',
    'Medicine Bank', 'Free Prescription Medicines', 'Normal',
    'Diabetes Type-2 patient needing monthly Metformin 500mg and Glimepiride strips.',
    'Diabetes_Prescription_2026.jpg',
    '58yo Male, Lucknow | Medicine Bank: Monthly diabetic supply grant. Verified.',
    'Approved', 'DOC-104', 'Dr. Sameer Siddiqui', 'VOL-1044', 'Dr. Sameer Siddiqui',
    'Sanctioned 6-month refill pass at partner chemist.'
  );

  // 4. Seed Volunteers
  const insertVol = db.prepare(`
    INSERT INTO volunteers (id, user_id, name, role, phone, email, city, blood_group, skills, available_days, status, service_hours, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVol.run('VOL-1044', 'USR-VOL-1', 'Dr. Sameer Siddiqui', 'Community Health Coordinator', '+91 98444 77889', 'sameer.s@jcfhealthcare.org', 'Lucknow', 'O+', 'Triage, First Aid, Logistics', 'Weekdays & Emergency On-Call', 'Verified & Active', 148, 1);
  insertVol.run('VOL-1045', null, 'Sunita Deshmukh', 'Field Pharmacist & Medicine Dispenser', '+91 98333 44556', 'sunita.d@example.com', 'Mumbai', 'B+', 'Pharmacy Dispatch, Verification', 'Mon, Wed, Fri', 'Verified & Active', 92, 1);
  insertVol.run('VOL-1046', null, 'Vikram Malhotra', 'Emergency Ambulance Coordinator', '+91 98111 99887', 'vikram.m@example.com', 'New Delhi', 'AB+', 'Ambulance Dispatch, BLS Certified', '24/7 Night Shift', 'Verified & Active', 210, 1);
  insertVol.run('VOL-1047', null, 'Priya Nair', 'Community Camp Organizer', '+91 98555 11223', 'priya.nair@example.com', 'Bhopal', 'A-', 'Camp Logistics, Patient Registration', 'Weekends', 'Verified & Active', 64, 1);

  // 5. Seed Appointments
  const insertApt = db.prepare(`
    INSERT INTO appointments (id, patient_name, patient_phone, patient_email, doctor_id, doctor_name, department, type, date, time, slot, symptoms, status, meeting_link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertApt.run(
    'JCF-APT-101', 'Amina Khatun', '+91 98765 43210', 'amina.khatun@gmail.com',
    'DOC-101', 'Dr. Rajesh Varma', 'Cardiology', 'Teleconsultation',
    'Tomorrow', '10:30 AM', '10:30 AM - 11:00 AM',
    'Post-refill evaluation for hypertension and shortness of breath upon exertion.',
    'Confirmed', 'https://meet.jit.si/JCF-Cardio-Consult-101'
  );

  insertApt.run(
    'JCF-APT-102', 'Rohan Sharma', '+91 98111 22334', 'parent.sharma@example.com',
    'DOC-102', 'Dr. Ananya Sharma', 'Pediatrics', 'Video Consultation',
    'Today', '02:00 PM', '02:00 PM - 02:30 PM',
    'Pre-surgical pediatric physical assessment and anesthesia clearance.',
    'In Consultation', 'https://meet.jit.si/JCF-Pediatric-Room-102'
  );

  insertApt.run(
    'JCF-APT-103', 'Gurpreet Singh', '+91 97888 33445', 'gurpreet.s@example.com',
    'DOC-104', 'Dr. Sameer Siddiqui', 'Community Medicine', 'OPD Checkup',
    '15 Sep 2026', '11:00 AM', '11:00 AM - 11:30 AM',
    'Fasting blood sugar follow-up and HbA1c lab result check.',
    'Confirmed', 'https://meet.jit.si/JCF-General-OPD-103'
  );

  // 6. Seed FAQs
  const insertFaq = db.prepare(`
    INSERT INTO faqs (id, question, answer, category)
    VALUES (?, ?, ?, ?)
  `);

  insertFaq.run('FAQ-1', 'How can I apply for 100% free prescription medicines?', 'You can apply online by clicking "Get Free Patient Aid", selecting "Free Prescription Medicines", and uploading your hospital prescription slip along with valid ID. Our medical board reviews cases within 24 hours.', 'Medicines');
  insertFaq.run('FAQ-2', 'How can I book a free doctor consultation?', 'Navigate to the "Doctors" section, select your required medical specialty (Cardiology, Pediatrics, Oncology, etc.), choose an available time slot, and submit. You will receive an instant appointment ID and video room link.', 'Appointments');
  insertFaq.run('FAQ-3', 'Who is eligible for JCF Healthcare surgical aid grants?', 'Underprivileged patients with family income below the low-income threshold, children with congenital defects, and emergency cardiac or oncology surgical candidates are eligible for sponsored grants up to ₹2,50,000.', 'Grants');
  insertFaq.run('FAQ-4', 'How can I join as a medical or field volunteer?', 'Doctors, nurses, paramedics, and citizens can click "Volunteer With Us", fill out the registration form, and choose their role. Verified volunteers receive official certificates and field badges.', 'Volunteer');

  // 7. Seed Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, recipient_role, recipient_id, title, message, type, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run('NOTIF-1', 'patient', 'USR-PAT-1', 'Medicine Voucher Approved', 'Your 3-month cardiology prescription grant has been sanctioned. Coordinator Dr. Sameer will deliver this week.', 'success', 0);
  insertNotif.run('NOTIF-2', 'doctor', 'DOC-101', 'Upcoming Video Teleconsultation', 'Appointment with Amina Khatun scheduled for tomorrow at 10:30 AM.', 'info', 0);
  insertNotif.run('NOTIF-3', 'admin', null, 'Emergency Triage Alert', 'Emergency surgery grant request submitted for Rohan Sharma (Pediatric Hernia).', 'emergency', 0);

  // 8. Seed Activities
  const insertAct = db.prepare('INSERT INTO activities (id, text, type) VALUES (?, ?, ?)');
  insertAct.run('ACT-1', 'Medicine grant of ₹5,000 approved for Amina Khatun', 'patient');
  insertAct.run('ACT-2', 'New Tele-Consultation scheduled with Dr. Rajesh Varma', 'appointment');
  insertAct.run('ACT-3', 'Volunteer Dr. Sameer completed relief dispatch in Lucknow', 'volunteer');

  console.log('✅ SQLite Database successfully seeded with full clinical records!');
}

// Initialize Database on load
initSchema();
seedInitialData();

module.exports = {
  db,
  initSchema,
  seedInitialData
};
