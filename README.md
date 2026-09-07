# 🏥 JCF Healthcare Support — Mini Healthcare Support Web App

> **Concept-Level Humanitarian Healthcare Aid Web Application & AI-Powered Triage Engine**  
> Built for underprivileged patient support, medicine grants, volunteer coordination, and specialist tele-consultations.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063.svg?style=flat&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-REST_API-000000.svg?style=flat&logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Native_DB-003b57.svg?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e.svg?style=flat&logo=javascript)](https://developer.mozilla.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Assignment Summary & Deliverables

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **1. Basic Forms** | • **Patient Aid Request Form** (Prescription medicines, surgery grants, diagnostics)<br>• **Volunteer Registration Form** (Field coordinators, blood donors)<br>• **Doctor Appointment Booking Form** (Tele-consultations & OPD)<br>• **Contact & Helpdesk Form** (Inquiries & emergency helpline) | ✅ Complete |
| **2. AI & Automation** | • **AI CareBot (Interactive FAQ & Guidance Chatbot)** with smart keyword matching, dynamic action chips, and status tracking.<br>• **AI Clinical Triage Summary Engine** (Automatically extracts patient acuity, symptoms, and urgency level into clinical summaries).<br>• **AI Clinical Sandbox** in Admin Governance panel for testing prompt summarization. | ✅ Complete |
| **3. Multi-Role Portals** | Dedicated dashboards for **Admin**, **Specialist Doctor**, **Patient Beneficiary**, and **Volunteer Hero**. | ✅ Complete |
| **4. Tech Stack** | Vanilla HTML5, CSS3, JavaScript ES6+, Node.js, Express REST API, SQLite database with offline-first local storage fallback. | ✅ Complete |
| **5. Live Hosting Ready** | Configured for 1-click deployment on **Render**, **Vercel**, **Netlify**, or **Railway**. | ✅ Complete |

---

## 🌟 NGO Humanitarian Use-Case

Non-Governmental Organizations (NGOs) and charitable healthcare trusts frequently face high volumes of incoming beneficiary requests for medicine refills, subsidized diagnostic tests, emergency surgeries, and doctor consults. 

**JCF Healthcare Support** addresses this challenge by providing:
1. **Digital Intake & Verification:** Replaces slow manual paper queues with instant digital reference IDs (e.g., `JCF-PAT-7814`).
2. **AI Clinical Triage:** Automatically analyzes incoming medical complaints and categorizes cases into `Normal`, `Urgent`, or `Emergency` to prioritize critical care.
3. **Multi-Role Coordination:** Seamlessly links patients with volunteer delivery heroes (for medicine drops) and specialist doctors (for video tele-consultations).
4. **Transparency & Tracking:** Patients can track their application lifecycle (`Pending` ➔ `Under Review` ➔ `Approved` ➔ `In Progress` ➔ `Completed`) in real-time.

---

## 🤖 AI & Automation Features

### 1. AI CareBot (Interactive FAQ & Navigation Assistant)
- **Dynamic Knowledge Base:** Answers common questions about free medicines, surgery grants, required documents (Aadhaar, BPL slips, hospital prescriptions), and ambulance dispatches.
- **Smart Query Matching & Sound Feedback:** Supports natural language keywords in English and Hindi medical terms (e.g., *dawa*, *hospital kharcha*, *emergency number*).
- **Interactive Action Chips:** Quick navigation buttons within chat bubbles (e.g., *📅 Book Doctor Appointment*, *🔍 Track Application*, *📞 Call 24/7 Hotline*).
- **Live Status Lookup:** Entering a Reference ID (e.g., `JCF-PAT-7814`) directly in the bot retrieves the active lifecycle status, assigned doctor, and volunteer notes.

### 2. AI Clinical Triage & Data Summarizer
- Extracts key symptoms (Cardiac, Pediatric Hernia, Diabetes, Oncology), patient age, gender, and socio-economic priority.
- Generates structured summaries such as:
  > `42yo Female, Bhopal | Cardiology: High priority refill needed for chronic heart failure (Enalapril + Bisoprolol). Socio-economic threshold eligible.`
- Powers the **AI Clinical Sandbox** in the Admin panel to test triage prompt generation on raw clinical text.

---

## 🛠️ Technology Stack

- **Frontend:**
  - **HTML5:** Semantic architecture, accessible forms, structured modals.
  - **Vanilla CSS3:** Modern design system, HSL color tokens, dark mode/light mode gradients, glassmorphism topbars, and smooth micro-animations.
  - **Modern JavaScript (ES6+):** Modular controllers, asynchronous fetch API, audio synthesis for chat feedback.
- **Backend:**
  - **Node.js & Express.js:** Lightweight RESTful API server.
  - **SQLite Database:** Native `node:sqlite` engine with Write-Ahead Logging (WAL) for persistent, zero-dependency storage.
  - **CORS & JSON Middlewares:** Seamless cross-origin request handling.
- **State & Data Persistence:**
  - **Hybrid Offline-First Sync:** Integrates SQLite REST API with browser `localStorage` fallback, ensuring complete functionality both online and offline.

---

## 👥 Multi-Role Portals & Demo Credentials

| Role | Demo Name | Demo User / Email | Default Password | Portal Link |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Board Administrator | `admin@jcfhealthcare.org` | `Admin@2026` | [`pages/admin-dashboard.html`](pages/admin-dashboard.html) |
| **Doctor** | Dr. Rajesh Varma | `DOC-101` / `rajesh.varma@jcfhealthcare.org` | `Doctor@2026` | [`pages/doctor-dashboard.html`](pages/doctor-dashboard.html) |
| **Patient** | Amina Khatun | `JCF-PAT-7814` / `amina.khatun@gmail.com` | `Patient@2026` | [`pages/patient-dashboard.html`](pages/patient-dashboard.html) |
| **Volunteer** | Dr. Sameer Siddiqui | `VOL-1044` / `sameer.s@jcfhealthcare.org` | `Volunteer@2026` | [`pages/volunteer-dashboard.html`](pages/volunteer-dashboard.html) |

*Tip: The unified login page (`login.html`) provides **1-Click Quick Demo Login** buttons for instant role access without manual typing.*

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm

### 1. Clone & Install
```bash
git clone https://github.com/your-username/jcf-healthcare-support.git
cd "jcf-healthcare-support"
npm install
```

### 2. Start the Full-Stack Server
```bash
npm start
```
Server will start at: **`http://localhost:3000`**

### 3. Run Automated Tests
```bash
npm test
```
Executes automated REST API endpoint validation tests covering stats, auth, patients, doctors, appointments, and backup exports.

---

## 🌐 Live Deployment Guide

### Option 1: Deploy on Render (Recommended for Full-Stack)
1. Push your repository to **GitHub**.
2. Go to [Render.com](https://render.com) and click **New Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Deploy Web Service** — Render will provide a live `https://*.onrender.com` URL.

### Option 2: Deploy on Vercel
1. Install Vercel CLI or import project from GitHub on [Vercel.com](https://vercel.com).
2. The included [`vercel.json`](vercel.json) automatically routes requests to `server/server.js`.
3. Click **Deploy**.

### Option 3: Deploy on Netlify / GitHub Pages (Static Mode)
1. Drop the repository into Netlify or enable GitHub Pages.
2. The application's **Offline-First Hybrid Storage Engine** (`js/storage.js`) automatically handles all form submissions, role dashboards, data persistence, and CareBot queries in the browser!

---

## 📁 Repository Structure

```text
├── index.html                  # Main Public Landing Page & Integrated Hub
├── login.html                  # Unified Multi-Role Authentication Gateway
├── vercel.json                 # Vercel Serverless Deployment Configuration
├── package.json                # Project dependencies & scripts
├── css/
│   ├── style.css               # Core design tokens & public portal styling
│   ├── dashboard.css           # Unified multi-role dashboard styles
│   └── responsive.css          # Mobile & tablet media queries
├── js/
│   ├── api.js                  # Frontend REST API Client
│   ├── storage.js              # State Manager & LocalStorage hybrid sync
│   ├── chatbot.js              # AI CareBot & Clinical Triage Engine
│   ├── app.js                  # Main public controller & modal manager
│   ├── admin.js                # Admin Governance dashboard logic
│   ├── doctor.js               # Doctor telemedicine queue logic
│   ├── patient.js              # Patient portal & appointment logic
│   └── volunteer.js            # Volunteer field relief logic
├── pages/
│   ├── admin-dashboard.html    # Master Admin Governance Portal
│   ├── doctor-dashboard.html   # Specialist Doctor Outpatient Desk
│   ├── patient-dashboard.html  # Beneficiary Aid & Prescription Portal
│   ├── volunteer-dashboard.html# Volunteer Relief & Field Runs Desk
│   ├── register.html           # New Beneficiary / Volunteer Registration
│   └── login.html              # Standalone login page in pages directory
├── server/
│   ├── server.js               # Express REST API Server
│   ├── db.js                   # SQLite Database initialization & seed loader
│   ├── schema.sql              # Database relational tables & indices
│   └── seed.js                 # Demo data reset script
└── scratch/
    ├── test_api_endpoints.js   # Automated API test suite
    └── test_backend.js         # SQLite database schema test
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
