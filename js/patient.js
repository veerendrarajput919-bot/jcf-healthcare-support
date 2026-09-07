/**
 * JCF Healthcare Support - Patient Dashboard Logic
 * Handles patient profile, appointments, aid requests, reports, and real-time storage sync
 */

document.addEventListener('DOMContentLoaded', () => {
  initPatientDashboard();
});

function initPatientDashboard() {
  const currentPatient = window.jcfStorage?.getCurrentUser() || {
    id: 'PAT-1082',
    name: 'Amina Khatun',
    email: 'amina.khatun@gmail.com',
    phone: '+91 98765 43210',
    city: 'Bhopal, Madhya Pradesh',
    role: 'patient'
  };

  // Setup patient name in UI
  const nameEls = document.querySelectorAll('.patient-name-display');
  nameEls.forEach(el => el.textContent = currentPatient.name || 'Amina Khatun');

  initTabNavigation();
  loadPatientData();
  setupPatientForms();
}

function initTabNavigation() {
  const tabBtns = document.querySelectorAll('.dash-tab-btn');
  const tabPanes = document.querySelectorAll('.dash-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });
}

function loadPatientData() {
  if (!window.jcfStorage) return;

  const appointments = window.jcfStorage.getAppointments();
  const patientRequests = window.jcfStorage.getPatientRequests();

  // Filter or assign demo patient records
  const myAppointments = appointments.filter(a => 
    a.patientName?.toLowerCase().includes('amina') || a.contactPhone === '+91 98765 43210'
  );

  const displayAppointments = myAppointments.length > 0 ? myAppointments : appointments.slice(0, 2);

  // Update KPI counters
  const aptCountEl = document.getElementById('kpi-pat-appointments');
  const reqCountEl = document.getElementById('kpi-pat-requests');
  const repCountEl = document.getElementById('kpi-pat-reports');
  const aidCountEl = document.getElementById('kpi-pat-aid');

  if (aptCountEl) aptCountEl.textContent = displayAppointments.length;
  if (reqCountEl) reqCountEl.textContent = patientRequests.length > 0 ? '1 Active' : '0';
  if (repCountEl) repCountEl.textContent = '3 Ready';
  if (aidCountEl) aidCountEl.textContent = '₹45,000';

  // Render Appointments Table
  renderAppointmentsTable(displayAppointments);

  // Render Active Aid Vouchers
  renderAidVouchers(patientRequests);
}

function renderAppointmentsTable(appointments) {
  const tableBody = document.getElementById('patient-appointments-list');
  if (!tableBody) return;

  if (appointments.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 2rem;">No upcoming appointments found. Click "Book Appointment" to consult a doctor.</td></tr>`;
    return;
  }

  tableBody.innerHTML = appointments.map(apt => `
    <tr>
      <td><strong>${apt.id}</strong></td>
      <td>
        <div style="font-weight: 700; color: var(--dark-navy);">${apt.doctorName || 'Assigned Specialist'}</div>
        <div style="font-size: 0.8rem; color: #64748b;">${apt.department || 'General Medicine'}</div>
      </td>
      <td>
        <div>📅 ${apt.date || 'Tomorrow'}</div>
        <div style="font-size: 0.8rem; color: #64748b;">⏰ ${apt.slot || '10:30 AM'}</div>
      </td>
      <td><span class="dash-badge ${apt.status || 'active'}">${apt.status || 'Confirmed'}</span></td>
      <td>
        <button class="dash-btn dash-btn-outline dash-btn-sm" onclick="joinTeleconsultation('${apt.id}')">
          📹 Join Call
        </button>
      </td>
    </tr>
  `).join('');
}

function renderAidVouchers(requests) {
  const container = document.getElementById('patient-vouchers-container');
  if (!container) return;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="font-weight: 800; color: #166534;">💊 Medicine Grant</span>
          <span class="dash-badge active">Active</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 800; color: #14532d; margin-bottom: 0.25rem;">₹5,000 / Month</div>
        <p style="font-size: 0.85rem; color: #166534; margin-bottom: 0.75rem;">Chronic Cardiology Rx Refill (3/6 Cycles completed).</p>
        <div style="font-size: 0.8rem; color: #15803d;">Pharmacy Partner: Apollo Pharmacy, Bhopal</div>
      </div>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="font-weight: 800; color: #1e40af;">🩺 Diagnostics Aid</span>
          <span class="dash-badge verified">Approved</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 800; color: #1e3a8a; margin-bottom: 0.25rem;">₹8,500 Full Grant</div>
        <p style="font-size: 0.85rem; color: #1e40af; margin-bottom: 0.75rem;">Echo-Cardiogram & Complete Lipid Panel voucher.</p>
        <div style="font-size: 0.8rem; color: #2563eb;">Diagnostic Center: Max Path Labs</div>
      </div>
    </div>
  `;
}

function setupPatientForms() {
  // Support Request submission
  const supportForm = document.getElementById('patient-support-form');
  if (supportForm) {
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(supportForm);
      const reqData = {
        name: document.getElementById('pat-req-name')?.value || 'Amina Khatun',
        phone: document.getElementById('pat-req-phone')?.value || '+91 98765 43210',
        city: document.getElementById('pat-req-city')?.value || 'Bhopal',
        aidType: document.getElementById('pat-req-type')?.value || 'Free Prescription Medicines',
        priority: document.getElementById('pat-req-priority')?.value || 'Medium',
        details: document.getElementById('pat-req-details')?.value || 'Assistance requested via Patient Portal.'
      };

      if (window.jcfStorage) {
        const saved = window.jcfStorage.createPatientRequest(reqData);
        alert(`🎉 Support Request Submitted Successfully!\nReference ID: ${saved.id}\nOur coordinator will verify and respond within 24 hours.`);
        supportForm.reset();
        loadPatientData();
      }
    });
  }

  // Quick Appointment form
  const aptForm = document.getElementById('patient-quick-apt-form');
  if (aptForm) {
    aptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const docName = document.getElementById('pat-apt-doctor')?.value || 'Dr. Rajesh Varma';
      const dept = document.getElementById('pat-apt-dept')?.value || 'Cardiology';
      const date = document.getElementById('pat-apt-date')?.value || '2026-09-12';
      const slot = document.getElementById('pat-apt-slot')?.value || '11:00 AM';

      if (window.jcfStorage) {
        const newApt = window.jcfStorage.createAppointment({
          patientName: 'Amina Khatun',
          doctorName: docName,
          department: dept,
          date: date,
          slot: slot,
          type: 'Teleconsultation',
          status: 'Confirmed'
        });
        alert(`✅ Appointment Scheduled!\nDoctor: ${docName}\nDate: ${date} at ${slot}\nReference: ${newApt.id}`);
        aptForm.reset();
        loadPatientData();
      }
    });
  }
}

window.joinTeleconsultation = function(aptId) {
  alert(`Connecting to Secure Medical Tele-Consultation Channel for Ref: ${aptId}...\n\nDoctor will join the video room in a moment. Please keep your prescription ready.`);
};

window.downloadReport = function(reportName) {
  alert(`📄 Downloading verified diagnostic report: ${reportName}\nEncrypted SSL PDF generated from JCF Medical Record Vault.`);
};
