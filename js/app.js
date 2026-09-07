/**
 * JCF Healthcare Support - Main Application Controller
 * Handles Public Portal, Patient Panel, Doctor Panel, Volunteer Panel, Admin Dashboard,
 * Appointments, Consultation Notes, Dynamic FAQs, AI Triage Summaries, and Real-Time State.
 */

class JCFApplication {
  constructor() {
    this.currentAdminTab = 'dashboard';
    this.currentDoctorTab = 'dash';
    this.initEventListeners();
    this.initPublicDoctors();
    this.initPublicFAQs();
    this.initCounters();
    this.initHeroSearch();
    this.initAILiveTriagePreview();
    this.initLiveClock();
    this.updateNavUserBadge();
    this.updateNotificationBadge();
    this.handleUrlParams();
  }

  /* ==========================================================================
     EVENT LISTENERS & NAVIGATION
     ========================================================================== */
  initEventListeners() {
    // Navigation Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href').substring(1);
        if (targetId) {
          e.preventDefault();
          this.navigateToSection(targetId);
          document.getElementById('mobile-nav')?.classList.remove('open');
        }
      });
    });

    // Mobile Hamburger
    const navToggle = document.getElementById('nav-toggle-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });
    }

    // Portal Access / Auth Modal Trigger
    const openAuthBtn = document.getElementById('open-auth-modal-btn');
    if (openAuthBtn) {
      openAuthBtn.addEventListener('click', () => this.openAuthModal());
    }

    // Custom Auth Form
    const customAuthForm = document.getElementById('custom-auth-form');
    if (customAuthForm) {
      customAuthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.getElementById('auth-role-select').value;
        const name = document.getElementById('auth-name-input').value.trim();
        this.switchRole(role, name);
      });
    }

    // Notification Dropdown Toggle
    const notifBtn = document.getElementById('nav-notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
        this.renderNavNotifications();
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
          notifDropdown.classList.remove('active');
        }
      });
    }

    const markReadBtn = document.getElementById('mark-notifs-read-btn');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        window.jcfStorage.markNotificationsAsRead();
        this.updateNotificationBadge();
        this.renderNavNotifications();
        this.showToast('All notifications marked as read', 'info');
      });
    }

    // Patient Form Submission
    const patientForm = document.getElementById('patient-support-form');
    if (patientForm) {
      patientForm.addEventListener('submit', (e) => this.handlePatientSubmit(e));
    }

    // Patient File Upload Label Update
    const patientFileInput = document.getElementById('patient-doc');
    const patientFileLabel = document.getElementById('patient-doc-label');
    if (patientFileInput && patientFileLabel) {
      patientFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          patientFileLabel.textContent = `📎 Selected: ${e.target.files[0].name}`;
        }
      });
    }

    // Volunteer Form Submission
    const volunteerForm = document.getElementById('volunteer-registration-form');
    if (volunteerForm) {
      volunteerForm.addEventListener('submit', (e) => this.handleVolunteerSubmit(e));
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contact-inquiry-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }

    // Appointment Booking Form Submission
    const appointmentForm = document.getElementById('appointment-booking-form');
    if (appointmentForm) {
      appointmentForm.addEventListener('submit', (e) => this.handleAppointmentSubmit(e));
    }

    // Consultation Notes Form Submission
    const notesForm = document.getElementById('consultation-notes-form');
    if (notesForm) {
      notesForm.addEventListener('submit', (e) => this.handleConsultationNotesSubmit(e));
    }

    // Doctor Profile Edit Form Submission
    const docProfileForm = document.getElementById('doctor-profile-edit-form');
    if (docProfileForm) {
      docProfileForm.addEventListener('submit', (e) => this.handleDoctorProfileSubmit(e));
    }

    // CareBot Controls
    const botToggleBtn = document.getElementById('carebot-toggle-btn');
    const botCloseBtn = document.getElementById('carebot-close-btn');
    const botClearBtn = document.getElementById('carebot-clear-btn');
    const botSoundBtn = document.getElementById('carebot-sound-btn');
    const botForm = document.getElementById('carebot-form');
    const botInput = document.getElementById('carebot-input');

    if (botToggleBtn) botToggleBtn.addEventListener('click', () => window.jcfBot?.toggleChat());
    if (botCloseBtn) botCloseBtn.addEventListener('click', () => window.jcfBot?.toggleChat(false));
    if (botClearBtn) botClearBtn.addEventListener('click', () => window.jcfBot?.clearChat());
    if (botSoundBtn) {
      botSoundBtn.addEventListener('click', () => {
        if (window.jcfBot) {
          window.jcfBot.isMuted = !window.jcfBot.isMuted;
          botSoundBtn.textContent = window.jcfBot.isMuted ? '🔇' : '🔔';
          this.showToast(window.jcfBot.isMuted ? 'Chatbot muted' : 'Chatbot audio enabled', 'info');
        }
      });
    }
    if (botForm && botInput) {
      botForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = botInput.value.trim();
        if (query) {
          botInput.value = '';
          window.jcfBot?.handleUserMessage(query);
        }
      });
    }

    // Tracker Modal Trigger
    document.querySelectorAll('.open-tracker-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openTrackerModal());
    });

    // Tracker Search
    const trackerSearchBtn = document.getElementById('tracker-search-btn');
    const trackerSearchInput = document.getElementById('tracker-search-input');
    if (trackerSearchBtn && trackerSearchInput) {
      trackerSearchBtn.addEventListener('click', () => {
        this.renderTrackerList(trackerSearchInput.value);
      });
      trackerSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.renderTrackerList(trackerSearchInput.value);
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-overlay .modal-close-btn, .modal-overlay .modal-backdrop').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Global Escape Key to close open overlays, drawers, and chat
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        document.getElementById('mobile-nav')?.classList.remove('open');
        document.getElementById('admin-sidebar')?.classList.remove('open');
        window.jcfBot?.toggleChat(false);
      }
    });

    // Print Receipt Button
    const printReceiptBtn = document.getElementById('print-receipt-btn');
    if (printReceiptBtn) {
      printReceiptBtn.addEventListener('click', () => window.print());
    }

    // FAQ Search & Category Filters
    const faqSearchInput = document.getElementById('faq-search-input');
    if (faqSearchInput) {
      faqSearchInput.addEventListener('input', (e) => {
        const activeCat = document.querySelector('.faq-pill.active')?.dataset.cat || 'All';
        this.renderPublicFAQs(activeCat, e.target.value);
      });
    }

    document.querySelectorAll('.faq-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.faq-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const query = document.getElementById('faq-search-input')?.value || '';
        this.renderPublicFAQs(pill.dataset.cat, query);
      });
    });

    // Admin Sidebar Tab Buttons
    document.querySelectorAll('.admin-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchAdminTab(tab);
      });
    });

    // Admin Sidebar Toggle for Mobile
    const adminMenuBtn = document.getElementById('admin-menu-toggle-btn');
    const adminSidebar = document.getElementById('admin-sidebar');
    const adminSidebarClose = document.getElementById('admin-sidebar-close-btn');

    if (adminMenuBtn && adminSidebar) {
      adminMenuBtn.addEventListener('click', () => adminSidebar.classList.add('open'));
    }
    if (adminSidebarClose && adminSidebar) {
      adminSidebarClose.addEventListener('click', () => adminSidebar.classList.remove('open'));
    }

    // Admin Patient Filters
    const patientSearch = document.getElementById('patient-table-search');
    const patientStatusFilter = document.getElementById('patient-status-filter');
    const patientPriorityFilter = document.getElementById('patient-priority-filter');

    if (patientSearch) patientSearch.addEventListener('input', () => this.renderAdminPatients());
    if (patientStatusFilter) patientStatusFilter.addEventListener('change', () => this.renderAdminPatients());
    if (patientPriorityFilter) patientPriorityFilter.addEventListener('change', () => this.renderAdminPatients());

    // Admin Volunteer Filters
    const volSearch = document.getElementById('vol-table-search');
    const volRoleFilter = document.getElementById('vol-role-filter');
    if (volSearch) volSearch.addEventListener('input', () => this.renderAdminVolunteers());
    if (volRoleFilter) volRoleFilter.addEventListener('change', () => this.renderAdminVolunteers());

    // Admin Update Status Form
    const adminStatusForm = document.getElementById('admin-update-status-form');
    if (adminStatusForm) {
      adminStatusForm.addEventListener('submit', (e) => this.handleAdminStatusSubmit(e));
    }

    // Admin FAQ Form
    const adminFaqForm = document.getElementById('admin-faq-form');
    if (adminFaqForm) {
      adminFaqForm.addEventListener('submit', (e) => this.handleAdminFaqSubmit(e));
    }

    const adminFaqCancelBtn = document.getElementById('admin-faq-cancel-btn');
    if (adminFaqCancelBtn) {
      adminFaqCancelBtn.addEventListener('click', () => {
        adminFaqForm.reset();
        document.getElementById('admin-faq-id').value = '';
        document.getElementById('admin-faq-form-title').textContent = 'Add New FAQ';
        adminFaqCancelBtn.style.display = 'none';
      });
    }

    // Admin Broadcast Form
    const broadcastForm = document.getElementById('admin-broadcast-form');
    if (broadcastForm) {
      broadcastForm.addEventListener('submit', (e) => this.handleBroadcastSubmit(e));
    }

    // AI Sandbox Form
    const aiSandboxForm = document.getElementById('ai-sandbox-form');
    if (aiSandboxForm) {
      aiSandboxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('ai-sandbox-input').value.trim();
        if (input) {
          const summary = window.jcfBot?.generateAISummary({
            age: 52,
            gender: 'Male',
            city: 'Delhi',
            department: 'Cardiology',
            aidType: 'Medicine Refill',
            priority: 'Urgent',
            details: input
          });
          const resultBox = document.getElementById('ai-sandbox-result');
          const output = document.getElementById('ai-sandbox-output');
          if (resultBox && output) {
            output.textContent = summary;
            resultBox.style.display = 'block';
          }
        }
      });
    }

    // Export Database Button
    const exportDbBtn = document.getElementById('btn-export-database');
    if (exportDbBtn) {
      exportDbBtn.addEventListener('click', () => {
        const jsonStr = window.jcfStorage.exportDatabaseJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `JCF_Healthcare_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Database exported successfully as JSON!', 'success');
      });
    }

    // Reset Demo Data Button
    const resetDbBtn = document.getElementById('btn-reset-demo-data');
    if (resetDbBtn) {
      resetDbBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data to default seed records?')) {
          window.jcfStorage.resetDemoData();
          this.showToast('Seed database restored!', 'success');
          this.renderAdminDashboard();
          this.renderAdminPatients();
          this.renderAdminVolunteers();
          this.renderAdminAppointments();
          this.renderPublicDoctors();
          this.renderPublicFAQs();
        }
      });
    }

    // Volunteer Portal Toggle Availability
    const volAvailBtn = document.getElementById('vol-toggle-avail-btn');
    if (volAvailBtn) {
      volAvailBtn.addEventListener('click', () => {
        const isAvail = volAvailBtn.textContent.includes('Active');
        volAvailBtn.textContent = isAvail ? '🟡 Status: On-Break' : '🟢 Status: Active';
        this.showToast(isAvail ? 'Availability set to On-Break' : 'Availability set to Active', 'info');
      });
    }
  }

  /* ==========================================================================
     ROLE SWITCHING & AUTHENTICATION
     ========================================================================== */
  handleUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const openRole = params.get('open') || params.get('panel') || params.get('role');
      if (openRole && ['doctor', 'admin', 'patient', 'volunteer'].includes(openRole.toLowerCase())) {
        setTimeout(() => {
          this.switchRole(openRole.toLowerCase());
        }, 150);
      }
    } catch (e) {}
  }

  openAuthModal() {
    document.getElementById('mobile-nav')?.classList.remove('open');
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
  }

  switchRole(role, customName = '') {
    // Close Auth Modal
    document.getElementById('auth-modal')?.classList.remove('active');

    let userObj = { role, name: customName };

    if (role === 'doctor') {
      userObj.name = customName || 'Dr. Rajesh Varma';
      userObj.id = 'DOC-101';
      userObj.specialty = 'Cardiology & Heart Care';
      userObj.email = 'dr.varma@jcfhealthcare.org';
      window.jcfStorage.setCurrentUser(userObj);
      this.updateNavUserBadge();
      this.openDoctorPortal();
      this.showToast(`Logged into Doctor Panel as ${userObj.name}`, 'success');
    } else if (role === 'admin') {
      userObj.name = customName || 'Super Administrator';
      userObj.email = 'admin@jcfhealthcare.org';
      window.jcfStorage.setCurrentUser(userObj);
      this.updateNavUserBadge();
      this.openAdminPanel();
      this.showToast('Logged in as Administrator (Full Access)', 'success');
    } else if (role === 'patient') {
      userObj.name = customName || 'Amina Khatun';
      userObj.id = 'JCF-PAT-7814';
      userObj.phone = '+91 98765 43210';
      userObj.email = 'amina.khatun@example.com';
      window.jcfStorage.setCurrentUser(userObj);
      this.updateNavUserBadge();
      this.openPatientPortal();
      this.showToast(`Logged into Patient Portal as ${userObj.name}`, 'success');
    } else if (role === 'volunteer') {
      userObj.name = customName || 'Dr. Sameer Siddiqui';
      userObj.id = 'JCF-VOL-1044';
      userObj.role = 'volunteer';
      userObj.email = 'dr.sameer@example.com';
      window.jcfStorage.setCurrentUser(userObj);
      this.updateNavUserBadge();
      this.openVolunteerPortal();
      this.showToast(`Logged into Volunteer Portal as ${userObj.name}`, 'success');
    }
  }

  logout() {
    window.jcfStorage.logout();
    this.closeAdminPanel();
    document.getElementById('doctor-portal-modal')?.classList.remove('active');
    document.getElementById('patient-portal-modal')?.classList.remove('active');
    document.getElementById('volunteer-portal-modal')?.classList.remove('active');
    this.updateNavUserBadge();
    this.showToast('Signed out of portal. Returned to public view.', 'info');
  }

  updateNavUserBadge() {
    const user = window.jcfStorage.getCurrentUser();
    const badge = document.getElementById('nav-user-badge');
    if (!badge) return;

    const name = user?.name || 'User';
    const parts = name.split(' ');
    const firstName = parts[0] || 'User';
    const secondName = parts[1] || firstName;

    if (user?.role === 'doctor') {
      badge.innerHTML = `👨‍⚕️ ${secondName}`;
      badge.className = 'portal-user-badge badge-doctor';
    } else if (user?.role === 'admin') {
      badge.innerHTML = '👨‍💼 Admin';
      badge.className = 'portal-user-badge badge-admin';
    } else if (user?.role === 'patient') {
      badge.innerHTML = `👤 ${firstName}`;
      badge.className = 'portal-user-badge badge-patient';
    } else if (user?.role === 'volunteer') {
      badge.innerHTML = `🤝 ${firstName}`;
      badge.className = 'portal-user-badge badge-volunteer';
    } else {
      badge.innerHTML = '👤 Guest';
      badge.className = 'portal-user-badge';
    }
  }

  /* ==========================================================================
     👨‍⚕️ DOCTOR PORTAL CONTROLLER
     ========================================================================== */
  openDoctorPortal() {
    const modal = document.getElementById('doctor-portal-modal');
    if (!modal) return;

    const user = window.jcfStorage.getCurrentUser();
    const docId = user.id || 'DOC-101';
    const doctor = window.jcfStorage.getDoctorById(docId) || window.jcfStorage.getDoctors()[0];

    // Populate Doctor Banner
    document.getElementById('doc-portal-name').textContent = doctor.name;
    const docAvatarEl = document.getElementById('doc-portal-avatar');
    if (docAvatarEl) {
      if (doctor.image) {
        docAvatarEl.innerHTML = `<img src="${doctor.image}" alt="${doctor.name}" class="avatar-photo" />`;
      } else {
        docAvatarEl.textContent = doctor.avatar || '👨‍⚕️';
      }
    }
    document.getElementById('doc-portal-meta').textContent = `${doctor.specialty} • ${doctor.qualifications} • ${doctor.hospitalAffiliation}`;

    this.switchDoctorTab('dash');
    modal.classList.add('active');
  }

  switchDoctorTab(tabName) {
    this.currentDoctorTab = tabName;

    // Update Subnav Buttons
    document.querySelectorAll('.doc-subnav-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.doctab === tabName);
    });

    // Update Tab Panels
    document.querySelectorAll('.doctor-tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `doctab-${tabName}`);
    });

    // Render Tab Data
    const user = window.jcfStorage.getCurrentUser();
    const docId = user.id || 'DOC-101';

    if (tabName === 'dash') this.renderDoctorDashboard(docId);
    else if (tabName === 'apts') this.renderDoctorAppointments(docId);
    else if (tabName === 'patients') this.renderDoctorPatients(docId);
    else if (tabName === 'notes') this.renderDoctorConsultationRecords(docId);
    else if (tabName === 'notifs') this.renderDoctorNotifications(docId);
  }

  renderDoctorDashboard(docId = 'DOC-101') {
    const stats = window.jcfStorage.getDoctorStats(docId);
    const appointments = window.jcfStorage.getDoctorAppointments(docId);

    // Update Doctor KPI values
    document.getElementById('doc-kpi-total-patients').textContent = stats.totalPatients;
    document.getElementById('doc-kpi-total-apts').textContent = stats.totalAppointments;
    document.getElementById('doc-kpi-pending-apts').textContent = stats.pendingAppointments;
    document.getElementById('doc-kpi-completed-apts').textContent = stats.completedAppointments;

    document.getElementById('doc-tab-apts-count').textContent = appointments.length;
    document.getElementById('doc-tab-patients-count').textContent = stats.totalPatients;

    // Today's Queue Container
    const queueContainer = document.getElementById('doctor-today-queue-container');
    if (!queueContainer) return;

    if (appointments.length === 0) {
      queueContainer.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No consultation slots booked for today.</p>`;
      return;
    }

    queueContainer.innerHTML = appointments.slice(0, 4).map(apt => `
      <div class="doctor-apt-card">
        <div class="doc-apt-header">
          <div>
            <span class="req-id-tag">${apt.id}</span>
            <h4 style="font-size:1.1rem; margin-top:3px;">${apt.patientName} (${apt.type})</h4>
            <span style="font-size:0.85rem; color:var(--text-muted);">📅 ${apt.date} at ⏰ <strong>${apt.time}</strong> • 📞 ${apt.patientPhone}</span>
          </div>
          <span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span>
        </div>

        <div style="margin:0.75rem 0; font-size:0.88rem; background:rgba(14, 165, 168, 0.05); padding:0.75rem; border-radius:var(--radius-sm);">
          <strong>Patient Chief Complaint:</strong> "${apt.symptoms}"
        </div>

        <div class="doc-apt-actions">
          ${apt.status === 'Pending' ? `
            <button type="button" class="btn-success-sm" onclick="window.jcfApp.acceptDoctorAppointment('${apt.id}')">
              ✓ Accept & Confirm Appointment
            </button>
            <button type="button" class="btn-outline-danger-sm" onclick="window.jcfApp.rejectDoctorAppointment('${apt.id}')">
              ✕ Decline
            </button>
          ` : ''}

          ${apt.status === 'Confirmed' ? `
            ${apt.meetingLink ? `<a href="${apt.meetingLink}" target="_blank" class="btn-primary-sm">🔗 Join Tele-Video Room</a>` : ''}
            <button type="button" class="btn-primary-sm" onclick="window.jcfApp.openConsultationNotesModal('${apt.id}')">
              📝 Record Consultation Notes
            </button>
          ` : ''}

          ${apt.status === 'Completed' ? `
            <span style="font-size:0.85rem; color:var(--success-green); font-weight:700;">✓ Consultation Completed</span>
            <button type="button" class="btn-outline-sm" onclick="window.jcfApp.openConsultationNotesModal('${apt.id}')">
              👁️ View Notes
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  renderDoctorAppointments(docId = 'DOC-101') {
    const container = document.getElementById('doctor-all-apts-container');
    if (!container) return;

    const appointments = window.jcfStorage.getDoctorAppointments(docId);
    if (appointments.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No appointments found in your schedule.</p>`;
      return;
    }

    container.innerHTML = appointments.map(apt => `
      <div class="doctor-apt-card">
        <div class="doc-apt-header">
          <div>
            <span class="req-id-tag">${apt.id}</span>
            <h4 style="font-size:1.15rem; margin-top:3px;">${apt.patientName} • ${apt.department}</h4>
            <span style="font-size:0.85rem; color:var(--text-muted);">Mode: <strong>${apt.type}</strong> | Scheduled: <strong>${apt.date} (${apt.time})</strong></span>
          </div>
          <span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span>
        </div>

        <p style="font-size:0.88rem; margin:0.5rem 0;"><strong>Symptoms:</strong> "${apt.symptoms}"</p>

        ${apt.consultationNotes ? `
          <div class="doc-notes-summary-box">
            <strong>Clinical Advice:</strong> ${apt.consultationNotes.advice}<br>
            <small style="color:var(--text-muted);">Follow-up Date: ${apt.consultationNotes.followUpDate || 'As needed'}</small>
          </div>
        ` : ''}

        <div class="doc-apt-actions" style="margin-top:0.75rem;">
          ${apt.status === 'Pending' ? `
            <button type="button" class="btn-success-sm" onclick="window.jcfApp.acceptDoctorAppointment('${apt.id}')">✓ Accept</button>
            <button type="button" class="btn-outline-danger-sm" onclick="window.jcfApp.rejectDoctorAppointment('${apt.id}')">✕ Reject</button>
          ` : ''}
          ${apt.status === 'Confirmed' ? `
            ${apt.meetingLink ? `<a href="${apt.meetingLink}" target="_blank" class="btn-primary-sm">🔗 Join Video Room</a>` : ''}
            <button type="button" class="btn-primary-sm" onclick="window.jcfApp.openConsultationNotesModal('${apt.id}')">📝 Record Notes</button>
          ` : ''}
          ${apt.status === 'Completed' ? `
            <button type="button" class="btn-outline-sm" onclick="window.jcfApp.openConsultationNotesModal('${apt.id}')">👁️ View Notes</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  renderDoctorPatients(docId = 'DOC-101') {
    const container = document.getElementById('doctor-my-patients-container');
    if (!container) return;

    const patients = window.jcfStorage.getDoctorPatients(docId);
    if (patients.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No assigned patients yet.</p>`;
      return;
    }

    container.innerHTML = patients.map(p => `
      <div class="doctor-patient-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="req-id-tag">${p.id}</span>
            <h4 style="font-size:1.15rem; margin-top:3px;">${p.name} (${p.age} Yrs, ${p.gender})</h4>
            <span style="font-size:0.85rem; color:var(--text-muted);">📍 ${p.city} • 📞 ${p.phone}</span>
          </div>
          <span class="priority-pill priority-${p.priority.toLowerCase()}">${p.priority} Priority</span>
        </div>

        <div style="margin:0.75rem 0; font-size:0.88rem; background:rgba(14, 165, 168, 0.05); padding:0.75rem; border-radius:var(--radius-sm);">
          <strong>Diagnosis / Details:</strong> ${p.details}
        </div>

        ${p.aiSummary ? `
          <div style="font-size:0.85rem; color:var(--primary); margin-bottom:0.75rem;">
            🤖 <strong>AI Triage:</strong> ${p.aiSummary}
          </div>
        ` : ''}

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <small>Document: <strong>${p.documentName || 'Prescription.pdf'}</strong></small>
          <button type="button" class="btn-outline-sm" onclick="window.jcfApp.viewPatientDetails('${p.id}')">👁️ Full Medical File</button>
        </div>
      </div>
    `).join('');
  }

  renderDoctorConsultationRecords(docId = 'DOC-101') {
    const container = document.getElementById('doctor-consultation-records-container');
    if (!container) return;

    const appointments = window.jcfStorage.getDoctorAppointments(docId);
    const completed = appointments.filter(a => a.consultationNotes || a.status === 'Completed');

    if (completed.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No historical consultation notes recorded yet.</p>`;
      return;
    }

    container.innerHTML = completed.map(a => `
      <div class="doctor-notes-card">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <div>
            <strong>${a.patientName}</strong> (${a.department})
            <div style="font-size:0.8rem; color:var(--text-muted);">Appointment ID: ${a.id} • ${a.date}</div>
          </div>
          <span class="status-badge status-completed">Completed</span>
        </div>

        ${a.consultationNotes ? `
          <div style="font-size:0.88rem; display:flex; flex-direction:column; gap:0.35rem; background:#ffffff; padding:0.85rem; border-radius:var(--radius-sm); border:1px solid #e2e8f0;">
            <div><strong>Symptoms:</strong> ${a.consultationNotes.symptoms}</div>
            <div><strong>Observations:</strong> ${a.consultationNotes.observations}</div>
            <div><strong>Advice & Instructions:</strong> ${a.consultationNotes.advice}</div>
            <div><strong>Next Follow-Up:</strong> ${a.consultationNotes.followUpDate || 'Not specified'}</div>
          </div>
        ` : `<p style="font-size:0.85rem; color:var(--text-muted);">Consultation completed with verbal guidance.</p>`}
      </div>
    `).join('');
  }

  renderDoctorNotifications(docId = 'DOC-101') {
    const container = document.getElementById('doctor-notifs-container');
    if (!container) return;

    const notifs = window.jcfStorage.getNotifications('doctor', docId);
    if (notifs.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No new doctor notifications.</p>`;
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="patient-notif-item">
        <strong>${n.title}</strong>
        <p style="font-size:0.88rem; margin:2px 0;">${n.message}</p>
        <small style="color:var(--text-light);">${new Date(n.timestamp).toLocaleDateString()}</small>
      </div>
    `).join('');
  }

  acceptDoctorAppointment(aptId) {
    const videoLink = `https://meet.jcfhealthcare.org/tele-consult-${Math.floor(1000 + Math.random() * 9000)}`;
    window.jcfStorage.updateAppointmentStatus(aptId, 'Confirmed', videoLink);
    this.renderDoctorDashboard();
    this.renderDoctorAppointments();
    this.showToast(`Appointment ${aptId} accepted & confirmed! Video room link generated.`, 'success');
  }

  rejectDoctorAppointment(aptId) {
    const reason = prompt('Please enter cancellation / reschedule reason:');
    if (reason !== null) {
      window.jcfStorage.updateAppointmentStatus(aptId, 'Cancelled');
      this.renderDoctorDashboard();
      this.renderDoctorAppointments();
      this.showToast(`Appointment ${aptId} declined.`, 'info');
    }
  }

  openConsultationNotesModal(aptId) {
    const appointments = window.jcfStorage.getAppointments();
    const apt = appointments.find(a => a.id === aptId);
    if (!apt) return;

    const modal = document.getElementById('consultation-notes-modal');
    if (!modal) return;

    document.getElementById('notes-appointment-id').value = apt.id;
    document.getElementById('consultation-notes-patient-info').textContent = `Patient: ${apt.patientName} (${apt.department}) • Ref: ${apt.id}`;

    if (apt.consultationNotes) {
      document.getElementById('notes-symptoms').value = apt.consultationNotes.symptoms || apt.symptoms || '';
      document.getElementById('notes-observations').value = apt.consultationNotes.observations || '';
      document.getElementById('notes-advice').value = apt.consultationNotes.advice || '';
      document.getElementById('notes-followup-date').value = apt.consultationNotes.followUpDate || '';
    } else {
      document.getElementById('notes-symptoms').value = apt.symptoms || '';
      document.getElementById('notes-observations').value = '';
      document.getElementById('notes-advice').value = '';
      document.getElementById('notes-followup-date').value = '';
    }

    modal.classList.add('active');
  }

  handleConsultationNotesSubmit(e) {
    e.preventDefault();
    const aptId = document.getElementById('notes-appointment-id').value;
    const symptoms = document.getElementById('notes-symptoms').value.trim();
    const observations = document.getElementById('notes-observations').value.trim();
    const advice = document.getElementById('notes-advice').value.trim();
    const followUpDate = document.getElementById('notes-followup-date').value;

    window.jcfStorage.saveConsultationNotes(aptId, {
      symptoms,
      observations,
      advice,
      followUpDate
    });

    document.getElementById('consultation-notes-modal').classList.remove('active');
    this.renderDoctorDashboard();
    this.renderDoctorAppointments();
    this.renderDoctorConsultationRecords();
    this.showToast(`Consultation notes saved for ${aptId}! Patient notified.`, 'success');
  }

  openDoctorProfileModal() {
    const user = window.jcfStorage.getCurrentUser();
    const docId = user.id || 'DOC-101';
    const doctor = window.jcfStorage.getDoctorById(docId) || window.jcfStorage.getDoctors()[0];

    const modal = document.getElementById('doctor-profile-modal');
    if (!modal) return;

    document.getElementById('doc-edit-specialty').value = doctor.specialty || '';
    document.getElementById('doc-edit-qualifications').value = doctor.qualifications || '';
    document.getElementById('doc-edit-hospital').value = doctor.hospitalAffiliation || '';
    document.getElementById('doc-edit-timing').value = doctor.availableDays || '';
    document.getElementById('doc-edit-phone').value = doctor.phone || '';

    modal.classList.add('active');
  }

  handleDoctorProfileSubmit(e) {
    e.preventDefault();
    const user = window.jcfStorage.getCurrentUser();
    const docId = user.id || 'DOC-101';

    const specialty = document.getElementById('doc-edit-specialty').value.trim();
    const qualifications = document.getElementById('doc-edit-qualifications').value.trim();
    const hospitalAffiliation = document.getElementById('doc-edit-hospital').value.trim();
    const availableDays = document.getElementById('doc-edit-timing').value.trim();
    const phone = document.getElementById('doc-edit-phone').value.trim();

    const updated = window.jcfStorage.updateDoctorProfile(docId, {
      specialty,
      qualifications,
      hospitalAffiliation,
      availableDays,
      phone
    });

    document.getElementById('doctor-profile-modal').classList.remove('active');

    if (updated) {
      document.getElementById('doc-portal-meta').textContent = `${updated.specialty} • ${updated.qualifications} • ${updated.hospitalAffiliation}`;
      this.initPublicDoctors();
      this.showToast('Doctor Profile updated successfully!', 'success');
    }
  }

  toggleDoctorAvailability() {
    const btn = document.getElementById('doc-avail-toggle-btn');
    if (btn) {
      const isAvailable = btn.textContent.includes('Available');
      btn.textContent = isAvailable ? '🟡 Status: In Surgery / Off-Duty' : '🟢 Status: Available for OPD';
      this.showToast(isAvailable ? 'Doctor status set to Off-Duty' : 'Doctor status set to Available for OPD', 'info');
    }
  }

  /* ==========================================================================
     PATIENT PORTAL CONTROLLER
     ========================================================================== */
  openPatientPortal() {
    const modal = document.getElementById('patient-portal-modal');
    if (!modal) return;

    const user = window.jcfStorage.getCurrentUser();
    document.getElementById('pat-portal-name').textContent = user.name || 'Amina Khatun';

    this.renderPatientRequestsList();
    this.renderPatientAppointmentsList();
    this.renderPatientNotifications();

    modal.classList.add('active');
  }

  renderPatientRequestsList() {
    const container = document.getElementById('patient-requests-container');
    if (!container) return;

    const patients = window.jcfStorage.getPatientRequests();
    const user = window.jcfStorage.getCurrentUser();

    let userRequests = patients;
    if (user.name && user.name !== 'Guest Visitor') {
      const match = patients.filter(p => p.name.toLowerCase().includes(user.name.toLowerCase()) || p.id === user.id);
      if (match.length > 0) userRequests = match;
    }

    if (userRequests.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <p>You have no active healthcare aid requests.</p>
          <button type="button" class="btn-primary-sm" onclick="window.jcfApp.navigateToSection('patient-form'); document.getElementById('patient-portal-modal').classList.remove('active');">
            Submit New Request
          </button>
        </div>
      `;
      return;
    }

    const stages = ['Pending', 'Under Review', 'Approved', 'In Progress', 'Completed'];

    container.innerHTML = userRequests.map(req => {
      const currentStageIndex = stages.indexOf(req.status);

      return `
        <div class="patient-request-card">
          <div class="req-card-header">
            <div>
              <span class="req-id-tag">${req.id}</span>
              <h4 class="req-title">${req.aidType} (${req.department})</h4>
              <span class="req-date">Submitted on ${new Date(req.submittedAt).toLocaleDateString()} • Priority: <strong>${req.priority}</strong></span>
            </div>
            <span class="status-badge status-${req.status.toLowerCase().replace(/\s+/g, '-')}">${req.status}</span>
          </div>

          <!-- 5-Stage Live Progress Tracker Bar -->
          <div class="req-tracker-stepper">
            ${stages.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return `
                <div class="tracker-step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}">
                  <div class="step-circle">${isCompleted ? '✓' : idx + 1}</div>
                  <span class="step-label">${stage}</span>
                </div>
              `;
            }).join('')}
          </div>

          ${req.aiSummary ? `
            <div class="req-ai-box">
              <strong>🤖 AI Triage Insight:</strong> ${req.aiSummary}
            </div>
          ` : ''}

          <div class="req-meta-row">
            <div><strong>Assigned Volunteer:</strong> ${req.assignedVolunteerName || 'Assigning soon...'}</div>
            <div><strong>Assigned Doctor:</strong> ${req.assignedDoctorName || 'Pending board triage'}</div>
          </div>

          ${req.adminNotes ? `
            <div class="req-admin-note">
              <strong>Official Board Note:</strong> "${req.adminNotes}"
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  renderPatientAppointmentsList() {
    const container = document.getElementById('patient-appointments-container');
    if (!container) return;

    const appointments = window.jcfStorage.getAppointments();
    const user = window.jcfStorage.getCurrentUser();

    let userApts = appointments;
    if (user.name && user.name !== 'Guest Visitor') {
      const match = appointments.filter(a => a.patientName.toLowerCase().includes(user.name.toLowerCase()));
      if (match.length > 0) userApts = match;
    }

    if (userApts.length === 0) {
      container.innerHTML = `<p style="font-size:0.9rem; color:var(--text-muted);">No upcoming appointments scheduled.</p>`;
      return;
    }

    container.innerHTML = userApts.map(apt => `
      <div class="patient-apt-card">
        <div class="apt-header">
          <div>
            <h4 style="font-size:1.05rem;">🩺 ${apt.doctorName} (${apt.department})</h4>
            <span style="font-size:0.85rem; color:var(--text-muted);">${apt.type} • ID: ${apt.id}</span>
          </div>
          <span class="status-badge status-${apt.status.toLowerCase()}">${apt.status}</span>
        </div>
        <div style="margin: 0.5rem 0; font-size:0.9rem;">
          📅 <strong>${apt.date}</strong> at ⏰ <strong>${apt.time}</strong>
        </div>
        <div style="font-size:0.88rem; color:var(--text-muted); margin-bottom:0.5rem;">
          📍 <strong>Location / Link:</strong> ${apt.meetingLink ? `<a href="${apt.meetingLink}" target="_blank" class="bot-link">Join Tele-Health Video Room →</a>` : (apt.location || 'Doctor will call registered number')}
        </div>

        ${apt.consultationNotes ? `
          <div class="req-admin-note" style="margin-top:0.5rem;">
            <strong>Doctor Consultation Summary:</strong><br>
            • Observations: ${apt.consultationNotes.observations}<br>
            • Advice: ${apt.consultationNotes.advice}<br>
            • Follow-up: ${apt.consultationNotes.followUpDate || 'As needed'}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  renderPatientNotifications() {
    const container = document.getElementById('patient-notifs-container');
    if (!container) return;

    const notifs = window.jcfStorage.getNotifications('patient');
    if (notifs.length === 0) {
      container.innerHTML = `<p style="font-size:0.9rem; color:var(--text-muted);">No unread care notifications.</p>`;
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="patient-notif-item">
        <strong>${n.title}</strong>
        <p style="font-size:0.88rem; margin-top:2px;">${n.message}</p>
        <span style="font-size:0.75rem; color:var(--text-light);">${new Date(n.timestamp).toLocaleDateString()}</span>
      </div>
    `).join('');
  }

  /* ==========================================================================
     VOLUNTEER PORTAL CONTROLLER
     ========================================================================== */
  openVolunteerPortal() {
    const modal = document.getElementById('volunteer-portal-modal');
    if (!modal) return;

    const user = window.jcfStorage.getCurrentUser();
    document.getElementById('vol-portal-name').textContent = user.name || 'Dr. Sameer Siddiqui';

    this.renderVolunteerTasks();
    modal.classList.add('active');
  }

  renderVolunteerTasks() {
    const container = document.getElementById('volunteer-tasks-container');
    if (!container) return;

    const patients = window.jcfStorage.getPatientRequests();
    const assigned = patients.filter(p => p.assignedVolunteerName || p.status === 'Approved' || p.status === 'In Progress');

    if (assigned.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No open tasks currently assigned. New tasks will appear here automatically.</p>`;
      return;
    }

    container.innerHTML = assigned.map(task => `
      <div class="volunteer-task-card">
        <div class="task-card-header">
          <div>
            <span class="req-id-tag">${task.id}</span>
            <h4 style="font-size:1.1rem; margin-top:3px;">${task.name} (${task.age} Yrs, ${task.gender})</h4>
            <span style="font-size:0.85rem; color:var(--text-muted);">📍 ${task.city} • 📞 ${task.phone}</span>
          </div>
          <span class="status-badge status-${task.status.toLowerCase().replace(/\s+/g, '-')}">${task.status}</span>
        </div>

        <div style="margin: 0.75rem 0; font-size:0.92rem; background:rgba(14, 165, 168, 0.06); padding:0.75rem; border-radius:var(--radius-sm);">
          <strong>Requested Aid:</strong> ${task.aidType} (${task.department})<br>
          <strong>Medical Details:</strong> ${task.details}
        </div>

        ${task.aiSummary ? `
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">
            🤖 <strong>AI Triage:</strong> ${task.aiSummary}
          </div>
        ` : ''}

        <div class="task-actions-row">
          ${task.status !== 'In Progress' && task.status !== 'Completed' ? `
            <button type="button" class="btn-primary-sm" onclick="window.jcfApp.updateTaskStatus('${task.id}', 'In Progress')">
              ⚡ Accept & Start Task
            </button>
          ` : ''}
          ${task.status === 'In Progress' ? `
            <button type="button" class="btn-success-sm" onclick="window.jcfApp.completeVolunteerTask('${task.id}')">
              ✓ Mark Aid Delivered / Completed
            </button>
          ` : ''}
          <button type="button" class="btn-outline-sm" onclick="window.location.href='tel:${task.phone.replace(/[^0-9+]/g, '')}'">
            📞 Call Beneficiary
          </button>
        </div>
      </div>
    `).join('');
  }

  updateTaskStatus(patientId, newStatus) {
    const user = window.jcfStorage.getCurrentUser();
    window.jcfStorage.updatePatientStatus(patientId, newStatus, `Task updated by volunteer ${user.name}`);
    this.renderVolunteerTasks();
    this.showToast(`Case ${patientId} marked as ${newStatus}`, 'success');
  }

  completeVolunteerTask(patientId) {
    const notes = prompt('Enter field completion note (e.g. 3-month insulin delivered to patient at residence):');
    if (notes !== null) {
      const user = window.jcfStorage.getCurrentUser();
      window.jcfStorage.updatePatientStatus(patientId, 'Completed', notes || `Completed by volunteer ${user.name}`);
      this.renderVolunteerTasks();
      this.showToast(`Case ${patientId} successfully marked Completed!`, 'success');
    }
  }

  /* ==========================================================================
     ADMIN PANEL CONTROLLER
     ========================================================================== */
  openAdminPanel() {
    const overlay = document.getElementById('admin-panel-overlay');
    if (overlay) {
      overlay.classList.add('active');
      this.switchAdminTab('dashboard');
    }
  }

  closeAdminPanel() {
    document.getElementById('admin-panel-overlay')?.classList.remove('active');
  }

  switchAdminTab(tabName) {
    this.currentAdminTab = tabName;

    document.querySelectorAll('.admin-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.admin-tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });

    const titles = {
      dashboard: 'Dashboard Overview',
      patients: 'Patient Support Requests',
      volunteers: 'Volunteer Heroes Directory',
      doctors: 'Specialists & Advisory Board',
      appointments: 'Doctor Consultation Appointments',
      enquiries: 'Contact & Inquiry Inbox',
      faqs: 'FAQ Knowledge Management',
      'ai-control': 'Chatbot & AI Triage Intelligence',
      reports: 'Outreach Reports & Analytics',
      notifications: 'Broadcast Push Notifications',
      settings: 'System Profile & Backup'
    };
    document.getElementById('admin-active-tab-title').textContent = titles[tabName] || 'Admin Portal';

    if (tabName === 'dashboard') this.renderAdminDashboard();
    else if (tabName === 'patients') this.renderAdminPatients();
    else if (tabName === 'volunteers') this.renderAdminVolunteers();
    else if (tabName === 'doctors') this.renderAdminDoctors();
    else if (tabName === 'appointments') this.renderAdminAppointments();
    else if (tabName === 'enquiries') this.renderAdminEnquiries();
    else if (tabName === 'faqs') this.renderAdminFAQs();
    else if (tabName === 'ai-control') this.renderAdminAILogs();
    else if (tabName === 'notifications') this.renderAdminSentNotifs();

    document.getElementById('admin-sidebar')?.classList.remove('open');
  }

  renderAdminDashboard() {
    const stats = window.jcfStorage.getAdminStats();

    document.getElementById('kpi-total-patients').textContent = stats.totalPatients;
    document.getElementById('kpi-total-volunteers').textContent = stats.totalVolunteers;
    document.getElementById('kpi-pending-requests').textContent = stats.pendingRequests;
    document.getElementById('kpi-total-appointments').textContent = stats.totalAppointments;
    document.getElementById('kpi-new-inquiries').textContent = stats.unreadInquiries;

    document.getElementById('admin-badge-patients').textContent = stats.totalPatients;
    document.getElementById('admin-badge-volunteers').textContent = stats.totalVolunteers;
    document.getElementById('admin-badge-appointments').textContent = stats.totalAppointments;
    document.getElementById('admin-badge-enquiries').textContent = stats.unreadInquiries;

    const alertBox = document.getElementById('admin-emergency-alert-box');
    const alertText = document.getElementById('admin-emergency-text');
    if (alertBox) {
      if (stats.emergencyRequests > 0) {
        alertBox.style.display = 'flex';
        if (alertText) alertText.textContent = `${stats.emergencyRequests} critical emergency case(s) requiring immediate board action!`;
      } else {
        alertBox.style.display = 'none';
      }
    }

    const priorityBody = document.getElementById('dash-priority-table-body');
    if (priorityBody) {
      const patients = window.jcfStorage.getPatientRequests();
      const urgentList = patients.filter(p => p.priority === 'Emergency' || p.priority === 'Urgent' || p.status === 'Pending').slice(0, 5);

      if (urgentList.length === 0) {
        priorityBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">All priority cases resolved!</td></tr>`;
      } else {
        priorityBody.innerHTML = urgentList.map(p => `
          <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.name} (${p.age}y, ${p.city})</td>
            <td>${p.aidType}</td>
            <td><span class="priority-pill priority-${p.priority.toLowerCase()}">${p.priority}</span></td>
            <td><span class="status-badge status-${p.status.toLowerCase().replace(/\s+/g, '-')}">${p.status}</span></td>
            <td>
              <button type="button" class="btn-action-sm" onclick="window.jcfApp.openAdminActionModal('${p.id}')">
                Manage
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    const feedBody = document.getElementById('dash-activity-feed');
    if (feedBody) {
      const activities = window.jcfStorage.getActivities();
      feedBody.innerHTML = activities.slice(0, 8).map(act => `
        <div class="activity-feed-item">
          <div class="activity-bullet bullet-${act.type}"></div>
          <div class="activity-text">
            <span>${act.text}</span>
            <small>${act.time}</small>
          </div>
        </div>
      `).join('');
    }
  }

  renderAdminPatients() {
    const tableBody = document.getElementById('patients-master-table-body');
    if (!tableBody) return;

    const patients = window.jcfStorage.getPatientRequests();
    const query = document.getElementById('patient-table-search')?.value.toLowerCase().trim() || '';
    const statusFilter = document.getElementById('patient-status-filter')?.value || 'All';
    const prioFilter = document.getElementById('patient-priority-filter')?.value || 'All';

    let filtered = patients.filter(p => {
      const matchQ = !query || p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || p.city.toLowerCase().includes(query) || p.aidType.toLowerCase().includes(query);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchPrio = prioFilter === 'All' || p.priority === prioFilter;
      return matchQ && matchStatus && matchPrio;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No patient requests match the active filter criteria.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(p => `
      <tr>
        <td><strong>${p.id}</strong></td>
        <td>
          <div style="font-weight:600;">${p.name}</div>
          <small style="color:var(--text-muted);">${p.age} Yrs • ${p.gender}</small>
        </td>
        <td>
          <div>${p.aidType}</div>
          <small style="color:var(--primary);">${p.department}</small>
        </td>
        <td>
          <div>${p.city}</div>
          <small style="color:var(--text-muted);">${p.phone}</small>
        </td>
        <td>
          <span class="priority-pill priority-${p.priority.toLowerCase()}">${p.priority}</span>
        </td>
        <td>
          <span class="status-badge status-${p.status.toLowerCase().replace(/\s+/g, '-')}">${p.status}</span>
        </td>
        <td>
          <small>${p.assignedVolunteerName ? `🤝 ${p.assignedVolunteerName}` : '— Unassigned —'}</small>
        </td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button type="button" class="btn-action-sm" onclick="window.jcfApp.viewPatientDetails('${p.id}')" title="View Details & AI Triage">
              👁️ View
            </button>
            <button type="button" class="btn-action-sm" onclick="window.jcfApp.openAdminActionModal('${p.id}')" title="Update Status & Assign Volunteer">
              ✏️ Action
            </button>
            <button type="button" class="btn-action-danger-sm" onclick="window.jcfApp.deletePatient('${p.id}')" title="Delete record">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  filterPatients(priority) {
    this.switchAdminTab('patients');
    const prioEl = document.getElementById('patient-priority-filter');
    if (prioEl) {
      prioEl.value = priority;
      this.renderAdminPatients();
    }
  }

  viewPatientDetails(id) {
    const patient = window.jcfStorage.getPatientById(id);
    if (!patient) return;

    const modal = document.getElementById('patient-detail-modal');
    const header = document.getElementById('modal-patient-header');
    const body = document.getElementById('modal-patient-body');

    if (modal && header && body) {
      header.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="req-id-tag">${patient.id}</span>
            <h3 style="font-size:1.35rem; margin-top:4px;">${patient.name} (${patient.age} Yrs, ${patient.gender})</h3>
            <span style="font-size:0.85rem; color:var(--text-muted);">📍 ${patient.city} • 📞 ${patient.phone}</span>
          </div>
          <span class="status-badge status-${patient.status.toLowerCase().replace(/\s+/g, '-')}">${patient.status}</span>
        </div>
      `;

      body.innerHTML = `
        <div class="patient-detail-grid">
          <div class="detail-box">
            <strong>Requested Aid & Department:</strong>
            <p>${patient.aidType} (${patient.department})</p>
          </div>
          <div class="detail-box">
            <strong>Priority Level:</strong>
            <p><span class="priority-pill priority-${patient.priority.toLowerCase()}">${patient.priority}</span> (Response: ${patient.estimatedReview})</p>
          </div>
          <div class="detail-box" style="grid-column:1/-1;">
            <strong>Medical Condition & Symptoms:</strong>
            <p style="margin-top:4px;">"${patient.details}"</p>
          </div>
          <div class="detail-box" style="grid-column:1/-1; background:rgba(14, 165, 168, 0.08); border:1px solid rgba(14, 165, 168, 0.25);">
            <strong>🤖 AI Clinical Triage Summary:</strong>
            <p style="margin-top:4px; font-weight:500;">${patient.aiSummary || 'Triage summary generated.'}</p>
          </div>
          <div class="detail-box" style="grid-column:1/-1;">
            <strong>Attached Prescription / Diagnostic Document:</strong>
            <div style="display:flex; align-items:center; gap:0.75rem; margin-top:6px; padding:0.5rem; background:#f8fafc; border-radius:var(--radius-sm);">
              <span>📄</span>
              <span style="font-weight:600;">${patient.documentName || 'Prescription_Document.pdf'}</span>
              <button type="button" class="btn-outline-sm" onclick="alert('Viewing prescription document attachment simulator for case ${patient.id}')">Preview Document</button>
            </div>
          </div>
          <div class="detail-box" style="grid-column:1/-1;">
            <strong>Assigned Coordinators:</strong>
            <p>Volunteer: ${patient.assignedVolunteerName || 'None'} • Doctor: ${patient.assignedDoctorName || 'None'}</p>
            ${patient.adminNotes ? `<p style="margin-top:4px;"><strong>Admin Review Note:</strong> "${patient.adminNotes}"</p>` : ''}
          </div>
        </div>

        <div style="margin-top:1.25rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn-primary" onclick="window.jcfApp.openAdminActionModal('${patient.id}'); document.getElementById('patient-detail-modal').classList.remove('active');">
            ✏️ Update Status & Assign
          </button>
        </div>
      `;

      modal.classList.add('active');
    }
  }

  openAdminActionModal(patientId) {
    const patient = window.jcfStorage.getPatientById(patientId);
    if (!patient) return;

    const modal = document.getElementById('admin-action-modal');
    if (!modal) return;

    document.getElementById('action-target-id').value = patient.id;
    document.getElementById('action-modal-sub').textContent = `Patient: ${patient.name} (${patient.id}) • Priority: ${patient.priority}`;
    document.getElementById('action-status-select').value = patient.status;
    document.getElementById('action-admin-note').value = patient.adminNotes || '';

    const volSelect = document.getElementById('action-volunteer-select');
    const volunteers = window.jcfStorage.getVolunteers();
    volSelect.innerHTML = `<option value="">-- Keep Current (${patient.assignedVolunteerName || 'Unassigned'}) --</option>` +
      volunteers.map(v => `<option value="${v.id}" ${patient.assignedVolunteerId === v.id ? 'selected' : ''}>${v.name} (${v.role}) - ${v.city}</option>`).join('');

    const docSelect = document.getElementById('action-doctor-select');
    const doctors = window.jcfStorage.getDoctors();
    docSelect.innerHTML = `<option value="">-- Keep Current (${patient.assignedDoctorName || 'Unassigned'}) --</option>` +
      doctors.map(d => `<option value="${d.id}" ${patient.assignedDoctorId === d.id ? 'selected' : ''}>${d.name} (${d.specialty})</option>`).join('');

    modal.classList.add('active');
  }

  handleAdminStatusSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('action-target-id').value;
    const newStatus = document.getElementById('action-status-select').value;
    const note = document.getElementById('action-admin-note').value.trim();
    const volId = document.getElementById('action-volunteer-select').value;
    const docId = document.getElementById('action-doctor-select').value;

    window.jcfStorage.updatePatientStatus(id, newStatus, note, volId || null, docId || null);

    document.getElementById('admin-action-modal').classList.remove('active');
    this.renderAdminPatients();
    this.renderAdminDashboard();
    this.showToast(`Case ${id} updated to ${newStatus}!`, 'success');
  }

  deletePatient(id) {
    if (confirm(`Are you sure you want to remove patient record ${id}?`)) {
      window.jcfStorage.deletePatientRequest(id);
      this.renderAdminPatients();
      this.renderAdminDashboard();
      this.showToast(`Patient record ${id} deleted.`, 'info');
    }
  }

  renderAdminVolunteers() {
    const tableBody = document.getElementById('volunteers-master-table-body');
    if (!tableBody) return;

    const volunteers = window.jcfStorage.getVolunteers();
    const query = document.getElementById('vol-table-search')?.value.toLowerCase().trim() || '';
    const roleFilter = document.getElementById('vol-role-filter')?.value || 'All';

    let filtered = volunteers.filter(v => {
      const matchQ = !query || v.name.toLowerCase().includes(query) || v.city.toLowerCase().includes(query) || v.role.toLowerCase().includes(query);
      const matchRole = roleFilter === 'All' || v.role.includes(roleFilter);
      return matchQ && matchRole;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No volunteers found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(v => `
      <tr>
        <td><strong>${v.id}</strong></td>
        <td>
          <div style="font-weight:600;">${v.name}</div>
          <small style="color:var(--text-muted);">${v.email}</small>
        </td>
        <td>
          <div>${v.role}</div>
          <small style="color:var(--text-muted);">${v.specialty || ''}</small>
        </td>
        <td>
          <div>${v.city}</div>
          <small style="color:var(--text-muted);">${v.phone}</small>
        </td>
        <td><small>${v.availability}</small></td>
        <td>
          <span class="status-badge ${v.status.includes('Verified') ? 'status-approved' : 'status-pending'}">${v.status}</span>
        </td>
        <td>
          <small><strong>${v.tasksAssigned?.length || 0}</strong> active cases</small>
        </td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            ${v.status !== 'Verified & Active' ? `
              <button type="button" class="btn-success-sm" onclick="window.jcfApp.toggleVolunteerVerify('${v.id}', 'Verified & Active')" title="Approve Volunteer">
                ✓ Verify
              </button>
            ` : `
              <button type="button" class="btn-action-sm" onclick="window.jcfApp.toggleVolunteerVerify('${v.id}', 'Pending Verification')" title="Revoke Verification">
                Revoke
              </button>
            `}
          </div>
        </td>
      </tr>
    `).join('');
  }

  toggleVolunteerVerify(id, status) {
    window.jcfStorage.updateVolunteerStatus(id, status);
    this.renderAdminVolunteers();
    this.renderAdminDashboard();
    this.showToast(`Volunteer status updated to ${status}`, 'success');
  }

  renderAdminDoctors() {
    const container = document.getElementById('admin-doctors-grid');
    if (!container) return;

    const doctors = window.jcfStorage.getDoctors();
    container.innerHTML = doctors.map(doc => `
      <div class="doctor-admin-card">
        <div class="doc-admin-header">
          <div class="doc-avatar">
            ${doc.image ? `<img src="${doc.image}" alt="${doc.name}" class="avatar-photo" />` : (doc.avatar || '👨‍⚕️')}
          </div>
          <div>
            <h4 style="font-size:1.1rem;">${doc.name}</h4>
            <span style="font-size:0.85rem; color:var(--primary); font-weight:600;">${doc.specialty}</span>
          </div>
        </div>
        <div style="margin:0.75rem 0; font-size:0.88rem; color:var(--text-muted);">
          <div>🎓 <strong>Qualifications:</strong> ${doc.qualifications}</div>
          <div>🏥 <strong>Affiliation:</strong> ${doc.hospitalAffiliation}</div>
          <div>⏰ <strong>Available OPD:</strong> ${doc.availableDays}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
          <span class="status-badge status-approved">🟢 Active Triage</span>
          <button type="button" class="btn-outline-sm" onclick="window.jcfApp.openAppointmentModal();">📅 Assign Consult</button>
        </div>
      </div>
    `).join('');
  }

  renderAdminAppointments() {
    const tableBody = document.getElementById('appointments-master-table-body');
    if (!tableBody) return;

    const appointments = window.jcfStorage.getAppointments();
    if (appointments.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">No appointments booked yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = appointments.map(a => `
      <tr>
        <td><strong>${a.id}</strong></td>
        <td>
          <div style="font-weight:600;">${a.patientName}</div>
          <small style="color:var(--text-muted);">${a.patientPhone}</small>
        </td>
        <td>${a.doctorName}</td>
        <td>
          <div>${a.department}</div>
          <small style="color:var(--text-muted);">${a.type}</small>
        </td>
        <td>
          <strong>${a.date}</strong><br>
          <small style="color:var(--text-muted);">${a.time}</small>
        </td>
        <td>
          <span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span>
        </td>
        <td>
          <small>${a.meetingLink ? `<a href="${a.meetingLink}" target="_blank" class="bot-link">Video Link</a>` : (a.location || 'In-Person')}</small>
        </td>
        <td>
          <div style="display:flex; gap:0.25rem;">
            ${a.status !== 'Confirmed' ? `
              <button type="button" class="btn-success-sm" onclick="window.jcfApp.updateAppointmentStatus('${a.id}', 'Confirmed')" title="Confirm">✓</button>
            ` : ''}
            ${a.status !== 'Completed' ? `
              <button type="button" class="btn-action-sm" onclick="window.jcfApp.openConsultationNotesModal('${a.id}')" title="Complete & Add Notes">Done</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  updateAppointmentStatus(id, status) {
    window.jcfStorage.updateAppointmentStatus(id, status);
    this.renderAdminAppointments();
    this.renderAdminDashboard();
    this.showToast(`Appointment ${id} marked as ${status}`, 'success');
  }

  renderAdminEnquiries() {
    const tableBody = document.getElementById('enquiries-master-table-body');
    if (!tableBody) return;

    const inquiries = window.jcfStorage.getInquiries();
    if (inquiries.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No messages in inbox.</td></tr>`;
      return;
    }

    tableBody.innerHTML = inquiries.map(i => `
      <tr>
        <td><strong>${i.id}</strong></td>
        <td><strong>${i.name}</strong></td>
        <td>
          <div>${i.email}</div>
          <small style="color:var(--text-muted);">${i.phone || ''}</small>
        </td>
        <td>
          <strong>${i.subject}</strong>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">"${i.message}"</p>
          ${i.replyNote ? `<small style="color:var(--primary);">Reply: "${i.replyNote}"</small>` : ''}
        </td>
        <td><small>${new Date(i.submittedAt).toLocaleDateString()}</small></td>
        <td>
          <span class="status-badge ${i.status === 'Unread' ? 'status-pending' : 'status-approved'}">${i.status}</span>
        </td>
        <td>
          <button type="button" class="btn-action-sm" onclick="window.jcfApp.replyToInquiry('${i.id}')">
            💬 Reply
          </button>
        </td>
      </tr>
    `).join('');
  }

  replyToInquiry(id) {
    const note = prompt('Enter reply / resolution note for this enquiry:');
    if (note !== null) {
      window.jcfStorage.updateInquiryStatus(id, 'Responded', note);
      this.renderAdminEnquiries();
      this.renderAdminDashboard();
      this.showToast(`Inquiry ${id} resolved with reply note!`, 'success');
    }
  }

  renderAdminFAQs() {
    const container = document.getElementById('admin-faqs-table-body');
    if (!container) return;

    const faqs = window.jcfStorage.getFAQs();
    container.innerHTML = faqs.map(f => `
      <div class="admin-faq-item">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge-pill-cyan">${f.category}</span>
          <div>
            <button type="button" class="btn-text-sm" onclick="window.jcfApp.editFAQ('${f.id}')">✏️ Edit</button>
            <button type="button" class="btn-text-danger-sm" onclick="window.jcfApp.deleteFAQ('${f.id}')">🗑️</button>
          </div>
        </div>
        <h4 style="font-size:1rem; margin:0.35rem 0;">${f.question}</h4>
        <p style="font-size:0.88rem; color:var(--text-muted);">${f.answer}</p>
      </div>
    `).join('');
  }

  handleAdminFaqSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('admin-faq-id').value;
    const category = document.getElementById('admin-faq-category').value;
    const question = document.getElementById('admin-faq-question').value.trim();
    const answer = document.getElementById('admin-faq-answer').value.trim();

    window.jcfStorage.saveFAQ({ id: id || undefined, category, question, answer });
    document.getElementById('admin-faq-form').reset();
    document.getElementById('admin-faq-id').value = '';
    document.getElementById('admin-faq-form-title').textContent = 'Add New FAQ';
    document.getElementById('admin-faq-cancel-btn').style.display = 'none';

    this.renderAdminFAQs();
    this.renderPublicFAQs();
    this.showToast('FAQ updated successfully!', 'success');
  }

  editFAQ(id) {
    const faqs = window.jcfStorage.getFAQs();
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    document.getElementById('admin-faq-id').value = faq.id;
    document.getElementById('admin-faq-category').value = faq.category;
    document.getElementById('admin-faq-question').value = faq.question;
    document.getElementById('admin-faq-answer').value = faq.answer;
    document.getElementById('admin-faq-form-title').textContent = 'Edit FAQ Entry';
    document.getElementById('admin-faq-cancel-btn').style.display = 'inline-block';
  }

  deleteFAQ(id) {
    if (confirm('Delete this FAQ entry?')) {
      window.jcfStorage.deleteFAQ(id);
      this.renderAdminFAQs();
      this.renderPublicFAQs();
      this.showToast('FAQ deleted', 'info');
    }
  }

  renderAdminAILogs() {
    const container = document.getElementById('admin-ai-logs-container');
    if (!container) return;

    const logs = window.jcfStorage.getAILogs();
    if (logs.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No chatbot queries logged yet.</p>`;
      return;
    }

    container.innerHTML = logs.map(l => `
      <div class="ai-log-card">
        <div style="display:flex; justify-content:space-between;">
          <span style="font-weight:600; font-size:0.9rem;">💬 "${l.query}"</span>
          <small style="color:var(--primary); font-weight:600;">[${l.topic}]</small>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">${l.responseSnippet}</p>
        <small style="font-size:0.75rem; color:var(--text-light);">${new Date(l.timestamp).toLocaleTimeString()}</small>
      </div>
    `).join('');
  }

  handleBroadcastSubmit(e) {
    e.preventDefault();
    const recipient = document.getElementById('broadcast-recipient').value;
    const title = document.getElementById('broadcast-title').value.trim();
    const message = document.getElementById('broadcast-message').value.trim();

    window.jcfStorage.addNotification({
      recipientRole: recipient,
      title,
      message,
      type: 'info'
    });

    document.getElementById('admin-broadcast-form').reset();
    this.renderAdminSentNotifs();
    this.updateNotificationBadge();
    this.showToast(`Broadcast "${title}" sent to ${recipient.toUpperCase()}!`, 'success');
  }

  renderAdminSentNotifs() {
    const container = document.getElementById('admin-notifs-history');
    if (!container) return;

    const notifs = window.jcfStorage.getNotifications();
    container.innerHTML = notifs.slice(0, 6).map(n => `
      <div class="admin-notif-row">
        <div>
          <strong>${n.title}</strong>
          <p style="font-size:0.85rem; color:var(--text-muted);">${n.message}</p>
          <small style="color:var(--primary);">Audience: ${n.recipientRole.toUpperCase()} • ${new Date(n.timestamp).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     PUBLIC PORTAL & FORM CONTROLLERS
     ========================================================================== */
  initAILiveTriagePreview() {
    const detailsInput = document.getElementById('patient-details');
    const previewText = document.getElementById('ai-preview-text');

    if (detailsInput && previewText) {
      let debounceTimer = null;
      detailsInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const val = detailsInput.value.trim();
          if (val.length > 8) {
            const summary = window.jcfBot?.generateAISummary({
              age: document.getElementById('patient-age')?.value || 40,
              gender: document.getElementById('patient-gender')?.value || 'Patient',
              city: document.getElementById('patient-city')?.value || 'City',
              department: document.getElementById('patient-department')?.value || 'General',
              aidType: document.getElementById('patient-aid-type')?.value || 'Aid',
              priority: document.getElementById('patient-priority')?.value || 'Normal',
              details: val
            });
            previewText.textContent = summary;
          } else {
            previewText.textContent = 'Type your medical condition above to see an instant clinical triage summary for our doctors...';
          }
        }, 300);
      });
    }
  }

  handlePatientSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const name = form['patient_name']?.value.trim();
    const age = form['patient_age']?.value.trim();
    const gender = form['patient_gender']?.value;
    const phone = form['patient_phone']?.value.trim();
    const city = form['patient_city']?.value.trim();
    const department = form['patient_department']?.value;
    const aidType = form['patient_aid_type']?.value;
    const priority = form['patient_priority']?.value;
    const details = form['patient_details']?.value.trim();
    const documentName = form['patient_doc']?.files[0]?.name || 'Medical_Prescription.pdf';

    if (!name || !age || !gender || !phone || !city || !department || !aidType || !priority || !details) {
      this.showToast('Please fill out all required fields.', 'warning');
      return;
    }

    const aiSummary = window.jcfBot?.generateAISummary({ age, gender, city, department, aidType, priority, details });

    const patientData = {
      name,
      age: parseInt(age, 10),
      gender,
      phone,
      city,
      department,
      aidType,
      priority,
      details,
      aiSummary,
      documentName
    };

    const savedRecord = window.jcfStorage.savePatientRequest(patientData);
    form.reset();
    document.getElementById('patient-doc-label').textContent = 'Click or drag prescription / ID proof here';

    this.showConfirmationModal({
      title: 'Patient Aid Request Confirmed!',
      subtitle: 'Our Medical Review Board has received your healthcare assistance application.',
      id: savedRecord.id,
      badgeText: `${savedRecord.priority} Priority`,
      badgeClass: savedRecord.priority === 'Emergency' ? 'badge-emergency' : 'badge-urgent',
      fields: [
        { label: 'Patient Name', value: savedRecord.name },
        { label: 'Age / Gender', value: `${savedRecord.age} Yrs / ${savedRecord.gender}` },
        { label: 'City & Contact', value: `${savedRecord.city} (${savedRecord.phone})` },
        { label: 'Requested Aid', value: savedRecord.aidType },
        { label: 'Department', value: savedRecord.department },
        { label: 'AI Triage Summary', value: savedRecord.aiSummary },
        { label: 'Status', value: `🟢 ${savedRecord.status}` },
        { label: 'Expected Review', value: savedRecord.estimatedReview }
      ],
      note: 'A dedicated JCF medical coordinator will call the registered phone number shortly to verify doctor prescriptions and coordinate aid delivery.'
    });

    this.showToast(`Request ${savedRecord.id} submitted successfully!`, 'success');
  }

  handleVolunteerSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const name = form['vol_name']?.value.trim();
    const email = form['vol_email']?.value.trim();
    const phone = form['vol_phone']?.value.trim();
    const city = form['vol_city']?.value.trim();
    const role = form['vol_role']?.value;
    const availability = form['vol_availability']?.value;
    const experience = form['vol_experience']?.value.trim();

    if (!name || !email || !phone || !city || !role || !availability) {
      this.showToast('Please fill out all mandatory fields.', 'warning');
      return;
    }

    const volData = {
      name,
      email,
      phone,
      city,
      role,
      availability,
      experience: experience || 'Committed to humanitarian medical aid.'
    };

    const savedVol = window.jcfStorage.saveVolunteerRegistration(volData);
    form.reset();

    this.showConfirmationModal({
      title: 'Welcome to JCF Volunteer Heroes!',
      subtitle: 'Your registration has been logged and your digital volunteer badge is generated.',
      id: savedVol.id,
      badgeText: 'Volunteer Hero',
      badgeClass: 'badge-volunteer',
      fields: [
        { label: 'Volunteer Name', value: savedVol.name },
        { label: 'Designated Role', value: savedVol.role },
        { label: 'Availability', value: savedVol.availability },
        { label: 'Location', value: savedVol.city },
        { label: 'Contact', value: `${savedVol.phone} | ${savedVol.email}` },
        { label: 'Status', value: `🔵 ${savedVol.status}` }
      ],
      note: 'Thank you for stepping forward! Our Volunteer Outreach Team will connect with you for orientation and team allocation.'
    });

    this.showToast(`Volunteer ID ${savedVol.id} created!`, 'success');
  }

  handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const name = form['contact_name']?.value.trim();
    const email = form['contact_email']?.value.trim();
    const phone = form['contact_phone']?.value.trim();
    const subject = form['contact_subject']?.value.trim();
    const message = form['contact_message']?.value.trim();

    const inq = window.jcfStorage.saveContactInquiry({ name, email, phone, subject, message });
    form.reset();

    this.showToast(`Thank you ${name}! Inquiry [${inq.id}] sent to our coordination desk.`, 'success');
  }

  openAppointmentModal(doctorId = '') {
    const modal = document.getElementById('appointment-modal');
    if (!modal) return;

    const dateInput = document.getElementById('apt-date');
    if (dateInput && !dateInput.value) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    if (doctorId) {
      const docSelect = document.getElementById('appointment-doctor');
      if (docSelect) docSelect.value = doctorId;
      const doc = window.jcfStorage?.getDoctorById(doctorId);
      if (doc) {
        const deptSelect = document.getElementById('apt-dept-select');
        if (deptSelect) {
          for (let opt of deptSelect.options) {
            if (doc.specialty.toLowerCase().includes(opt.value.toLowerCase())) {
              deptSelect.value = opt.value;
              break;
            }
          }
        }
      }
    }

    modal.classList.add('active');
  }

  handleAppointmentSubmit(e) {
    e.preventDefault();
    const patientName = document.getElementById('apt-patient-name').value.trim();
    const patientPhone = document.getElementById('apt-patient-phone').value.trim();
    const department = document.getElementById('apt-dept-select').value;
    const type = document.getElementById('apt-type-select').value;
    const date = document.getElementById('apt-date').value;
    const time = document.getElementById('apt-time').value;
    const symptoms = document.getElementById('apt-symptoms').value.trim();

    // Match preferred doctor if chosen, or auto-match by department
    const doctors = window.jcfStorage.getDoctors();
    const selectedDocId = document.getElementById('appointment-doctor')?.value;
    let matchedDoc = null;
    if (selectedDocId) {
      matchedDoc = doctors.find(d => d.id === selectedDocId);
    }
    if (!matchedDoc) {
      matchedDoc = doctors.find(d => d.specialty.toLowerCase().includes(department.toLowerCase())) || doctors[0];
    }

    const newApt = window.jcfStorage.saveAppointment({
      patientName,
      patientPhone,
      doctorName: matchedDoc.name,
      doctorId: matchedDoc.id,
      department,
      type,
      date,
      time,
      symptoms,
      meetingLink: type.includes('Video') ? `https://meet.jcfhealthcare.org/consult-${Math.floor(1000 + Math.random()*9000)}` : null,
      location: type.includes('Video') ? 'Online Secure JCF Tele-Room' : 'JCF Central Care Clinic'
    });

    document.getElementById('appointment-booking-form').reset();
    document.getElementById('appointment-modal').classList.remove('active');

    this.showConfirmationModal({
      title: 'Doctor Appointment Scheduled!',
      subtitle: 'Your consultation request has been confirmed with our medical panel.',
      id: newApt.id,
      badgeText: 'Consultation Scheduled',
      badgeClass: 'badge-urgent',
      fields: [
        { label: 'Patient Name', value: newApt.patientName },
        { label: 'Assigned Doctor', value: newApt.doctorName },
        { label: 'Department', value: newApt.department },
        { label: 'Date & Time', value: `${newApt.date} at ${newApt.time}` },
        { label: 'Consultation Mode', value: newApt.type },
        { label: 'Location / Link', value: newApt.meetingLink || newApt.location }
      ],
      note: 'Please be ready 5 minutes prior to your scheduled time slot. Telephonic / video links will be sent via SMS.'
    });

    this.showToast(`Appointment ${newApt.id} confirmed with ${newApt.doctorName}!`, 'success');
  }

  /* ==========================================================================
     PUBLIC DIRECTORY & FAQs
     ========================================================================== */
  initPublicDoctors() {
    const container = document.getElementById('public-doctors-grid');
    if (!container) return;

    const doctors = window.jcfStorage.getDoctors();
    container.innerHTML = doctors.map(doc => `
      <div class="doctor-card">
        <div class="doctor-avatar-circle">
          ${doc.image ? `<img src="${doc.image}" alt="${doc.name}" class="doctor-avatar-img" />` : (doc.avatar || '👨‍⚕️')}
        </div>
        <h4 class="doctor-name">${doc.name}</h4>
        <div class="doctor-spec">${doc.specialty}</div>
        <div class="doctor-affil">${doc.qualifications}</div>
        <div class="doctor-card-footer">
          <span class="doctor-opd-pill">${doc.status || '🟢 Available for OPD'}</span>
          <button type="button" class="btn-primary-sm" onclick="window.jcfApp.openAppointmentModal('${doc.id}');">📅 Consult</button>
        </div>
      </div>
    `).join('');
  }

  initPublicFAQs() {
    this.renderPublicFAQs('All', '');
  }

  renderPublicFAQs(category = 'All', filterSearch = '') {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    const faqs = window.jcfStorage.getFAQs();
    const query = (filterSearch || '').toLowerCase().trim();

    let filtered = faqs.filter(f => {
      const matchCat = category === 'All' || f.category === category;
      const matchQ = !query || f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query);
      return matchCat && matchQ;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="tracker-empty">
          <p>No questions found matching your search. Feel free to ask CareBot!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((f, idx) => `
      <div class="faq-accordion-item ${idx === 0 ? 'open' : ''}">
        <button type="button" class="faq-accordion-trigger" onclick="this.parentElement.classList.toggle('open')">
          <span>${f.question}</span>
          <span class="faq-accordion-arrow">▾</span>
        </button>
        <div class="faq-accordion-content">
          <p>${f.answer}</p>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     APPLICATION TRACKER MODAL
     ========================================================================== */
  openTrackerModal() {
    const modal = document.getElementById('tracker-modal');
    if (!modal) return;
    this.renderTrackerList('');
    modal.classList.add('active');
  }

  renderTrackerList(filterSearch = '') {
    const container = document.getElementById('tracker-results-container');
    if (!container) return;

    const patients = window.jcfStorage.getPatientRequests();
    const volunteers = window.jcfStorage.getVolunteers();
    const appointments = window.jcfStorage.getAppointments();

    let combined = [
      ...patients.map(p => ({ ...p, entityType: 'Patient Aid Request' })),
      ...volunteers.map(v => ({ ...v, entityType: 'Volunteer Hero' })),
      ...appointments.map(a => ({ ...a, id: a.id, name: a.patientName, city: a.doctorName, entityType: 'Doctor Appointment', details: a.symptoms }))
    ];

    if (filterSearch) {
      const q = filterSearch.toLowerCase().trim();
      combined = combined.filter(item => 
        item.id.toLowerCase().includes(q) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.aidType && item.aidType.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.city && item.city.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q))
      );
    }

    if (combined.length === 0) {
      container.innerHTML = `
        <div class="tracker-empty">
          <div class="empty-icon">📂</div>
          <h4>No Applications Found</h4>
          <p>No records match your search. Submit a request to track it in real time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = combined.map(item => {
      const isPatient = item.entityType === 'Patient Aid Request';
      const dateStr = new Date(item.submittedAt || item.joinedAt || item.createdDate || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `
        <div class="tracker-card ${isPatient ? 'tracker-patient' : 'tracker-volunteer'}">
          <div class="tracker-card-header">
            <div>
              <span class="tracker-type-pill ${isPatient ? 'pill-patient' : 'pill-vol'}">${item.entityType}</span>
              <h4 class="tracker-card-title">${item.name}</h4>
              <span class="tracker-card-id">${item.id}</span>
            </div>
            <div class="tracker-status-tag">
              ${item.status}
            </div>
          </div>
          <div class="tracker-card-body">
            <div class="tracker-meta-grid">
              <div><strong>Key Info:</strong> ${item.aidType || item.role || item.department}</div>
              <div><strong>City/Doctor:</strong> ${item.city || item.doctorName}</div>
              <div><strong>Submitted:</strong> ${dateStr}</div>
              ${item.priority ? `<div><strong>Priority:</strong> <span class="priority-${item.priority.toLowerCase()}">${item.priority}</span></div>` : ''}
            </div>
            ${item.details ? `<p class="tracker-desc">"${item.details}"</p>` : ''}
            ${item.aiSummary ? `<p style="font-size:0.85rem; color:var(--primary); margin-top:4px;">🤖 <strong>AI Triage:</strong> ${item.aiSummary}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     UI HELPERS & NOTIFICATIONS
     ========================================================================== */
  showConfirmationModal(config) {
    const modal = document.getElementById('confirmation-modal');
    if (!modal) return;

    document.getElementById('conf-title').textContent = config.title;
    document.getElementById('conf-subtitle').textContent = config.subtitle;
    document.getElementById('conf-id').textContent = config.id;

    const badge = document.getElementById('conf-badge');
    if (badge) {
      badge.textContent = config.badgeText;
      badge.className = `status-badge ${config.badgeClass || ''}`;
    }

    const listContainer = document.getElementById('conf-details-list');
    if (listContainer) {
      listContainer.innerHTML = config.fields.map(f => `
        <div class="conf-item">
          <span class="conf-label">${f.label}:</span>
          <span class="conf-value">${f.value}</span>
        </div>
      `).join('');
    }

    const noteEl = document.getElementById('conf-note');
    if (noteEl) noteEl.textContent = config.note || '';

    modal.classList.add('active');
  }

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  updateNotificationBadge() {
    const notifs = window.jcfStorage.getNotifications();
    const unread = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge-count');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'inline-block' : 'none';
    }
  }

  renderNavNotifications() {
    const listBody = document.getElementById('nav-notif-list');
    if (!listBody) return;

    const notifs = window.jcfStorage.getNotifications();
    if (notifs.length === 0) {
      listBody.innerHTML = `<p style="padding:1rem; color:var(--text-muted); font-size:0.85rem;">No new notifications.</p>`;
      return;
    }

    listBody.innerHTML = notifs.slice(0, 5).map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <strong>${n.title}</strong>
        <p>${n.message}</p>
        <small>${new Date(n.timestamp).toLocaleDateString()}</small>
      </div>
    `).join('');
  }

  navigateToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  initHeroSearch() {
    const heroFinderForm = document.getElementById('hero-finder-form');
    if (heroFinderForm) {
      heroFinderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dept = document.getElementById('hero-dept-select')?.value;
        const aid = document.getElementById('hero-aid-select')?.value;
        const urgency = document.getElementById('hero-urgency-select')?.value;

        this.navigateToSection('patient-form');

        setTimeout(() => {
          if (dept) document.getElementById('patient-department').value = dept;
          if (aid) document.getElementById('patient-aid-type').value = aid;
          if (urgency) document.getElementById('patient-priority').value = urgency;
          this.showToast('Aid parameters pre-filled in Patient Form!', 'info');
        }, 500);
      });
    }
  }

  initCounters() {
    const counterElements = document.querySelectorAll('.counter-val');
    let animated = false;

    const runCounters = () => {
      if (animated) return;
      const triggerSection = document.getElementById('impact');
      if (!triggerSection) return;

      const rect = triggerSection.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.85) {
        animated = true;
        counterElements.forEach(counter => {
          const target = parseInt(counter.dataset.target, 10);
          const duration = 2000;
          const step = Math.ceil(target / (duration / 25));
          let current = 0;

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              counter.textContent = target.toLocaleString('en-IN') + '+';
              clearInterval(timer);
            } else {
              counter.textContent = current.toLocaleString('en-IN') + '+';
            }
          }, 25);
        });
      }
    };

    window.addEventListener('scroll', runCounters);
    runCounters();
  }

  initLiveClock() {
    const clockEl = document.getElementById('admin-live-clock');
    if (clockEl) {
      const updateTime = () => {
        clockEl.textContent = new Date().toLocaleTimeString('en-IN');
      };
      setInterval(updateTime, 1000);
      updateTime();
    }
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.jcfApp = new JCFApplication();
});
