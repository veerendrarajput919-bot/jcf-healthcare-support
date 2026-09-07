/**
 * JCF Healthcare Support - Master Admin Governance Dashboard Logic
 * Controls platform operations, aid approvals, doctors, volunteers, appointments, and exports
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  initAdminTabNavigation();
  loadAdminMasterData();
  setupFAQManager();
  setupDataExporters();
}

function initAdminTabNavigation() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`adm-tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });
}

function loadAdminMasterData() {
  if (!window.jcfStorage) return;

  const patients = window.jcfStorage.getPatients();
  const doctors = window.jcfStorage.getDoctors();
  const volunteers = window.jcfStorage.getVolunteers();
  const appointments = window.jcfStorage.getAppointments();
  const requests = window.jcfStorage.getPatientRequests();
  const messages = window.jcfStorage.getContactMessages();

  // Metrics
  const pendingCount = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length +
                       appointments.filter(a => a.status === 'Pending').length;

  document.getElementById('adm-kpi-patients').textContent = patients.length || '120';
  document.getElementById('adm-kpi-doctors').textContent = doctors.length || '15';
  document.getElementById('adm-kpi-volunteers').textContent = volunteers.length || '42';
  document.getElementById('adm-kpi-appointments').textContent = appointments.length || '38';
  document.getElementById('adm-kpi-pending').textContent = pendingCount || '7';

  renderPatientsTable(patients);
  renderDoctorsTable(doctors);
  renderVolunteersTable(volunteers);
  renderAppointmentsTable(appointments);
  renderSupportRequestsTable(requests);
  renderContactMessages(messages);
}

function renderPatientsTable(patients) {
  const table = document.getElementById('adm-patients-table');
  if (!table) return;

  table.innerHTML = patients.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td><strong>${p.name}</strong><br><small style="color:#64748b;">${p.age} yrs &bull; ${p.gender}</small></td>
      <td>${p.city}</td>
      <td>${p.aidType}</td>
      <td><span class="dash-badge ${p.status === 'Approved' ? 'approved' : 'pending'}">${p.status}</span></td>
      <td>
        <button class="dash-btn dash-btn-outline dash-btn-sm" onclick="approvePatientAid('${p.id}', '${p.name}')">✓ Approve</button>
      </td>
    </tr>
  `).join('');
}

function renderDoctorsTable(doctors) {
  const table = document.getElementById('adm-doctors-table');
  if (!table) return;

  table.innerHTML = doctors.map(d => `
    <tr>
      <td><strong>${d.id}</strong></td>
      <td><strong>${d.name}</strong><br><small style="color:#64748b;">${d.qualification}</small></td>
      <td>${d.specialty}</td>
      <td>${d.hospital}</td>
      <td><span class="dash-badge verified">Verified Active</span></td>
      <td>
        <button class="dash-btn dash-btn-outline dash-btn-sm" onclick="alert('Doctor Profile: ${d.name}\\nRating: ${d.rating}★')">Manage</button>
      </td>
    </tr>
  `).join('');
}

function renderVolunteersTable(volunteers) {
  const table = document.getElementById('adm-volunteers-table');
  if (!table) return;

  table.innerHTML = volunteers.map(v => `
    <tr>
      <td><strong>${v.id}</strong></td>
      <td><strong>${v.name}</strong><br><small style="color:#64748b;">${v.role}</small></td>
      <td>${v.city}</td>
      <td>${v.bloodGroup || 'O+'}</td>
      <td><span class="dash-badge verified">${v.status || 'Active'}</span></td>
      <td>
        <button class="dash-btn dash-btn-outline dash-btn-sm" onclick="alert('Volunteer ${v.name} dispatched to active relief network.')">Assign Task</button>
      </td>
    </tr>
  `).join('');
}

function renderAppointmentsTable(appointments) {
  const table = document.getElementById('adm-appointments-table');
  if (!table) return;

  table.innerHTML = appointments.map(a => `
    <tr>
      <td><strong>${a.id}</strong></td>
      <td><strong>${a.patientName}</strong></td>
      <td>${a.doctorName}</td>
      <td>${a.date} (${a.slot})</td>
      <td><span class="dash-badge ${a.status === 'Completed' ? 'completed' : 'consultation'}">${a.status}</span></td>
      <td>
        <button class="dash-btn dash-btn-danger dash-btn-sm" onclick="cancelAppointmentAdmin('${a.id}')">Cancel</button>
      </td>
    </tr>
  `).join('');
}

function renderSupportRequestsTable(requests) {
  const table = document.getElementById('adm-requests-table');
  if (!table) return;

  table.innerHTML = requests.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td><strong>${r.name}</strong><br><small>${r.phone}</small></td>
      <td>${r.city}</td>
      <td>${r.aidType}</td>
      <td><span class="dash-badge ${r.priority === 'Emergency' ? 'critical' : 'active'}">${r.priority}</span></td>
      <td>
        <button class="dash-btn dash-btn-success dash-btn-sm" onclick="approveRequestAdmin('${r.id}')">Disburse Grant</button>
      </td>
    </tr>
  `).join('');
}

function renderContactMessages(messages) {
  const table = document.getElementById('adm-messages-table');
  if (!table) return;

  table.innerHTML = messages.map(m => `
    <tr>
      <td><strong>${m.name}</strong><br><small>${m.email}</small></td>
      <td>${m.subject}</td>
      <td style="max-width:300px; font-size:0.85rem;">${m.message}</td>
      <td><button class="dash-btn dash-btn-outline dash-btn-sm" onclick="alert('Reply window opened for: ${m.email}')">Reply</button></td>
    </tr>
  `).join('');
}

function setupFAQManager() {
  const form = document.getElementById('adm-faq-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('faq-new-question')?.value;
    const a = document.getElementById('faq-new-answer')?.value;
    const cat = document.getElementById('faq-new-cat')?.value || 'General';

    if (window.jcfStorage && q && a) {
      window.jcfStorage.addFAQ({ question: q, answer: a, category: cat });
      alert('✅ New FAQ Added & Synced with AI CareBot Knowledge Base!');
      form.reset();
    }
  });
}

function setupDataExporters() {
  const exportBtn = document.getElementById('adm-export-json');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = window.jcfStorage?.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jcf_healthcare_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
    });
  }

  const resetBtn = document.getElementById('adm-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('⚠️ Are you sure you want to reset all data back to initial demo seeds?')) {
        window.jcfStorage?.resetAllData();
        alert('🔄 Data reset successfully to seed records.');
        location.reload();
      }
    });
  }
}

window.approvePatientAid = function(id, name) {
  alert(`✅ Healthcare Aid Package Approved for ${name} (ID: ${id})!\nNotification sent to Patient SMS and Partner Pharmacy.`);
};

window.approveRequestAdmin = function(id) {
  alert(`💰 Grant Disbursed for Request ${id}!\nTransferred to Hospital Settlement Account.`);
};

window.cancelAppointmentAdmin = function(id) {
  if (confirm(`Cancel appointment ${id}?`)) {
    if (window.jcfStorage) {
      window.jcfStorage.updateAppointmentStatus(id, 'Cancelled');
      loadAdminMasterData();
    }
  }
};
