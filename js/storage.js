/**
 * JCF Healthcare Support - Data Management, Models & Local Persistence
 * Unified store for Patients, Volunteers, Doctors, Appointments, Inquiries, FAQs, Notifications, and AI Logs.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'jcf_current_user',
  PATIENTS: 'jcf_patient_requests',
  VOLUNTEERS: 'jcf_volunteer_registrations',
  DOCTORS: 'jcf_doctor_directory',
  APPOINTMENTS: 'jcf_appointments',
  CONTACT_INQUIRIES: 'jcf_contact_inquiries',
  FAQS: 'jcf_faqs',
  NOTIFICATIONS: 'jcf_notifications',
  AI_LOGS: 'jcf_ai_logs',
  ACTIVITIES: 'jcf_recent_activities'
};

// Seed Data for Doctors
const DEFAULT_DOCTORS = [
  {
    id: 'DOC-101',
    name: 'Dr. Rajesh Varma',
    specialty: 'Cardiology & Heart Care',
    qualifications: 'MBBS, MD, DM (Cardiology) - AIIMS Alum',
    experience: '24+ Years',
    hospitalAffiliation: 'Apollo Hospitals & JCF Advisory Board',
    phone: '+91 98111 00221',
    email: 'dr.varma@jcfhealthcare.org',
    availableDays: 'Mon, Wed, Fri (2:00 PM - 6:00 PM)',
    status: 'Available for OPD',
    avatar: '👨‍⚕️',
    image: 'images/doctor-rajesh.jpg'
  },
  {
    id: 'DOC-102',
    name: 'Dr. Ananya Roy',
    specialty: 'Oncology & Palliative Medicine',
    qualifications: 'MBBS, DNB, DM (Medical Oncology)',
    experience: '18+ Years',
    hospitalAffiliation: 'Tata Memorial Network & Holy Family',
    phone: '+91 98222 00332',
    email: 'dr.ananya@jcfhealthcare.org',
    availableDays: 'Tue, Thu, Sat (10:00 AM - 3:00 PM)',
    status: 'Available for OPD',
    avatar: '👩‍⚕️',
    image: 'images/doctor-ananya.jpg'
  },
  {
    id: 'DOC-103',
    name: 'Dr. Sameer Siddiqui',
    specialty: 'Pediatric Care & Child Health',
    qualifications: 'MBBS, MD (Pediatrics), FIAP',
    experience: '15+ Years',
    hospitalAffiliation: 'Safdarjung Hospital Alum & JCF Clinic',
    phone: '+91 98333 00443',
    email: 'dr.sameer@jcfhealthcare.org',
    availableDays: 'Daily Emergency Triage (8:00 AM - 12:00 PM)',
    status: 'Available for OPD',
    avatar: '👨‍⚕️',
    image: 'images/doctor-sameer.jpg'
  },
  {
    id: 'DOC-104',
    name: 'Dr. Pooja Nair',
    specialty: 'Orthopedic & Emergency Surgery',
    qualifications: 'MBBS, MS (Ortho), Fellowship in Trauma',
    experience: '16+ Years',
    hospitalAffiliation: 'Max Healthcare & City Care Network',
    phone: '+91 98444 00554',
    email: 'dr.pooja@jcfhealthcare.org',
    availableDays: 'Mon, Thu (3:00 PM - 7:00 PM)',
    status: 'Available for OPD',
    avatar: '👩‍⚕️',
    image: 'images/doctor-pooja.jpg'
  }
];

// Seed Data for Patients / Support Requests
const DEFAULT_PATIENT_RECORDS = [
  {
    id: 'JCF-PAT-7814',
    name: 'Amina Khatun',
    age: 42,
    gender: 'Female',
    phone: '+91 98765 43210',
    email: 'amina.khatun@example.com',
    city: 'New Delhi',
    department: 'Cardiology',
    aidType: 'Free Prescription Medicines',
    priority: 'Urgent',
    details: 'Requires 3-month supply of chronic heart failure medications (Enalapril 5mg & Bisoprolol 2.5mg). Family income below BPL limit.',
    documentName: 'Prescription_AIIMS_Cardio_Sep2026.pdf',
    aiSummary: '42yo Female, Delhi | Cardiology: High priority refill needed for chronic heart failure (Enalapril + Bisoprolol). Socio-economic threshold eligible.',
    status: 'Approved',
    assignedVolunteerId: 'JCF-VOL-1044',
    assignedVolunteerName: 'Dr. Sameer Siddiqui',
    assignedDoctorId: 'DOC-101',
    assignedDoctorName: 'Dr. Rajesh Varma',
    adminNotes: 'Prescription verified with AIIMS OPD slip. Approved 3-month pharmacy voucher dispatch.',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-09-02T10:30:00Z', note: 'Request submitted online by patient.' },
      { status: 'Under Review', timestamp: '2026-09-02T14:15:00Z', note: 'Medical board verified prescription documents.' },
      { status: 'Approved', timestamp: '2026-09-03T09:00:00Z', note: 'Approved for 3-month supply. Volunteer assigned for delivery.' }
    ],
    submittedAt: '2026-09-02T10:30:00Z',
    estimatedReview: 'Completed'
  },
  {
    id: 'JCF-PAT-9032',
    name: 'Rohan Sharma',
    age: 8,
    gender: 'Male',
    phone: '+91 98111 22334',
    email: 'parent.sharma@example.com',
    city: 'Mumbai',
    department: 'Pediatric Care',
    aidType: 'Surgery Financial Aid',
    priority: 'Emergency',
    details: 'Urgent congenital hernia repair assistance needed at civic municipal hospital. Hospital bill estimate ₹45,000.',
    documentName: 'Hospital_Surgery_Estimate_Bill.pdf',
    aiSummary: '8yo Male, Mumbai | Pediatric Care: CRITICAL emergency surgery grant (Congenital Hernia Repair). Estimate ₹45,000. Immediate board sanction required.',
    status: 'In Progress',
    assignedVolunteerId: 'JCF-VOL-1044',
    assignedVolunteerName: 'Dr. Sameer Siddiqui',
    assignedDoctorId: 'DOC-102',
    assignedDoctorName: 'Dr. Farhana Begum',
    adminNotes: 'Grant of ₹40,000 sanctioned directly to hospital billing department. Dr. Farhana supervising.',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-09-04T15:45:00Z', note: 'Emergency surgery aid request received.' },
      { status: 'Under Review', timestamp: '2026-09-04T16:20:00Z', note: 'Fast-tracked under Emergency Pediatric Wing.' },
      { status: 'Approved', timestamp: '2026-09-04T18:00:00Z', note: 'Sanction letter issued to hospital.' },
      { status: 'In Progress', timestamp: '2026-09-05T10:00:00Z', note: 'Surgery scheduled for 7th Sep. Coordinator on-site.' }
    ],
    submittedAt: '2026-09-04T15:45:00Z',
    estimatedReview: 'Under 4 Hours'
  },
  {
    id: 'JCF-PAT-6421',
    name: 'Gurpreet Singh',
    age: 58,
    gender: 'Male',
    phone: '+91 97888 33445',
    email: 'gurpreet.s@example.com',
    city: 'Lucknow',
    department: 'Medicine Bank',
    aidType: 'Free Prescription Medicines',
    priority: 'Normal',
    details: 'Diabetes Type-2 patient needing monthly Metformin 500mg and Glimepiride strips.',
    documentName: 'Diabetes_Prescription_2026.jpg',
    aiSummary: '58yo Male, Lucknow | Medicine Bank: Chronic Type-2 Diabetes oral hypoglycemic medication refill support.',
    status: 'Pending',
    assignedVolunteerId: null,
    assignedVolunteerName: null,
    assignedDoctorId: 'DOC-101',
    assignedDoctorName: 'Dr. Rajesh Varma',
    adminNotes: 'Awaiting ID proof verification from local Lucknow camp desk.',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-09-05T11:20:00Z', note: 'Application filed via web portal.' }
    ],
    submittedAt: '2026-09-05T11:20:00Z',
    estimatedReview: 'Within 24 Hours'
  },
  {
    id: 'JCF-PAT-5119',
    name: 'Sunita Devi',
    age: 34,
    gender: 'Female',
    phone: '+91 99555 66778',
    email: 'sunita.d@example.com',
    city: 'Varanasi',
    department: 'Free Diagnostics',
    aidType: 'Diagnostic Tests Aid',
    priority: 'Urgent',
    details: 'Referred for whole abdomen ultrasound and liver function blood tests due to acute abdominal pain.',
    documentName: 'Doctor_USG_Prescription.pdf',
    aiSummary: '34yo Female, Varanasi | Diagnostics: Urgent Whole Abdomen USG & LFT test voucher required.',
    status: 'Completed',
    assignedVolunteerId: 'JCF-VOL-1044',
    assignedVolunteerName: 'Dr. Sameer Siddiqui',
    assignedDoctorId: 'DOC-103',
    assignedDoctorName: 'Dr. Arvind K. Rao',
    adminNotes: 'Test completed at partner SRL diagnostics center at 100% discount. Reports delivered to patient.',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-08-28T09:00:00Z', note: 'Application submitted.' },
      { status: 'Under Review', timestamp: '2026-08-28T11:30:00Z', note: 'Verified by diagnostic desk.' },
      { status: 'Approved', timestamp: '2026-08-28T14:00:00Z', note: 'Diagnostic coupon code issued.' },
      { status: 'In Progress', timestamp: '2026-08-29T10:00:00Z', note: 'Tests conducted at partner lab.' },
      { status: 'Completed', timestamp: '2026-08-30T16:00:00Z', note: 'Case closed with doctor tele-consultation.' }
    ],
    submittedAt: '2026-08-28T09:00:00Z',
    estimatedReview: 'Completed'
  }
];

// Seed Data for Volunteers
const DEFAULT_VOLUNTEER_RECORDS = [
  {
    id: 'JCF-VOL-1044',
    name: 'Dr. Sameer Siddiqui',
    email: 'dr.sameer@example.com',
    phone: '+91 94560 11223',
    role: 'Doctor / Medical Specialist',
    specialty: 'Clinical Cardiology & Emergency Triage',
    city: 'New Delhi & Lucknow',
    availability: 'Weekends (Free OPD)',
    experience: '12 years in clinical medicine. Lead coordinator for North Zone medicine deliveries.',
    status: 'Verified & Active',
    rating: 4.9,
    tasksAssigned: ['JCF-PAT-7814', 'JCF-PAT-9032', 'JCF-PAT-5119'],
    joinedAt: '2026-08-20T09:00:00Z'
  },
  {
    id: 'JCF-VOL-2089',
    name: 'Pooja Nair',
    email: 'pooja.nair@example.com',
    phone: '+91 98199 44556',
    role: 'Registered Nurse / Paramedic',
    specialty: 'Pediatric Care & Emergency First Aid',
    city: 'Mumbai',
    availability: 'Weekday Evenings (2-4 hrs/week)',
    experience: 'Senior staff nurse at Lilavati Hospital with 6 years pediatric emergency experience.',
    status: 'Verified & Active',
    rating: 4.8,
    tasksAssigned: ['JCF-PAT-9032'],
    joinedAt: '2026-08-25T14:00:00Z'
  },
  {
    id: 'JCF-VOL-3120',
    name: 'Amitabh Sen',
    email: 'amitabh.sen@example.com',
    phone: '+91 98300 77889',
    role: 'Blood / Platelet Donor',
    specialty: 'O-Positive Rare Group Donor',
    city: 'Kolkata',
    availability: 'Monthly Blood Donation Network',
    experience: 'Donated platelets 18+ times for pediatric oncology patients.',
    status: 'Verified & Active',
    rating: 5.0,
    tasksAssigned: [],
    joinedAt: '2026-09-01T11:00:00Z'
  },
  {
    id: 'JCF-VOL-4055',
    name: 'Kavita Joshi',
    email: 'kavita.j@example.com',
    phone: '+91 97110 88990',
    role: 'Field Camp Coordinator',
    specialty: 'Community Outreach & Logistics',
    city: 'New Delhi',
    availability: 'Flexible / As Needed',
    experience: 'Organized 12 community health camps and medicine bank drives.',
    status: 'Pending Verification',
    rating: 0,
    tasksAssigned: [],
    joinedAt: '2026-09-05T08:30:00Z'
  }
];

// Seed Data for Appointments
const DEFAULT_APPOINTMENTS = [
  {
    id: 'JCF-APT-301',
    patientName: 'Amina Khatun',
    patientPhone: '+91 98765 43210',
    patientEmail: 'amina.khatun@example.com',
    doctorName: 'Dr. Rajesh Varma',
    doctorId: 'DOC-101',
    department: 'Cardiology',
    type: 'Tele-Consultation (Video/Audio)',
    date: '2026-09-08',
    time: '04:30 PM',
    symptoms: 'Follow-up on heart failure medications and blood pressure readings.',
    status: 'Confirmed',
    meetingLink: 'https://meet.jcfhealthcare.org/cardio-7814',
    location: 'Online JCF Secure Tele-Health Room',
    consultationNotes: null,
    createdDate: '2026-09-03T10:00:00Z'
  },
  {
    id: 'JCF-APT-302',
    patientName: 'Rohan Sharma',
    patientPhone: '+91 98111 22334',
    patientEmail: 'parent.sharma@example.com',
    doctorName: 'Dr. Farhana Begum',
    doctorId: 'DOC-102',
    department: 'Pediatric Care',
    type: 'In-Person Pre-Op Consultation',
    date: '2026-09-07',
    time: '11:00 AM',
    symptoms: 'Pre-surgery pediatric fitness check and clinical clearance.',
    status: 'Confirmed',
    meetingLink: null,
    location: 'JCF Pediatric Wing, Civic Hospital, Ward 4',
    consultationNotes: null,
    createdDate: '2026-09-05T09:30:00Z'
  },
  {
    id: 'JCF-APT-303',
    patientName: 'Gurpreet Singh',
    patientPhone: '+91 97888 33445',
    patientEmail: 'gurpreet.s@example.com',
    doctorName: 'Dr. Rajesh Varma',
    doctorId: 'DOC-101',
    department: 'Cardiology',
    type: 'Tele-Consultation (Video/Audio)',
    date: '2026-09-09',
    time: '10:00 AM',
    symptoms: 'Blood pressure fluctuations and mild chest discomfort after morning walk.',
    status: 'Pending',
    meetingLink: null,
    location: 'Doctor Direct Callback',
    consultationNotes: null,
    createdDate: '2026-09-05T12:00:00Z'
  },
  {
    id: 'JCF-APT-304',
    patientName: 'Sunita Devi',
    patientPhone: '+91 99555 66778',
    patientEmail: 'sunita.d@example.com',
    doctorName: 'Dr. Arvind K. Rao',
    doctorId: 'DOC-103',
    department: 'General Medicine',
    type: 'Tele-Consultation (Phone Call)',
    date: '2026-08-30',
    time: '03:00 PM',
    symptoms: 'Abdominal pain and fatigue review after ultrasound.',
    status: 'Completed',
    meetingLink: null,
    location: 'Tele-Consultation Completed',
    consultationNotes: {
      symptoms: 'Abdominal pain and dyspepsia',
      observations: 'USG clear of acute gallstones. LFT within normal range. Mild gastritis suspected.',
      advice: 'Avoid spicy food, take antacids 20 mins before breakfast. Maintain hydration.',
      followUpDate: '2026-09-20',
      recordedAt: '2026-08-30T16:00:00Z'
    },
    createdDate: '2026-08-28T12:00:00Z'
  }
];

// Seed Data for Contact Inquiries
const DEFAULT_INQUIRIES = [
  {
    id: 'JCF-INQ-501',
    name: 'Vikramaditya Roy',
    email: 'vikram.roy@techcorp.in',
    phone: '+91 98200 11990',
    subject: 'Corporate CSR Partnership for Free Mobile Clinic',
    message: 'Our corporate CSR wing wants to sponsor 2 mobile medical vans for rural Delhi-NCR. Kindly share the proposal and 80G tax exemption documents.',
    status: 'Responded',
    replyNote: 'Sent 80G certificate, CSR pitch deck, and scheduled Zoom meeting for Thursday.',
    submittedAt: '2026-09-03T16:40:00Z'
  },
  {
    id: 'JCF-INQ-502',
    name: 'Dr. Shalini Mehta',
    email: 'shalini.mehta@cityhospital.org',
    phone: '+91 98450 33221',
    subject: 'Requesting Free Cataract Camp in Sector 22',
    message: 'We have identified around 80 elderly residents in Sector 22 slum cluster who require cataract screenings. Can JCF organize an eye camp this Sunday?',
    status: 'Unread',
    replyNote: null,
    submittedAt: '2026-09-05T14:10:00Z'
  }
];

// Seed Data for FAQs
const DEFAULT_FAQS = [
  {
    id: 'FAQ-1',
    category: 'Patient Aid',
    question: 'Who is eligible to apply for free medical aid and medicines from JCF?',
    answer: 'Any patient or family member from economically disadvantaged backgrounds (BPL cardholders, daily wage workers, underprivileged seniors) with a valid doctor prescription from any government or private hospital can apply. JCF evaluates cases with zero bias.'
  },
  {
    id: 'FAQ-2',
    category: 'Medicines',
    question: 'How do I receive the free prescription medicines once approved?',
    answer: 'Once our medical review board verifies your prescription, medicines are dispatched via verified volunteer delivery to your doorstep or made available for immediate pickup at your nearest JCF Pharmacy Partner point.'
  },
  {
    id: 'FAQ-3',
    category: 'Surgeries',
    question: 'What is the maximum financial aid granted for pediatric or critical surgeries?',
    answer: 'JCF provides hospital grants ranging from ₹10,000 up to ₹2,50,000 per patient depending on the surgery complexity (e.g. Congenital Heart Surgeries, Pediatric Hernias, Oncology Chemotherapy). Payments are credited directly to the hospital billing office.'
  },
  {
    id: 'FAQ-4',
    category: 'Volunteering',
    question: 'How can doctors and healthcare workers volunteer their time?',
    answer: 'Doctors, nurses, and students can register as Volunteer Heroes on this portal. You can choose your availability (Weekend OPDs, on-call tele-triage, or camp coordination). Verified volunteers receive digital badges, case assignments, and official recognition certificates.'
  },
  {
    id: 'FAQ-5',
    category: 'General',
    question: 'Is JCF Healthcare Support a registered non-profit organization?',
    answer: 'Yes, JCF Healthcare Support Foundation is a fully registered charitable trust holding statutory 80G (tax deduction) and 12A non-profit certifications with 100% transparent audit records.'
  }
];

// Seed Data for Notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    recipientRole: 'all',
    title: 'Free Mega Health Camp Scheduled',
    message: 'Community Cardiology & Eye Camp this Saturday at Sector 18 Community Center from 9 AM to 3 PM.',
    type: 'info',
    read: false,
    timestamp: '2026-09-05T08:00:00Z'
  },
  {
    id: 'NOTIF-2',
    recipientRole: 'patient',
    recipientId: 'JCF-PAT-7814',
    title: 'Medicine Request Approved',
    message: 'Your monthly prescription grant has been approved and assigned to Dr. Sameer Siddiqui.',
    type: 'success',
    read: false,
    timestamp: '2026-09-03T09:00:00Z'
  },
  {
    id: 'NOTIF-3',
    recipientRole: 'doctor',
    recipientId: 'DOC-101',
    title: 'New Appointment Booking',
    message: 'Gurpreet Singh requested Cardiology Tele-Consultation on 2026-09-09 at 10:00 AM.',
    type: 'info',
    read: false,
    timestamp: '2026-09-05T12:00:00Z'
  },
  {
    id: 'NOTIF-4',
    recipientRole: 'admin',
    title: 'Emergency Pediatric Surgery Aid Filed',
    message: 'Rohan Sharma (8 Yrs, Mumbai) requested urgent surgery assistance. Case JCF-PAT-9032.',
    type: 'emergency',
    read: false,
    timestamp: '2026-09-04T15:45:00Z'
  }
];

// Seed Data for Recent Activities Log
const DEFAULT_ACTIVITIES = [
  { id: 'ACT-1', text: 'Dr. Rajesh Varma confirmed tele-consultation for Amina Khatun (JCF-APT-301)', time: '30 mins ago', type: 'appointment' },
  { id: 'ACT-2', text: 'Dr. Sameer Siddiqui assigned to case JCF-PAT-7814', time: '1 hour ago', type: 'assignment' },
  { id: 'ACT-3', text: 'Grant sanctioned for Rohan Sharma (JCF-PAT-9032)', time: '3 hours ago', type: 'approval' },
  { id: 'ACT-4', text: 'New volunteer registration: Amitabh Sen (Blood Donor)', time: '5 hours ago', type: 'volunteer' },
  { id: 'ACT-5', text: 'SRL Diagnostic test completed for Sunita Devi (JCF-PAT-5119)', time: '2 days ago', type: 'completed' }
];

class JCFStorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
        role: 'guest',
        name: 'Guest Visitor',
        email: 'guest@jcfhealthcare.org'
      }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(DEFAULT_DOCTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(DEFAULT_PATIENT_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VOLUNTEERS)) {
      localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(DEFAULT_VOLUNTEER_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTACT_INQUIRIES)) {
      localStorage.setItem(STORAGE_KEYS.CONTACT_INQUIRIES, JSON.stringify(DEFAULT_INQUIRIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FAQS)) {
      localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(DEFAULT_FAQS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(DEFAULT_ACTIVITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AI_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AI_LOGS, JSON.stringify([]));
    }
  }

  generateId(prefix = 'JCF') {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
  }

  // Activity Logger
  logActivity(text, type = 'info') {
    const activities = this.getActivities();
    activities.unshift({
      id: this.generateId('ACT'),
      text,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      type
    });
    if (activities.length > 25) activities.pop();
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }

  getActivities() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Authentication & Current User
  getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          id: parsed.id || 'JCF-PAT-7814',
          role: parsed.role || 'guest',
          name: parsed.name || 'Guest Visitor',
          email: parsed.email || 'guest@jcfhealthcare.org',
          phone: parsed.phone || '+91 98765 43210',
          city: parsed.city || 'India',
          avatar: parsed.avatar || (parsed.role === 'doctor' ? '👨‍⚕️' : parsed.role === 'admin' ? '👨‍💼' : parsed.role === 'volunteer' ? '🤝' : '👤'),
          ...parsed
        };
      }
      return { id: 'JCF-PAT-7814', role: 'guest', name: 'Guest Visitor', email: 'guest@jcfhealthcare.org', phone: '+91 98765 43210', city: 'India', avatar: '👤' };
    } catch (e) {
      return { id: 'JCF-PAT-7814', role: 'guest', name: 'Guest Visitor', email: 'guest@jcfhealthcare.org', phone: '+91 98765 43210', city: 'India', avatar: '👤' };
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  logout() {
    this.setCurrentUser({ id: 'JCF-PAT-7814', role: 'guest', name: 'Guest Visitor', email: 'guest@jcfhealthcare.org', phone: '', city: 'India', avatar: '👤' });
  }

  // Patient Submissions & Management
  savePatientRequest(data) {
    const requests = this.getPatientRequests();
    const id = this.generateId('JCF-PAT');
    const newRecord = {
      id,
      ...data,
      status: 'Pending',
      assignedVolunteerId: null,
      assignedVolunteerName: null,
      assignedDoctorId: null,
      assignedDoctorName: null,
      adminNotes: 'Application registered. Medical board initial triage queued.',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Request received via JCF Web Portal.'
        }
      ],
      submittedAt: new Date().toISOString(),
      estimatedReview: data.priority === 'Emergency' ? 'Within 2-4 Hours' : 'Within 24 Hours'
    };
    requests.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(requests));

    this.logActivity(`New Patient Request created: ${newRecord.name} (${newRecord.id})`, 'patient');
    // Sync to backend database if API is available
    if (typeof window !== 'undefined' && window.jcfAPI) {
      window.jcfAPI.submitPatientAid(data).catch(() => {});
    }

    return newRecord;
  }

  getPatientRequests() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getPatientById(id) {
    const patients = this.getPatientRequests();
    return patients.find(p => p.id.toUpperCase() === (id || '').toUpperCase().trim());
  }

  updatePatientStatus(id, newStatus, adminNote = '', assignedVolunteerId = null, assignedDoctorId = null) {
    const patients = this.getPatientRequests();
    const index = patients.findIndex(p => p.id.toUpperCase() === (id || '').toUpperCase().trim());
    if (index === -1) return null;

    const patient = patients[index];
    patient.status = newStatus;
    if (adminNote) patient.adminNotes = adminNote;

    if (assignedVolunteerId) {
      const volunteers = this.getVolunteers();
      const vol = volunteers.find(v => v.id === assignedVolunteerId);
      if (vol) {
        patient.assignedVolunteerId = vol.id;
        patient.assignedVolunteerName = vol.name;
        if (!vol.tasksAssigned.includes(patient.id)) {
          vol.tasksAssigned.push(patient.id);
          localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
        }
      }
    }

    if (assignedDoctorId) {
      const doctors = this.getDoctors();
      const doc = doctors.find(d => d.id === assignedDoctorId);
      if (doc) {
        patient.assignedDoctorId = doc.id;
        patient.assignedDoctorName = doc.name;
      }
    }

    if (!patient.statusHistory) patient.statusHistory = [];
    patient.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: adminNote || `Status updated to ${newStatus}`
    });

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));

    this.logActivity(`Status of ${patient.id} changed to ${newStatus}`, 'status');
    this.addNotification({
      recipientRole: 'patient',
      recipientId: patient.id,
      title: `Status Update: ${patient.id}`,
      message: `Your request status is now: ${newStatus}. Note: ${adminNote || 'Processing'}`,
      type: newStatus === 'Approved' || newStatus === 'Completed' ? 'success' : 'info'
    });

    return patient;
  }

  deletePatientRequest(id) {
    let patients = this.getPatientRequests();
    patients = patients.filter(p => p.id.toUpperCase() !== id.toUpperCase());
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    this.logActivity(`Deleted patient record ${id}`, 'delete');
  }

  // Volunteer Submissions & Management
  saveVolunteerRegistration(data) {
    const volunteers = this.getVolunteers();
    const id = this.generateId('JCF-VOL');
    const newVolunteer = {
      id,
      ...data,
      status: 'Pending Verification',
      rating: 0,
      tasksAssigned: [],
      joinedAt: new Date().toISOString()
    };
    volunteers.unshift(newVolunteer);
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));

    this.logActivity(`New Volunteer Registered: ${newVolunteer.name} (${newVolunteer.role})`, 'volunteer');
    this.addNotification({
      recipientRole: 'admin',
      title: 'New Volunteer Application',
      message: `${newVolunteer.name} registered as ${newVolunteer.role}. Ref: ${newVolunteer.id}`,
      type: 'info'
    });

    return newVolunteer;
  }

  getVolunteers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getVolunteerById(id) {
    const volunteers = this.getVolunteers();
    return volunteers.find(v => v.id.toUpperCase() === (id || '').toUpperCase().trim());
  }

  updateVolunteerStatus(id, newStatus) {
    const volunteers = this.getVolunteers();
    const vol = volunteers.find(v => v.id.toUpperCase() === id.toUpperCase());
    if (vol) {
      vol.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
      this.logActivity(`Volunteer ${vol.name} status updated to ${newStatus}`, 'volunteer');
      return vol;
    }
    return null;
  }

  // Doctors Directory & Management
  getDoctors() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      let docs = data ? JSON.parse(data) : DEFAULT_DOCTORS;
      // Ensure image paths exist
      docs = docs.map(d => {
        const def = DEFAULT_DOCTORS.find(item => item.id === d.id);
        if (def && (!d.image || d.image.trim() === '')) {
          d.image = def.image;
        }
        return d;
      });
      return docs;
    } catch (e) {
      return DEFAULT_DOCTORS;
    }
  }

  getDoctorById(id) {
    const doctors = this.getDoctors();
    return doctors.find(d => d.id.toUpperCase() === (id || '').toUpperCase().trim());
  }

  updateDoctorProfile(doctorId, updatedFields) {
    const doctors = this.getDoctors();
    const doc = doctors.find(d => d.id.toUpperCase() === (doctorId || '').toUpperCase().trim());
    if (doc) {
      Object.assign(doc, updatedFields);
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
      this.logActivity(`Profile updated for ${doc.name}`, 'doctor');
      return doc;
    }
    return null;
  }

  // Doctor Specific Query Helpers
  getDoctorAppointments(doctorId) {
    const appointments = this.getAppointments();
    const doc = this.getDoctorById(doctorId);
    return appointments.filter(a => a.doctorId === doctorId || (doc && a.doctorName.toLowerCase().includes(doc.name.toLowerCase())));
  }

  getDoctorPatients(doctorId) {
    const appointments = this.getDoctorAppointments(doctorId);
    const patientNames = [...new Set(appointments.map(a => a.patientName.toLowerCase()))];
    const allPatients = this.getPatientRequests();
    return allPatients.filter(p => patientNames.includes(p.name.toLowerCase()) || p.assignedDoctorId === doctorId);
  }

  getDoctorStats(doctorId) {
    const appointments = this.getDoctorAppointments(doctorId);
    const assignedPatients = this.getDoctorPatients(doctorId);
    
    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
    const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;
    const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
    
    return {
      totalPatients: assignedPatients.length,
      totalAppointments: appointments.length,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments
    };
  }

  // Appointments
  getAppointments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveAppointment(data) {
    const appointments = this.getAppointments();
    const id = this.generateId('JCF-APT');
    const newAppointment = {
      id,
      ...data,
      status: data.status || 'Pending',
      consultationNotes: null,
      createdDate: new Date().toISOString()
    };
    appointments.unshift(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));

    this.logActivity(`New Appointment requested for ${newAppointment.patientName} with ${newAppointment.doctorName}`, 'appointment');
    
    // Notify Doctor
    this.addNotification({
      recipientRole: 'doctor',
      recipientId: newAppointment.doctorId,
      title: 'New Consultation Booking',
      message: `${newAppointment.patientName} booked a ${newAppointment.department} consult on ${newAppointment.date} at ${newAppointment.time}. Ref: ${newAppointment.id}`,
      type: 'info'
    });

    // Notify Admin
    this.addNotification({
      recipientRole: 'admin',
      title: 'Doctor Appointment Requested',
      message: `${newAppointment.patientName} with ${newAppointment.doctorName} (${newAppointment.department})`,
      type: 'info'
    });

    return newAppointment;
  }

  updateAppointmentStatus(id, status, meetingLink = '') {
    const appointments = this.getAppointments();
    const apt = appointments.find(a => a.id.toUpperCase() === id.toUpperCase());
    if (apt) {
      apt.status = status;
      if (meetingLink) apt.meetingLink = meetingLink;
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      
      this.logActivity(`Appointment ${id} status updated to ${status}`, 'appointment');
      
      this.addNotification({
        recipientRole: 'patient',
        title: `Appointment Status: ${status}`,
        message: `Your appointment with ${apt.doctorName} on ${apt.date} is now ${status}. ${apt.meetingLink ? 'Video Link attached.' : ''}`,
        type: status === 'Confirmed' ? 'success' : 'info'
      });

      if (typeof window !== 'undefined' && window.jcfAPI) {
        window.jcfAPI.updateAppointmentStatus(id, status).catch(() => {});
      }

      return apt;
    }
    return null;
  }

  saveConsultationNotes(appointmentId, notesData) {
    const appointments = this.getAppointments();
    const apt = appointments.find(a => a.id.toUpperCase() === appointmentId.toUpperCase());
    if (apt) {
      apt.status = 'Completed';
      apt.consultationNotes = {
        ...notesData,
        recordedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));

      this.logActivity(`Consultation completed for ${apt.patientName} by ${apt.doctorName}`, 'appointment');

      if (typeof window !== 'undefined' && window.jcfAPI) {
        window.jcfAPI.saveConsultationNotes(appointmentId, notesData).catch(() => {});
      }

      this.addNotification({
        recipientRole: 'patient',
        title: 'Prescription & Notes Issued',
        message: `Dr. ${apt.doctorName} has concluded your consultation. Prescription generated.`,
        type: 'success'
      });

      return apt;
    }
    return null;
  }

  // Contact & Inquiries
  saveInquiry(data) {
    const inquiries = this.getInquiries();
    const id = this.generateId('JCF-INQ');
    const newInquiry = {
      id,
      ...data,
      status: 'Unread',
      submittedAt: new Date().toISOString()
    };
    inquiries.unshift(newInquiry);
    localStorage.setItem(STORAGE_KEYS.CONTACT_INQUIRIES, JSON.stringify(inquiries));

    this.logActivity(`New message from ${newInquiry.name} (${newInquiry.subject})`, 'contact');
    
    if (typeof window !== 'undefined' && window.jcfAPI) {
      window.jcfAPI.submitInquiry(data).catch(() => {});
    }

    this.addNotification({
      recipientRole: 'admin',
      title: 'New Help Desk Inquiry',
      message: `${newInquiry.name}: "${newInquiry.subject}"`,
      type: 'info'
    });

    return newInquiry;
  }

  getInquiries() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACT_INQUIRIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  updateInquiryStatus(id, status, replyNote = '') {
    const inquiries = this.getInquiries();
    const inq = inquiries.find(i => i.id.toUpperCase() === id.toUpperCase());
    if (inq) {
      inq.status = status;
      if (replyNote) inq.replyNote = replyNote;
      localStorage.setItem(STORAGE_KEYS.CONTACT_INQUIRIES, JSON.stringify(inquiries));
      this.logActivity(`Inquiry ${id} marked as ${status}`, 'inquiry');
      if (typeof window !== 'undefined' && window.jcfAPI) {
        window.jcfAPI.updateInquiryStatus(id, status).catch(() => {});
      }
      return inq;
    }
    return null;
  }

  // FAQs
  getFAQs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAQS);
      return data ? JSON.parse(data) : DEFAULT_FAQS;
    } catch (e) {
      return DEFAULT_FAQS;
    }
  }

  saveFAQ(faqData) {
    const faqs = this.getFAQs();
    const id = faqData.id || this.generateId('FAQ');
    const existingIndex = faqs.findIndex(f => f.id === id);

    if (existingIndex >= 0) {
      faqs[existingIndex] = { id, ...faqData };
    } else {
      faqs.push({ id, ...faqData });
    }
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
    this.logActivity(`FAQ updated: "${faqData.question}"`, 'faq');
    if (typeof window !== 'undefined' && window.jcfAPI) {
      window.jcfAPI.addFAQ({ id, ...faqData }).catch(() => {});
    }
    return faqs;
  }

  addFAQ(faqData) {
    return this.saveFAQ(faqData);
  }

  deleteFAQ(id) {
    let faqs = this.getFAQs();
    faqs = faqs.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(faqs));
    if (typeof window !== 'undefined' && window.jcfAPI) {
      window.jcfAPI.deleteFAQ(id).catch(() => {});
    }
  }

  // Notifications
  getNotifications(role = null, recipientId = null) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      let notifs = data ? JSON.parse(data) : [];
      if (role) {
        notifs = notifs.filter(n => n.recipientRole === 'all' || n.recipientRole === role || (recipientId && n.recipientId === recipientId));
      }
      return notifs;
    } catch (e) {
      return [];
    }
  }

  addNotification(notif) {
    const notifs = this.getNotifications();
    const newNotif = {
      id: this.generateId('NOTIF'),
      recipientRole: notif.recipientRole || 'all',
      recipientId: notif.recipientId || null,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'info',
      read: false,
      timestamp: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return newNotif;
  }

  markNotificationsAsRead() {
    const notifs = this.getNotifications();
    notifs.forEach(n => n.read = true);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // AI Query Logs
  logAIQuery(query, topic, responseSnippet) {
    try {
      const logs = this.getAILogs();
      logs.unshift({
        id: this.generateId('AILOG'),
        query,
        topic,
        responseSnippet: responseSnippet.substring(0, 120) + '...',
        timestamp: new Date().toISOString()
      });
      if (logs.length > 50) logs.pop();
      localStorage.setItem(STORAGE_KEYS.AI_LOGS, JSON.stringify(logs));
    } catch (e) {}
  }

  getAILogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Search by reference ID
  findRecordById(searchId) {
    const cleanId = (searchId || '').trim().toUpperCase();
    const patients = this.getPatientRequests();
    const patientMatch = patients.find(p => p.id.toUpperCase() === cleanId);
    if (patientMatch) {
      return { type: 'Patient Support Request', record: patientMatch };
    }

    const volunteers = this.getVolunteers();
    const volMatch = volunteers.find(v => v.id.toUpperCase() === cleanId);
    if (volMatch) {
      return { type: 'Volunteer Registration', record: volMatch };
    }

    const appointments = this.getAppointments();
    const aptMatch = appointments.find(a => a.id.toUpperCase() === cleanId);
    if (aptMatch) {
      return { type: 'Doctor Appointment', record: aptMatch };
    }

    return null;
  }

  // Admin Dashboard Statistics Calculator
  getAdminStats() {
    const patients = this.getPatientRequests();
    const volunteers = this.getVolunteers();
    const appointments = this.getAppointments();
    const inquiries = this.getInquiries();

    const pendingRequests = patients.filter(p => p.status === 'Pending' || p.status === 'Under Review').length;
    const emergencyRequests = patients.filter(p => p.priority === 'Emergency' && p.status !== 'Completed').length;
    const urgentRequests = patients.filter(p => p.priority === 'Urgent' && p.status !== 'Completed').length;
    const completedRequests = patients.filter(p => p.status === 'Completed').length;
    const approvedRequests = patients.filter(p => p.status === 'Approved' || p.status === 'In Progress').length;
    const activeVolunteers = volunteers.filter(v => v.status === 'Verified & Active').length;
    const pendingVolunteers = volunteers.filter(v => v.status === 'Pending Verification').length;
    const unreadInquiries = inquiries.filter(i => i.status === 'Unread').length;

    return {
      totalPatients: patients.length,
      totalVolunteers: volunteers.length,
      activeVolunteers,
      pendingVolunteers,
      totalAppointments: appointments.length,
      pendingRequests,
      emergencyRequests,
      urgentRequests,
      completedRequests,
      approvedRequests,
      totalInquiries: inquiries.length,
      unreadInquiries
    };
  }

  // Backup & Reset
  exportDatabaseJSON() {
    const data = {
      patients: this.getPatientRequests(),
      volunteers: this.getVolunteers(),
      doctors: this.getDoctors(),
      appointments: this.getAppointments(),
      inquiries: this.getInquiries(),
      faqs: this.getFAQs(),
      notifications: this.getNotifications(),
      activities: this.getActivities(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.VOLUNTEERS);
    localStorage.removeItem(STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.CONTACT_INQUIRIES);
    localStorage.removeItem(STORAGE_KEYS.FAQS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.AI_LOGS);
    this.init();
  }

  // Alias methods for clean interoperability across all dashboards
  getPatients() {
    return this.getPatientRequests();
  }

  createPatientRequest(data) {
    return this.savePatientRequest(data);
  }

  createAppointment(data) {
    return this.saveAppointment(data);
  }

  exportAllData() {
    return JSON.parse(this.exportDatabaseJSON());
  }

  resetAllData() {
    this.resetDemoData();
  }

  getContactMessages() {
    return this.getInquiries();
  }

  saveContactInquiry(data) {
    return this.saveInquiry(data);
  }

  saveDoctor(data) {
    const doctors = this.getDoctors();
    const id = data.id || this.generateId('DOC');
    const newDoc = {
      id,
      name: data.name,
      specialty: data.specialty || 'General Medicine',
      qualifications: data.qualifications || 'MBBS',
      experience: data.experience || '5+ Years',
      hospitalAffiliation: data.hospitalAffiliation || 'JCF Medical Network',
      phone: data.phone || '',
      email: data.email || '',
      availableDays: data.availableDays || data.opdSlots || 'Mon-Fri (10:00 AM - 1:00 PM)',
      status: 'Available for OPD',
      avatar: '👨‍⚕️',
      image: data.image || 'images/doctor-rajesh.jpg'
    };
    doctors.push(newDoc);
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
    this.logActivity(`New doctor registered: ${newDoc.name}`, 'doctor');
    if (typeof window !== 'undefined' && window.jcfAPI) {
      window.jcfAPI.addDoctor(data).catch(() => {});
    }
    return newDoc;
  }
}

// Global storage singleton
window.jcfStorage = new JCFStorageManager();
