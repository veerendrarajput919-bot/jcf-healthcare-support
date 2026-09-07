/**
 * JCF Healthcare Support - Full-Stack Express REST API Server
 * Connects frontend panels to SQLite Database with JSON endpoints and AI Triage
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, seedInitialData } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
const PUBLIC_DIR = path.join(__dirname, '..');
app.use(express.static(PUBLIC_DIR));

// Helper to generate IDs
function generateId(prefix) {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}`;
}

// ==========================================
// 1. AUTHENTICATION & USERS APIS
// ==========================================

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email: identifier, password, role } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Identifier and password are required.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();

    // 1. Search in users table
    let user = null;
    if (role && role !== 'all') {
      user = db.prepare(`
        SELECT * FROM users 
        WHERE (LOWER(email) = ? OR LOWER(id) = ? OR REPLACE(phone, ' ', '') = REPLACE(?, ' ', ''))
        AND role = ?
      `).get(cleanId, cleanId, cleanId, role.toLowerCase());
    } else {
      user = db.prepare(`
        SELECT * FROM users 
        WHERE LOWER(email) = ? OR LOWER(id) = ? OR REPLACE(phone, ' ', '') = REPLACE(?, ' ', '')
      `).get(cleanId, cleanId, cleanId);
    }

    // 2. If not found in users, check if it's a doctor ID (e.g. DOC-101)
    if (!user && (!role || role === 'doctor' || role === 'all')) {
      const doc = db.prepare('SELECT * FROM doctors WHERE LOWER(id) = ? OR LOWER(name) = ?').get(cleanId, cleanId);
      if (doc && doc.user_id) {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(doc.user_id);
      } else if (doc) {
        user = {
          id: doc.id,
          name: doc.name,
          email: `${doc.name.toLowerCase().replace(/[^a-z]/g, '')}@jcfhealthcare.org`,
          role: 'doctor',
          password: 'Doctor@2026',
          avatar: '👨‍⚕️'
        };
      }
    }

    // 3. If not found in users, check if it's a patient ID (e.g. JCF-PAT-7814)
    if (!user && (!role || role === 'patient' || role === 'all')) {
      const pat = db.prepare('SELECT * FROM patients WHERE LOWER(id) = ?').get(cleanId);
      if (pat && pat.user_id) {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(pat.user_id);
      } else if (pat) {
        user = {
          id: pat.id,
          name: pat.name,
          email: pat.email || `${pat.id.toLowerCase()}@jcfhealthcare.org`,
          role: 'patient',
          password: 'Patient@2026',
          avatar: '👤'
        };
      }
    }

    // 4. If not found in users, check if it's a volunteer ID (e.g. VOL-1044)
    if (!user && (!role || role === 'volunteer' || role === 'all')) {
      const vol = db.prepare('SELECT * FROM volunteers WHERE LOWER(id) = ?').get(cleanId);
      if (vol && vol.user_id) {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(vol.user_id);
      } else if (vol) {
        user = {
          id: vol.id,
          name: vol.name,
          email: vol.email || `${vol.id.toLowerCase()}@jcfhealthcare.org`,
          role: 'volunteer',
          password: 'Volunteer@2026',
          avatar: '🤝'
        };
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or user not found.' });
    }

    // Check password (allow standard role passwords or demo passwords)
    const validPasswords = [user.password, 'Demo@2026', 'Admin@2026', 'Doctor@2026', 'Patient@2026', 'Volunteer@2026'];
    if (user.password && !validPasswords.includes(password)) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    // Don't leak raw password
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: `Welcome back, ${safeUser.name}!`,
      user: safeUser,
      token: `jcf_jwt_token_${safeUser.id}_${Date.now()}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role, phone, city } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Name, email, password, and role are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    const id = generateId(`USR-${role.toUpperCase().slice(0, 3)}`);
    const avatar = role === 'doctor' ? '👨‍⚕️' : role === 'admin' ? '👨‍💼' : role === 'volunteer' ? '🤝' : '👤';

    db.prepare(`
      INSERT INTO users (id, name, email, password, role, phone, city, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, password, role.toLowerCase(), phone || '', city || '', avatar);

    // If patient, volunteer, or doctor, insert into their respective tables too
    if (role === 'patient') {
      const patId = generateId('JCF-PAT');
      db.prepare(`
        INSERT INTO patients (id, user_id, name, age, gender, phone, email, city, department, aid_type, priority, details, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(patId, id, name, req.body.age || 30, req.body.gender || 'Other', phone || '', email, city || 'India', 'General Care', req.body.aidType || 'General Healthcare Aid', 'Normal', req.body.details || 'Registered user profile', 'Pending');
    } else if (role === 'volunteer') {
      const volId = generateId('VOL');
      db.prepare(`
        INSERT INTO volunteers (id, user_id, name, role, phone, email, city, blood_group, skills, status, service_hours, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(volId, id, name, req.body.volunteerRole || 'Community Relief Hero', phone || '', email, city || 'India', req.body.bloodGroup || 'O+', req.body.skills || 'General Volunteer Support', 'Verified & Active', 0, 1);
    } else if (role === 'doctor') {
      const docId = generateId('DOC');
      db.prepare(`
        INSERT INTO doctors (id, user_id, name, specialty, department, qualifications, experience_years, hospital_affiliation, rating, reviews_count, opd_slots, status, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(docId, id, name, req.body.specialty || 'General Medicine', req.body.department || 'General OPD', req.body.qualifications || 'MBBS', req.body.experienceYears || 5, req.body.hospitalAffiliation || 'JCF Medical Advisory Network', 4.9, 0, req.body.opdSlots || 'Mon-Fri (10:00 AM - 1:00 PM)', 'Available', 'images/doctor-rajesh.jpg');
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log into your portal.',
      user: { id, name, email, role: role.toLowerCase(), phone, city, avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. PATIENTS & HEALTHCARE AID APIS
// ==========================================

// Get all patients / aid requests
app.get('/api/patients', (req, res) => {
  try {
    const { status, priority, city } = req.query;
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (city) {
      query += ' AND LOWER(city) LIKE LOWER(?)';
      params.push(`%${city}%`);
    }

    query += ' ORDER BY submitted_at DESC';
    const patients = db.prepare(query).all(...params);
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get patient by ID
app.get('/api/patients/:id', (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE UPPER(id) = UPPER(?)').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient record not found.' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit new patient aid application
app.post('/api/patients', (req, res) => {
  try {
    const { name, age, gender, phone, email, city, department, aidType, priority, details, documentName } = req.body;
    if (!name || !phone || !aidType) {
      return res.status(400).json({ success: false, error: 'Name, phone number, and aid type are required.' });
    }

    const id = generateId('JCF-PAT');
    const prio = priority || (details?.toLowerCase().includes('emergency') || details?.toLowerCase().includes('critical') ? 'Emergency' : 'Normal');
    
    // AI Triage summary generator
    const aiSummary = `${age || 35}yo ${gender || 'Patient'}, ${city || 'India'} | ${department || 'General OPD'}: ${aidType} requested. Priority Level: [${prio.toUpperCase()}]. Medical review queued.`;

    db.prepare(`
      INSERT INTO patients (
        id, name, age, gender, phone, email, city, department, aid_type, priority, details, document_name, ai_summary, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, age || 35, gender || 'Patient', phone, email || '', city || 'India',
      department || 'General Medicine', aidType, prio, details || 'Aid application submitted via web portal.',
      documentName || 'Medical_Record_Attachment.pdf', aiSummary, 'Pending'
    );

    // Log Activity & Create Notification
    db.prepare('INSERT INTO activities (id, text, type) VALUES (?, ?, ?)').run(
      generateId('ACT'), `New Patient Request: ${name} (${id}) for ${aidType}`, 'patient'
    );

    db.prepare(`
      INSERT INTO notifications (id, recipient_role, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      generateId('NOTIF'), 'admin',
      `New ${prio} Patient Request`,
      `${name} from ${city || 'India'} applied for ${aidType}. Reference: ${id}`,
      prio === 'Emergency' ? 'emergency' : 'info'
    );

    res.status(201).json({
      success: true,
      message: 'Healthcare aid request submitted successfully!',
      data: { id, name, aidType, priority: prio, status: 'Pending', aiSummary }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update patient status (Approve, In Progress, Complete, etc.)
app.patch('/api/patients/:id/status', (req, res) => {
  try {
    const { status, adminNotes, assignedDoctorId, assignedVolunteerId } = req.body;
    const patient = db.prepare('SELECT * FROM patients WHERE UPPER(id) = UPPER(?)').get(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    let docName = patient.assigned_doctor_name;
    if (assignedDoctorId) {
      const doc = db.prepare('SELECT name FROM doctors WHERE id = ?').get(assignedDoctorId);
      if (doc) docName = doc.name;
    }

    let volName = patient.assigned_volunteer_name;
    if (assignedVolunteerId) {
      const vol = db.prepare('SELECT name FROM volunteers WHERE id = ?').get(assignedVolunteerId);
      if (vol) volName = vol.name;
    }

    db.prepare(`
      UPDATE patients
      SET status = COALESCE(?, status),
          admin_notes = COALESCE(?, admin_notes),
          assigned_doctor_id = COALESCE(?, assigned_doctor_id),
          assigned_doctor_name = COALESCE(?, assigned_doctor_name),
          assigned_volunteer_id = COALESCE(?, assigned_volunteer_id),
          assigned_volunteer_name = COALESCE(?, assigned_volunteer_name)
      WHERE UPPER(id) = UPPER(?)
    `).run(status, adminNotes, assignedDoctorId, docName, assignedVolunteerId, volName, req.params.id);

    db.prepare('INSERT INTO activities (id, text, type) VALUES (?, ?, ?)').run(
      generateId('ACT'), `Patient ${patient.name} (${patient.id}) status updated to: ${status}`, 'patient'
    );

    res.json({ success: true, message: `Patient status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. DOCTORS & SPECIALISTS APIS
// ==========================================

// Get all doctors
app.get('/api/doctors', (req, res) => {
  try {
    const { department, status } = req.query;
    let query = 'SELECT * FROM doctors WHERE 1=1';
    const params = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const doctors = db.prepare(query).all(...params);
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle Doctor OPD availability
app.patch('/api/doctors/:id/availability', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE doctors SET status = ? WHERE id = ?').run(status || 'Available', req.params.id);
    res.json({ success: true, message: `Doctor status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Doctor profile
app.patch('/api/doctors/:id', (req, res) => {
  try {
    const { specialty, qualifications, hospitalAffiliation, opdSlots, phone } = req.body;
    db.prepare(`
      UPDATE doctors
      SET specialty = COALESCE(?, specialty),
          qualifications = COALESCE(?, qualifications),
          hospital_affiliation = COALESCE(?, hospital_affiliation),
          opd_slots = COALESCE(?, opd_slots)
      WHERE id = ?
    `).run(specialty, qualifications, hospitalAffiliation, opdSlots, req.params.id);
    res.json({ success: true, message: 'Doctor profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new doctor
app.post('/api/doctors', (req, res) => {
  try {
    const { name, specialty, department, qualifications, experienceYears, hospitalAffiliation, opdSlots, image } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ success: false, error: 'Name and specialty are required.' });
    }
    const id = generateId('DOC');
    db.prepare(`
      INSERT INTO doctors (id, name, specialty, department, qualifications, experience_years, hospital_affiliation, rating, reviews_count, opd_slots, status, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, specialty, department || 'General OPD', qualifications || 'MBBS', experienceYears || 5, hospitalAffiliation || 'JCF Partner Hospital', 4.9, 0, opdSlots || 'Mon-Fri', 'Available', image || 'images/doctor-rajesh.jpg');
    res.status(201).json({ success: true, message: 'Doctor registered successfully!', data: { id, name } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. VOLUNTEERS & RELIEF MISSIONS APIS
// ==========================================

// Get all volunteers
app.get('/api/volunteers', (req, res) => {
  try {
    const volunteers = db.prepare('SELECT * FROM volunteers ORDER BY created_at DESC').all();
    res.json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register volunteer
app.post('/api/volunteers', (req, res) => {
  try {
    const { name, role, phone, email, city, bloodGroup, skills, availableDays } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and phone number are required.' });
    }

    const id = generateId('VOL');
    db.prepare(`
      INSERT INTO volunteers (id, name, role, phone, email, city, blood_group, skills, available_days, status, service_hours, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, name, role || 'Community Health Volunteer', phone, email || '', city || 'India',
      bloodGroup || 'O+', skills || 'General Support', availableDays || 'Flexible',
      'Verified & Active', 0, 1
    );

    res.status(201).json({ success: true, message: 'Volunteer registered successfully!', data: { id, name } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update volunteer status
app.patch('/api/volunteers/:id/status', (req, res) => {
  try {
    const { status, verified } = req.body;
    db.prepare(`
      UPDATE volunteers
      SET status = COALESCE(?, status),
          verified = COALESCE(?, verified)
      WHERE UPPER(id) = UPPER(?)
    `).run(status, verified !== undefined ? (verified ? 1 : 0) : null, req.params.id);
    res.json({ success: true, message: `Volunteer ${req.params.id} updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. APPOINTMENTS & TELE-HEALTH APIS
// ==========================================

// Get all appointments
app.get('/api/appointments', (req, res) => {
  try {
    const { doctorId, status, patientEmail } = req.query;
    let query = 'SELECT * FROM appointments WHERE 1=1';
    const params = [];

    if (doctorId) {
      query += ' AND doctor_id = ?';
      params.push(doctorId);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (patientEmail) {
      query += ' AND LOWER(patient_email) = LOWER(?)';
      params.push(patientEmail);
    }

    query += ' ORDER BY created_at DESC';
    const appointments = db.prepare(query).all(...params);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Book appointment
app.post('/api/appointments', (req, res) => {
  try {
    const { patientName, patientPhone, patientEmail, doctorId, doctorName, department, type, date, time, slot, symptoms } = req.body;
    if (!patientName || !doctorName) {
      return res.status(400).json({ success: false, error: 'Patient name and doctor are required.' });
    }

    const id = generateId('JCF-APT');
    const meetLink = `https://meet.jit.si/JCF-CareRoom-${id}`;

    db.prepare(`
      INSERT INTO appointments (
        id, patient_name, patient_phone, patient_email, doctor_id, doctor_name, department, type, date, time, slot, symptoms, status, meeting_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, patientName, patientPhone || '', patientEmail || '', doctorId || 'DOC-101', doctorName,
      department || 'General Medicine', type || 'Teleconsultation', date || 'Tomorrow', time || '11:00 AM',
      slot || '11:00 AM - 11:30 AM', symptoms || 'General medical follow-up', 'Confirmed', meetLink
    );

    // Activity & Notification
    db.prepare('INSERT INTO activities (id, text, type) VALUES (?, ?, ?)').run(
      generateId('ACT'), `Appointment ${id} scheduled: ${patientName} with ${doctorName}`, 'appointment'
    );

    res.status(201).json({
      success: true,
      message: 'Doctor consultation appointment confirmed!',
      data: { id, patientName, doctorName, date, time, status: 'Confirmed', meetingLink: meetLink }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update appointment status
app.patch('/api/appointments/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE appointments SET status = ? WHERE UPPER(id) = UPPER(?)').run(status, req.params.id);
    res.json({ success: true, message: `Appointment ${req.params.id} status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save Consultation Notes & E-Prescription
app.post('/api/appointments/:id/notes', (req, res) => {
  try {
    const { diagnosis, prescription, lifestyleAdvice, followUpDate } = req.body;
    db.prepare(`
      UPDATE appointments
      SET diagnosis = ?,
          prescription = ?,
          notes = ?,
          status = 'Completed'
      WHERE UPPER(id) = UPPER(?)
    `).run(diagnosis || '', prescription || '', `${lifestyleAdvice || ''} | Follow-up: ${followUpDate || 'None'}`, req.params.id);

    db.prepare('INSERT INTO activities (id, text, type) VALUES (?, ?, ?)').run(
      generateId('ACT'), `Consultation completed & E-Prescription issued for Appointment: ${req.params.id}`, 'appointment'
    );

    res.json({ success: true, message: 'Consultation notes and prescription recorded successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. FAQS & KNOWLEDGE BASE APIS
// ==========================================

// Get FAQs
app.get('/api/faqs', (req, res) => {
  try {
    const faqs = db.prepare('SELECT * FROM faqs ORDER BY created_at ASC').all();
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add FAQ
app.post('/api/faqs', (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required.' });
    }

    const id = generateId('FAQ');
    db.prepare('INSERT INTO faqs (id, question, answer, category) VALUES (?, ?, ?, ?)').run(
      id, question, answer, category || 'General'
    );

    res.status(201).json({ success: true, message: 'FAQ added successfully!', data: { id, question, answer } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete FAQ
app.delete('/api/faqs/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM faqs WHERE UPPER(id) = UPPER(?)').run(req.params.id);
    res.json({ success: true, message: `FAQ ${req.params.id} removed.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 7. INQUIRIES & CONTACT MESSAGES APIS
// ==========================================

app.get('/api/inquiries', (req, res) => {
  try {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/inquiries', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const id = generateId('INQ');
    db.prepare(`
      INSERT INTO inquiries (id, name, email, phone, subject, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, email, phone || '', subject || 'General Inquiry', message, 'Unread');

    res.status(201).json({ success: true, message: 'Message sent! Our support team will respond within 24 hours.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/inquiries/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE inquiries SET status = ? WHERE UPPER(id) = UPPER(?)').run(status || 'Resolved', req.params.id);
    res.json({ success: true, message: `Inquiry status updated to ${status}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 8. NOTIFICATIONS & ACTIVITIES APIS
// ==========================================

app.get('/api/notifications', (req, res) => {
  try {
    const { role, recipientId } = req.query;
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND (recipient_role = ? OR recipient_role = ?)';
      params.push(role, 'all');
    }
    if (recipientId) {
      query += ' AND (recipient_id = ? OR recipient_id IS NULL)';
      params.push(recipientId);
    }

    query += ' ORDER BY created_at DESC';
    const notifications = db.prepare(query).all(...params);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/notifications/read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1').run();
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications', (req, res) => {
  try {
    const { recipientRole, recipientId, title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Title and message are required.' });
    }

    const id = generateId('NOTIF');
    db.prepare(`
      INSERT INTO notifications (id, recipient_role, recipient_id, title, message, type, is_read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, recipientRole || 'all', recipientId || null, title, message, type || 'info');

    res.status(201).json({ success: true, message: 'Notification published.', data: { id, title } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/activities', (req, res) => {
  try {
    const activities = db.prepare('SELECT * FROM activities ORDER BY created_at DESC LIMIT 20').all();
    res.json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 9. UNIFIED STATS & METRICS APIS
// ==========================================

app.get('/api/stats', (req, res) => {
  try {
    const patientsCount = db.prepare('SELECT COUNT(*) as c FROM patients').get().c;
    const pendingRequests = db.prepare("SELECT COUNT(*) as c FROM patients WHERE status IN ('Pending', 'Under Review')").get().c;
    const doctorsCount = db.prepare('SELECT COUNT(*) as c FROM doctors').get().c;
    const volunteersCount = db.prepare('SELECT COUNT(*) as c FROM volunteers').get().c;
    const appointmentsCount = db.prepare('SELECT COUNT(*) as c FROM appointments').get().c;
    const todayAppointments = db.prepare("SELECT COUNT(*) as c FROM appointments WHERE status = 'Confirmed'").get().c;

    res.json({
      success: true,
      stats: {
        totalPatients: patientsCount,
        pendingRequests: pendingRequests,
        totalDoctors: doctorsCount,
        totalVolunteers: volunteersCount,
        totalAppointments: appointmentsCount,
        todayAppointments: todayAppointments,
        aidDisbursed: '₹3.85 Cr',
        volunteerHours: '4,280+ Hrs'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 9. AI CAREBOT CHAT & TRIAGE API
// ==========================================

app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const lower = message.toLowerCase();
    let responseText = '';
    let actions = [];

    if (lower.includes('appointment') || lower.includes('book') || lower.includes('doctor')) {
      responseText = '🩺 You can book a 100% free doctor consultation by choosing a specialist in Cardiology, Pediatrics, Oncology, or General OPD.';
      actions = [
        { text: '📅 Book Doctor Appointment', action: 'open_appointment_modal' },
        { text: '👨‍⚕️ View Doctor Directory', action: 'view_doctors' }
      ];
    } else if (lower.includes('medicine') || lower.includes('dawa') || lower.includes('pharmacy')) {
      responseText = '💊 JCF provides 100% free prescription medicines for chronic heart conditions, diabetes, and oncology. Valid prescription required.';
      actions = [
        { text: '📝 Apply for Free Medicines', action: 'open_patient_form', param: 'Free Prescription Medicines' }
      ];
    } else if (lower.includes('surgery') || lower.includes('grant') || lower.includes('money')) {
      responseText = '❤️ We sponsor pediatric surgeries and critical hospital procedures up to ₹2,50,000 paid directly to the hospital billing desk.';
      actions = [
        { text: '📄 Apply for Surgery Aid', action: 'open_patient_form', param: 'Surgery Financial Aid' }
      ];
    } else if (lower.includes('volunteer') || lower.includes('join') || lower.includes('help')) {
      responseText = '🤝 Join JCF Healthcare as a doctor, nurse, ambulance driver, or community coordinator to save lives in your city.';
      actions = [
        { text: '✍️ Register as Volunteer', action: 'open_volunteer_form' }
      ];
    } else if (lower.includes('services')) {
      responseText = '🏥 Our services include Free Lifesaving Medicines, Specialist Tele-Consultations, Financial Surgery Aid, and 24/7 Ambulance Dispatch.';
      actions = [
        { text: '🩺 Book Appointment', action: 'open_appointment_modal' },
        { text: '💊 Request Aid', action: 'open_patient_form' }
      ];
    } else {
      // Check dynamic FAQs from DB
      const dbFaq = db.prepare("SELECT * FROM faqs WHERE LOWER(question) LIKE ? LIMIT 1").get(`%${lower.slice(0, 20)}%`);
      if (dbFaq) {
        responseText = `**${dbFaq.question}**\n\n${dbFaq.answer}`;
      } else {
        responseText = '👋 I can help you apply for free medicines, book doctor tele-consultations, register as a volunteer, or check application status.';
        actions = [
          { text: '🩺 Book Appointment', action: 'open_appointment_modal' },
          { text: '💊 Free Medicines', action: 'open_patient_form' },
          { text: '🔍 Track Application', action: 'open_tracker_modal' }
        ];
      }
    }

    res.json({
      success: true,
      sender: 'bot',
      reply: responseText,
      actions: actions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 10. SYSTEM BACKUP & SEED RESET APIS
// ==========================================

app.get('/api/system/export', (req, res) => {
  try {
    const backup = {
      users: db.prepare('SELECT id, name, email, role, phone, city, created_at FROM users').all(),
      doctors: db.prepare('SELECT * FROM doctors').all(),
      patients: db.prepare('SELECT * FROM patients').all(),
      volunteers: db.prepare('SELECT * FROM volunteers').all(),
      appointments: db.prepare('SELECT * FROM appointments').all(),
      faqs: db.prepare('SELECT * FROM faqs').all(),
      inquiries: db.prepare('SELECT * FROM inquiries').all(),
      exportedAt: new Date().toISOString()
    };
    res.json({ success: true, backup });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/system/reset', (req, res) => {
  try {
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
    res.json({ success: true, message: 'Database reset to initial demo seeds.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const DATA_DIR = path.join(__dirname, '..', 'data');

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 JCF Healthcare Support Full-Stack Server LIVE!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 SQLite DB: ${path.join(DATA_DIR, 'jcf_healthcare.db')}`);
    console.log(`🔌 REST API Endpoints: http://localhost:${PORT}/api/*`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
