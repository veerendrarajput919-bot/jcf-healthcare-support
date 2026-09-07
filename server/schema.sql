-- JCF Healthcare Support Database Schema (SQLite)

-- 1. Users Table (Role-based authentication)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'doctor', 'patient', 'volunteer')),
  phone TEXT,
  city TEXT,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctors Table (Medical Specialists Directory)
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  department TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  experience_years INTEGER DEFAULT 5,
  hospital_affiliation TEXT NOT NULL,
  rating REAL DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 120,
  opd_slots TEXT,
  consultation_type TEXT DEFAULT 'Telemedicine & OPD',
  status TEXT DEFAULT 'Available',
  image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Patients & Aid Applications Table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  department TEXT NOT NULL,
  aid_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('Normal', 'Medium', 'Urgent', 'Emergency')),
  details TEXT NOT NULL,
  document_name TEXT,
  ai_summary TEXT,
  status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Under Review', 'Approved', 'In Progress', 'Completed', 'Rejected')),
  assigned_doctor_id TEXT,
  assigned_doctor_name TEXT,
  assigned_volunteer_id TEXT,
  assigned_volunteer_name TEXT,
  admin_notes TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Volunteers Table (Relief & Field Operations)
CREATE TABLE IF NOT EXISTS volunteers (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  blood_group TEXT,
  skills TEXT,
  available_days TEXT,
  status TEXT DEFAULT 'Verified & Active',
  service_hours INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Appointments Table (Tele-Consultations & OPD)
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  patient_email TEXT,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  department TEXT NOT NULL,
  type TEXT DEFAULT 'Teleconsultation',
  date TEXT NOT NULL,
  time TEXT,
  slot TEXT,
  symptoms TEXT,
  status TEXT DEFAULT 'Confirmed' CHECK(status IN ('Requested', 'Pending', 'Confirmed', 'In Consultation', 'Completed', 'Cancelled')),
  meeting_link TEXT,
  diagnosis TEXT,
  prescription TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 6. Inquiries Table (Contact & Support Form)
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Unread' CHECK(status IN ('Unread', 'In Progress', 'Resolved')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. FAQs Table (Knowledge Base synced with AI CareBot)
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Notifications Table (Multi-role message center)
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_role TEXT NOT NULL,
  recipient_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. System Activities Table (Audit trail)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(priority);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_role, recipient_id);
