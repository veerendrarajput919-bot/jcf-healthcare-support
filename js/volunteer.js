/**
 * JCF Healthcare Support - Volunteer Heroes Field Dashboard Logic
 * Coordinates field medical tasks, emergency medicine dispatches, and health camps
 */

document.addEventListener('DOMContentLoaded', () => {
  initVolunteerDashboard();
});

let volunteerTasks = [
  {
    id: 'TSK-801',
    title: 'Blood Donation Camp Coordinator',
    category: 'Community Health Camp',
    date: '15 Sept 2026',
    location: 'Bhopal Community Center, MP',
    slots: '2 / 4 Volunteers Assigned',
    status: 'Available',
    urgency: 'High'
  },
  {
    id: 'TSK-802',
    title: 'Emergency Insulin Delivery to Pediatric Ward',
    category: 'Medicine Dispatch',
    date: 'Today, 2:00 PM',
    location: 'Civil Hospital, Sector 6, Lucknow',
    slots: '1 / 1 Needed',
    status: 'Available',
    urgency: 'Critical'
  },
  {
    id: 'TSK-803',
    title: 'Elderly Cardiac Patient Escort for Diagnostics',
    category: 'Patient Escort',
    date: 'Tomorrow, 9:00 AM',
    location: 'AIIMS Metro Station, New Delhi',
    slots: '1 / 2 Assigned',
    status: 'Assigned',
    urgency: 'Normal'
  },
  {
    id: 'TSK-804',
    title: 'Rural Vision Screening & Free Spectacle Distribution',
    category: 'Medical Camp',
    date: '20 Sept 2026',
    location: 'Village Kalyanpur, UP',
    slots: '3 / 6 Assigned',
    status: 'Available',
    urgency: 'Normal'
  }
];

function initVolunteerDashboard() {
  initVolTabNavigation();
  renderVolunteerKPIs();
  renderAvailableTasks();
  renderAssignedTasks();
  setupAvailabilityStatus();
}

function initVolTabNavigation() {
  const tabBtns = document.querySelectorAll('.vol-tab-btn');
  const tabPanes = document.querySelectorAll('.vol-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`vol-tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');
    });
  });
}

function renderVolunteerKPIs() {
  const assignedCount = volunteerTasks.filter(t => t.status === 'Assigned').length;
  const availableCount = volunteerTasks.filter(t => t.status === 'Available').length;

  const assignedEl = document.getElementById('kpi-vol-assigned');
  const availableEl = document.getElementById('kpi-vol-available');
  const hoursEl = document.getElementById('kpi-vol-hours');
  const impactEl = document.getElementById('kpi-vol-impact');

  if (assignedEl) assignedEl.textContent = assignedCount || '1';
  if (availableEl) availableEl.textContent = availableCount || '3';
  if (hoursEl) hoursEl.textContent = '48 Hrs';
  if (impactEl) impactEl.textContent = '120+ Patients';
}

function renderAvailableTasks() {
  const container = document.getElementById('volunteer-available-tasks-list');
  if (!container) return;

  const available = volunteerTasks.filter(t => t.status === 'Available');
  if (available.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748b;">No available tasks at this time. Check back soon!</div>`;
    return;
  }

  container.innerHTML = available.map(task => `
    <div class="dash-card" style="margin-bottom: 1.25rem; border-left: 4px solid ${task.urgency === 'Critical' ? '#ef4444' : '#0d9488'};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
            <span class="dash-badge ${task.urgency === 'Critical' ? 'critical' : 'active'}">${task.urgency} Priority</span>
            <span style="font-size: 0.8rem; color: #64748b;">${task.category}</span>
          </div>
          <h4 style="margin: 0; font-size: 1.15rem; color: var(--dark-navy);">${task.title}</h4>
          <div style="font-size: 0.85rem; color: #475569; margin-top: 0.4rem;">
            <span>📅 <strong>Date:</strong> ${task.date}</span> &bull; 
            <span>📍 <strong>Location:</strong> ${task.location}</span>
          </div>
        </div>
        <button class="dash-btn dash-btn-primary" onclick="acceptVolunteerTask('${task.id}')">
          🤝 Accept Task
        </button>
      </div>
    </div>
  `).join('');
}

function renderAssignedTasks() {
  const container = document.getElementById('volunteer-assigned-tasks-list');
  if (!container) return;

  const assigned = volunteerTasks.filter(t => t.status === 'Assigned');
  if (assigned.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 2rem; color: #64748b;">No active tasks assigned. Accept a task above to begin your service run.</div>`;
    return;
  }

  container.innerHTML = assigned.map(task => `
    <div class="dash-card" style="margin-bottom: 1.25rem; background: #f0fdf4; border: 1px solid #bbf7d0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="dash-badge verified">Assigned & Active</span>
          <h4 style="margin: 0.35rem 0 0.25rem 0; font-size: 1.15rem; color: #166534;">${task.title}</h4>
          <div style="font-size: 0.85rem; color: #15803d;">
            <span>📅 ${task.date}</span> &bull; <span>📍 ${task.location}</span>
          </div>
        </div>
        <button class="dash-btn dash-btn-success" onclick="completeVolunteerTask('${task.id}')">
          ✓ Mark Task Completed
        </button>
      </div>
    </div>
  `).join('');
}

window.acceptVolunteerTask = function(taskId) {
  const task = volunteerTasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'Assigned';
    alert(`🎉 Task Accepted: "${task.title}"\nLocation: ${task.location}\nDetails and coordinator contact dispatched to your email & SMS.`);
    renderVolunteerKPIs();
    renderAvailableTasks();
    renderAssignedTasks();
  }
};

window.completeVolunteerTask = function(taskId) {
  const taskIndex = volunteerTasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    const title = volunteerTasks[taskIndex].title;
    volunteerTasks.splice(taskIndex, 1);
    alert(`🌟 Service Completed: "${title}"\nLogged 4 Volunteer Service Hours to your Official Certificate.`);
    renderVolunteerKPIs();
    renderAvailableTasks();
    renderAssignedTasks();
  }
};

function setupAvailabilityStatus() {
  const statusEl = document.getElementById('vol-status-text');
  const toggleBtn = document.getElementById('vol-status-toggle');
  if (!statusEl || !toggleBtn) return;

  let active = true;
  toggleBtn.addEventListener('click', () => {
    active = !active;
    if (active) {
      statusEl.textContent = '🟢 Active & Ready for Missions';
      statusEl.style.color = '#059669';
      toggleBtn.textContent = 'Set Inactive / Resting';
    } else {
      statusEl.textContent = '⏸️ Temporarily Inactive';
      statusEl.style.color = '#d97706';
      toggleBtn.textContent = 'Set Active & Ready';
    }
  });
}
