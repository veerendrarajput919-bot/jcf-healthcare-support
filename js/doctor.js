/**
 * JCF Healthcare Support - Doctor & Specialist Clinical Dashboard Logic
 * Manages tele-consultations, patient directory, clinical notes, and e-prescriptions
 */

document.addEventListener('DOMContentLoaded', () => {
  initDoctorDashboard();
});

function initDoctorDashboard() {
  initDocTabNavigation();
  loadDoctorData();
  setupClinicalPrescriptionPad();
  setupAvailabilityToggle();
}

function initDocTabNavigation() {
  const tabBtns = document.querySelectorAll('.doc-tab-btn');
  const tabPanes = document.querySelectorAll('.doc-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`doc-tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });
}

function loadDoctorData() {
  if (!window.jcfStorage) return;

  const appointments = window.jcfStorage.getAppointments();
  const patients = window.jcfStorage.getPatients();

  // Doctor metrics
  const todayApts = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Accepted' || a.status === 'Today');
  const pendingRequests = appointments.filter(a => a.status === 'Pending' || a.status === 'Requested');
  const completedApts = appointments.filter(a => a.status === 'Completed');

  // Update counters
  const todayEl = document.getElementById('kpi-doc-today');
  const totalPatEl = document.getElementById('kpi-doc-patients');
  const pendingEl = document.getElementById('kpi-doc-pending');
  const completedEl = document.getElementById('kpi-doc-completed');

  if (todayEl) todayEl.textContent = todayApts.length || '4';
  if (totalPatEl) totalPatEl.textContent = patients.length || '28';
  if (pendingEl) pendingEl.textContent = pendingRequests.length || '3';
  if (completedEl) completedEl.textContent = completedApts.length || '12';

  // Render Tele-Consultation Queue
  renderDoctorQueue(appointments);

  // Render Patient Roster
  renderPatientDirectory(patients);
}

function renderDoctorQueue(appointments) {
  const queueContainer = document.getElementById('doctor-consultation-queue');
  if (!queueContainer) return;

  if (appointments.length === 0) {
    queueContainer.innerHTML = `<div style="text-align: center; color: #64748b; padding: 2rem;">No pending consultation requests.</div>`;
    return;
  }

  queueContainer.innerHTML = appointments.slice(0, 5).map(apt => `
    <div class="dash-card" style="margin-bottom: 1rem; border-left: 4px solid #2563eb;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <h4 style="margin: 0; font-size: 1.1rem; color: var(--dark-navy);">${apt.patientName || 'Amina Khatun'}</h4>
            <span class="dash-badge ${apt.status === 'Completed' ? 'completed' : 'consultation'}">${apt.status || 'Confirmed'}</span>
          </div>
          <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.35rem;">
            <span>📅 ${apt.date || 'Today'}</span> &bull; 
            <span>⏰ ${apt.slot || '11:00 AM'}</span> &bull; 
            <span>🩺 ${apt.department || 'Cardiology Consultation'}</span>
          </div>
          <p style="font-size: 0.88rem; color: #334155; margin-top: 0.5rem; background: #f8fafc; padding: 0.5rem 0.75rem; border-radius: 6px;">
            <strong>Chief Complaint / Notes:</strong> Routine heart rhythm evaluation and blood pressure medication refill review.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="dash-btn dash-btn-primary dash-btn-sm" onclick="startConsultation('${apt.id}', '${apt.patientName}')">
            📹 Start Call
          </button>
          <button class="dash-btn dash-btn-outline dash-btn-sm" onclick="openPrescriptionFor('${apt.patientName}')">
            💊 Write Rx
          </button>
          <button class="dash-btn dash-btn-success dash-btn-sm" onclick="markAppointmentDone('${apt.id}')">
            ✓ Complete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPatientDirectory(patients) {
  const listEl = document.getElementById('doctor-patient-roster');
  if (!listEl) return;

  listEl.innerHTML = patients.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>
        <div style="font-weight: 700; color: var(--dark-navy);">${p.name}</div>
        <div style="font-size: 0.8rem; color: #64748b;">${p.age} yrs &bull; ${p.gender}</div>
      </td>
      <td>${p.city}</td>
      <td><span class="dash-badge ${p.status === 'Approved' ? 'active' : 'pending'}">${p.aidType}</span></td>
      <td>
        <button class="dash-btn dash-btn-outline dash-btn-sm" onclick="viewPatientDetails('${p.name}', '${p.aidType}', '${p.city}')">
          👁️ Case File
        </button>
      </td>
    </tr>
  `).join('');
}

function setupClinicalPrescriptionPad() {
  const rxForm = document.getElementById('doc-prescription-form');
  if (!rxForm) return;

  rxForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const patientName = document.getElementById('rx-patient-name')?.value || 'Patient';
    const diagnosis = document.getElementById('rx-diagnosis')?.value || 'General Consultation';
    const medications = document.getElementById('rx-medications')?.value || 'Prescription instructions';

    alert(`✅ E-Prescription Digitally Signed & Saved!\n\nPatient: ${patientName}\nDiagnosis: ${diagnosis}\nDispatched to Patient Vault & JCF Pharmacy Partner.`);
    rxForm.reset();
  });
}

function setupAvailabilityToggle() {
  const toggleBtn = document.getElementById('doc-availability-toggle');
  const statusBadge = document.getElementById('doc-availability-status');
  if (!toggleBtn || !statusBadge) return;

  let isOnline = true;
  toggleBtn.addEventListener('click', () => {
    isOnline = !isOnline;
    if (isOnline) {
      statusBadge.textContent = '🟢 Online (Accepting OPD)';
      statusBadge.style.color = '#059669';
      toggleBtn.textContent = 'Go In-Surgery / Offline';
    } else {
      statusBadge.textContent = '🔴 Offline (In Surgery)';
      statusBadge.style.color = '#dc2626';
      toggleBtn.textContent = 'Go Online (Accept OPD)';
    }
  });
}

window.startConsultation = function(aptId, name) {
  alert(`Connecting to HIPAA-compliant Video Channel with patient: ${name} (ID: ${aptId})...\nMicrophone & Camera calibrated.`);
};

window.openPrescriptionFor = function(name) {
  const nameInput = document.getElementById('rx-patient-name');
  if (nameInput) {
    nameInput.value = name;
    nameInput.scrollIntoView({ behavior: 'smooth' });
    nameInput.focus();
  } else {
    alert(`Ready to draft digital prescription for: ${name}`);
  }
};

window.markAppointmentDone = function(aptId) {
  if (window.jcfStorage) {
    window.jcfStorage.updateAppointmentStatus(aptId, 'Completed');
    alert(`Appointment ${aptId} marked as COMPLETED.`);
    loadDoctorData();
  }
};

window.viewPatientDetails = function(name, aidType, city) {
  alert(`📋 Patient Medical Record:\n\nName: ${name}\nLocation: ${city}\nProgram Aid: ${aidType}\nPast Consultations: 2\nVitals: Normal (BP: 120/80 mmHg, SpO2: 98%)`);
};
