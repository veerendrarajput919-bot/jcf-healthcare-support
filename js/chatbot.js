/**
 * JCF Healthcare Support - Interactive AI-Style FAQ Chatbot (CareBot) & Clinical Triage Engine
 */

class JCFCareBot {
  constructor() {
    this.isOpen = false;
    this.isMuted = false;
    this.messages = [];
    this.initAudio();
    this.initDOM();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playBeep(type = 'receive') {
    if (this.isMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'receive') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.18);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
      }
    } catch (e) {}
  }

  // AI Clinical Triage & Support Request Summarizer
  generateAISummary(patientData) {
    const age = patientData.age || 'Unknown';
    const gender = patientData.gender || 'Patient';
    const city = patientData.city || 'India';
    const dept = patientData.department || 'General Care';
    const aidType = patientData.aidType || 'Medical Assistance';
    const priority = patientData.priority || 'Normal';
    const details = patientData.details || '';

    // Smart key symptom extractor
    let keyKeywords = [];
    const lowerDetails = details.toLowerCase();
    if (lowerDetails.includes('heart') || lowerDetails.includes('cardio') || lowerDetails.includes('chest') || lowerDetails.includes('bp')) keyKeywords.push('Cardiac Condition');
    if (lowerDetails.includes('diabetes') || lowerDetails.includes('sugar') || lowerDetails.includes('insulin')) keyKeywords.push('Diabetes/Metabolic');
    if (lowerDetails.includes('hernia') || lowerDetails.includes('surgery') || lowerDetails.includes('operation')) keyKeywords.push('Surgical Intervention');
    if (lowerDetails.includes('cancer') || lowerDetails.includes('chemo') || lowerDetails.includes('tumor')) keyKeywords.push('Oncology Care');
    if (lowerDetails.includes('child') || lowerDetails.includes('pediatric') || lowerDetails.includes('baby')) keyKeywords.push('Pediatric Need');
    if (lowerDetails.includes('refill') || lowerDetails.includes('monthly') || lowerDetails.includes('supply')) keyKeywords.push('Chronic Rx Refill');

    const keyFocus = keyKeywords.length > 0 ? keyKeywords.join(', ') : aidType;
    const urgencyLabel = priority.toUpperCase();

    return `${age}yo ${gender}, ${city} | ${dept}: ${keyFocus} required. Urgency Level: [${urgencyLabel}]. Socio-economic triage queued for volunteer verification.`;
  }

  getKnowledgeBase() {
    const dynamicFaqs = window.jcfStorage?.getFAQs() || [];
    const baseKnowledge = [
      {
        id: 'emergency',
        keywords: ['emergency', 'urgent', 'ambulance', 'critical', 'immediate', 'serious', 'accident', 'ventilator', 'oxygen', 'heart attack', 'dard', 'emergency number', 'khatra', 'severe bleeding'],
        response: `🚨 **Immediate Emergency Support:**
If a patient is in acute medical distress, please contact our 24/7 Rapid Emergency Cell right away:
- 📞 **Helpline:** <a href="tel:+9118002008899" class="bot-link">+91 1800 200 8899 (Toll Free)</a>
- 🚑 **Ambulance Dispatch:** Active in Delhi-NCR, Mumbai, and Lucknow.
- Or fill out our **Emergency Patient Form** marking Priority as **"Emergency"** for priority triage within 2 hours.

⚠️ *Medical Disclaimer: CareBot is an informational guide and cannot replace emergency hospital resuscitation.*`,
        actions: [
          { text: '📝 Open Emergency Patient Form', action: 'open_patient_form', param: 'Emergency' },
          { text: '📞 Call 24/7 Hotline', action: 'call_hotline' }
        ]
      },
      {
        id: 'medicines',
        keywords: ['medicine', 'medicines', 'dawa', 'dawakhana', 'prescription', 'free medicine', 'pharmacy', 'insulin', 'chemo medicine', 'tablets', 'chronic', 'refill'],
        response: `💊 **Free Lifesaving Medicine Bank:**
JCF provides 100% free prescription medicines for chronic ailments (Cardiac, Diabetes, Kidney, Pediatric, and Oncology):
- **Eligibility:** Valid government ID + Doctor prescription from any recognized hospital.
- **Delivery:** Doorstep delivery by verified volunteers or pickup at partner pharmacy points.
- **Duration:** 1 to 6-month refill grants based on medical review.`,
        actions: [
          { text: '💊 Request Free Medicines', action: 'open_patient_form', param: 'Free Prescription Medicines' },
          { text: '📋 View Required Documents', action: 'send_query', param: 'What documents are required for medicine support?' }
        ]
      },
      {
        id: 'surgery_grant',
        keywords: ['surgery', 'operation', 'financial aid', 'hospital bill', 'grant', 'paisa', 'fund', 'kharcha', 'treatment cost', 'money', 'cardiac surgery', 'cancer treatment', 'hernia'],
        response: `❤️ **Financial Medical Grants & Surgeries:**
We partner with accredited tertiary hospitals to subsidize and fund critical surgeries:
- Pediatric heart surgeries (Congenital Heart Defect)
- Pediatric congenital anomalies & hernia repairs
- Dialysis support & Cancer chemotherapy aid
- Grants range from ₹10,000 up to ₹2,50,000 paid directly to the hospital billing desk.`,
        actions: [
          { text: '📄 Apply for Surgery Grant', action: 'open_patient_form', param: 'Surgery Financial Aid' },
          { text: '🩺 Book Doctor Tele-Consultation', action: 'open_appointment_modal' }
        ]
      },
      {
        id: 'appointments',
        keywords: ['appointment', 'doctor consult', 'consultation', 'doctor', 'dr', 'opd', 'tele-health', 'video call', 'teleconsultation', 'checkup', 'milna'],
        response: `🩺 **Doctor Consultations & Appointments:**
JCF connects underprivileged patients with honorary specialist doctors for free tele-consultations and OPD camps:
- **Cardiology, Pediatrics, Oncology, Community Health, Diagnostics.**
- Consultations available via secure video link, phone call, or in-person camp.`,
        actions: [
          { text: '📅 Book Free Doctor Appointment', action: 'open_appointment_modal' },
          { text: '👨‍⚕️ View Doctor Directory', action: 'view_doctors' }
        ]
      },
      {
        id: 'volunteer',
        keywords: ['volunteer', 'join', 'help', 'seva', 'doctor volunteer', 'nurse', 'field worker', 'blood donor', 'internship', 'participate', 'kaise juden', 'volunteer banna'],
        response: `🤝 **Join JCF Healthcare as a Volunteer Hero:**
We welcome medical professionals, paramedics, students, and citizens:
- 🩺 **Doctors & Specialists:** Tele-consultations or weekly OPD camps.
- 💉 **Nurses & Paramedics:** Community triage & health checkup drives.
- 🩸 **Blood & Platelet Donors:** Emergency lifesaving network.
- 🎒 **Community Coordinators:** Camp logistics & medicine delivery.
Volunteer digital badges and official certification are awarded to all active contributors!`,
        actions: [
          { text: '✍️ Register as a Volunteer', action: 'open_volunteer_form' },
          { text: '🩸 Blood Donor Registration', action: 'open_volunteer_form', param: 'Blood / Platelet Donor' }
        ]
      },
      {
        id: 'tracking',
        keywords: ['status', 'track', 'application status', 'reference id', 'kya hua', 'check form', 'jcf-pat', 'jcf-vol', 'jcf-apt', 'kab milega', 'tracker'],
        response: `🔍 **Track Your Application / Request Status:**
You can track the live progress of your Patient Support, Volunteer, or Doctor Appointment submission:
1. Locate your Reference ID (e.g. \`JCF-PAT-7814\` or \`JCF-APT-301\`).
2. Click the **"Live Status Tracker"** button below or at the top header to view real-time stage updates.`,
        actions: [
          { text: '🔍 Open Application Tracker', action: 'open_tracker_modal' }
        ]
      },
      {
        id: 'documents',
        keywords: ['documents', 'document', 'kagaz', 'proof', 'aadhaar', 'eligibility', 'requirements', 'apply kaise kare', 'criteria', 'ration card'],
        response: `📑 **Required Documents for Healthcare Aid:**
To help our medical board verify requests quickly:
1. **Patient ID:** Aadhaar Card, Voter ID, or BPL Ration Card.
2. **Medical Proof:** Recent Doctor Prescription / Hospital Case Summary / Diagnostic Reports (within 6 months).
3. **Hospital Bill Estimate:** For surgery grants, an official hospital estimate certificate.`,
        actions: [
          { text: '📝 Submit Aid Application Now', action: 'open_patient_form' }
        ]
      },
      {
        id: 'contact_ngo',
        keywords: ['contact', 'phone', 'email', 'address', 'location', 'office', 'helpline', 'whatsapp', 'number', 'kahan hai', 'headquarters', 'contact support'],
        response: `🏢 **JCF Healthcare Support Head Office & Helplines:**
- 📍 **Address:** JCF Seva Bhavan, Institutional Area, New Delhi - 110025
- 📞 **General Toll-Free:** +91 1800 200 8899
- 💬 **WhatsApp Support Desk:** +91 98765 00011
- ✉️ **Email:** care@jcfhealthcare.org
- ⏰ **Office Timings:** Mon - Sat, 8:30 AM to 7:00 PM (Emergency response 24/7).`,
        actions: [
          { text: '✉️ Send Message to NGO', action: 'scroll_to_contact' }
        ]
      },
      {
        id: 'services_overview',
        keywords: ['services', 'what services', 'kya seva', 'facilities', 'features', 'offer', 'what do you do'],
        response: `🏥 **Healthcare Services Provided by JCF:**
1. **Free Lifesaving Medicines:** Monthly chronic ailment prescriptions delivered directly to beneficiaries.
2. **Specialist Consultations:** Free tele-health appointments in Cardiology, Pediatrics, Oncology, and General OPD.
3. **Emergency Ambulance Dispatch:** 24/7 rapid transit in Delhi-NCR, Mumbai, and Lucknow.
4. **Diagnostic & Surgery Aid:** Subsidized or 100% sponsored tertiary hospital surgeries & lab tests.
5. **Volunteer & Blood Network:** Rare blood donor matching and community health screening camps.`,
        actions: [
          { text: '🩺 Book Free Appointment', action: 'open_appointment_modal' },
          { text: '💊 Apply for Medicine Aid', action: 'open_patient_form' }
        ]
      },
      {
        id: 'register_login',
        keywords: ['register', 'registration', 'login', 'signup', 'sign in', 'account', 'how can i register', 'portal'],
        response: `🔐 **Portals & Registration Access:**
You can register or log in directly to our dedicated panels:
- 👤 **Patient Portal:** Book visits, view prescription vouchers & lab reports.
- 👨‍⚕️ **Doctor Portal:** Manage consultations, triage patients & issue e-prescriptions.
- 🤝 **Volunteer Portal:** Accept community missions & log service hours.
- 👨‍💼 **Admin Portal:** Central governance, grant approvals & system metrics.`,
        actions: [
          { text: '🔑 Open Portal Login', action: 'send_query', param: 'Where is login page?' },
          { text: '📝 Register as Volunteer', action: 'open_volunteer_form' }
        ]
      },
      {
        id: 'programs_overview',
        keywords: ['programs', 'healthcare programs', 'initiatives', 'camps', 'yojana', 'schemes', 'where can i find healthcare programs'],
        response: `🌟 **Our Flagship Healthcare Programs:**
- 🚑 **Prana Vayu 24/7 Ambulance Network** (Rapid Response)
- 💊 **Sanjeevani Free Pharmacy Bank** (Chronic Ailment Rx Grants)
- ❤️ **Hriday Deep Surgical Sponsorship** (Pediatric Heart Surgeries)
- 🔬 **Nidan Swasthya Mobile Diagnostics** (Rural Lab Tests & ECG)
- 🩸 **Raktdaan Jeevan Raksha** (Emergency Rare Blood Donor Bank)`,
        actions: [
          { text: '🔍 View Programs Section', action: 'scroll_to_programs' },
          { text: '📝 Apply for Aid Now', action: 'open_patient_form' }
        ]
      }
    ];

    // Merge dynamically added FAQs from storage
    dynamicFaqs.forEach(faq => {
      baseKnowledge.push({
        id: faq.id,
        keywords: faq.question.toLowerCase().split(' ').filter(w => w.length > 3),
        response: `**${faq.question}**\n\n${faq.answer}`,
        actions: [
          { text: '📝 Apply for Aid', action: 'open_patient_form' },
          { text: '🤝 Volunteer Hero', action: 'open_volunteer_form' }
        ]
      });
    });

    return baseKnowledge;
  }

  initDOM() {
    this.messages = [
      {
        sender: 'bot',
        text: `👋 **Welcome to JCF Healthcare Support!** \nI am **CareBot**, your AI healthcare assistant. How can I help you today?
- 💊 Request **Free Medicines** or **Surgery Grants**
- 🩺 Book a **Free Doctor Tele-Consultation**
- 🤝 Register as a **Volunteer Hero**
- 🔍 Track your existing **Application Status**

⚠️ *Notice: CareBot provides informational aid and coordination guidance. In medical emergencies, please dial our toll-free hotline.*`,
        time: this.getCurrentTime(),
        actions: [
          { text: '🩺 Book Appointment', action: 'open_appointment_modal' },
          { text: '🏥 What services do you provide?', action: 'send_query', param: 'What services do you provide?' },
          { text: '🔑 How can I register?', action: 'send_query', param: 'How can I register?' },
          { text: '🌟 Healthcare Programs', action: 'send_query', param: 'Where can I find healthcare programs?' },
          { text: '📑 Documents Required', action: 'send_query', param: 'What documents are required?' },
          { text: '🤝 How to Volunteer?', action: 'open_volunteer_form' },
          { text: '🔍 Track Application', action: 'open_tracker_modal' }
        ]
      }
    ];
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  renderChatWindow() {
    const chatContainer = document.getElementById('carebot-messages');
    if (!chatContainer) return;

    chatContainer.innerHTML = '';
    this.messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${msg.sender === 'user' ? 'msg-user' : 'msg-bot'}`;

      let formattedText = msg.text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>')
        .replace(/`([^`]+)`/g, '<code class="bot-code">$1</code>');

      let actionsHtml = '';
      if (msg.actions && msg.actions.length > 0) {
        actionsHtml = `
          <div class="bot-action-chips">
            ${msg.actions.map(a => `
              <button type="button" class="action-chip" data-action="${a.action}" data-param="${a.param || ''}">
                ${a.text}
              </button>
            `).join('')}
          </div>
        `;
      }

      msgDiv.innerHTML = `
        <div class="msg-avatar">
          ${msg.sender === 'user' ? '👤' : '🤖'}
        </div>
        <div class="msg-bubble-wrapper">
          <div class="msg-bubble">
            ${formattedText}
            ${actionsHtml}
          </div>
          <span class="msg-time">${msg.time}</span>
        </div>
      `;

      chatContainer.appendChild(msgDiv);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Attach click listeners to action chips
    const chips = chatContainer.querySelectorAll('.action-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const action = chip.dataset.action;
        const param = chip.dataset.param;
        this.handleActionClick(action, param);
      });
    });
  }

  handleActionClick(action, param) {
    if (action === 'send_query') {
      this.handleUserMessage(param);
    } else if (action === 'open_patient_form') {
      window.jcfApp?.navigateToSection('patient-form');
      if (param) {
        const aidSelect = document.getElementById('patient-aid-type');
        if (aidSelect) aidSelect.value = param;
        if (param === 'Emergency') {
          const prioritySelect = document.getElementById('patient-priority');
          if (prioritySelect) prioritySelect.value = 'Emergency';
        }
      }
      this.toggleChat(false);
    } else if (action === 'open_volunteer_form') {
      window.jcfApp?.navigateToSection('volunteer-form');
      if (param) {
        const roleSelect = document.getElementById('vol-role');
        if (roleSelect) roleSelect.value = param;
      }
      this.toggleChat(false);
    } else if (action === 'open_appointment_modal') {
      window.jcfApp?.openAppointmentModal();
      this.toggleChat(false);
    } else if (action === 'open_tracker_modal') {
      window.jcfApp?.openTrackerModal();
      this.toggleChat(false);
    } else if (action === 'view_doctors') {
      window.jcfApp?.navigateToSection('about');
      this.toggleChat(false);
    } else if (action === 'scroll_to_contact') {
      window.jcfApp?.navigateToSection('contact');
      this.toggleChat(false);
    } else if (action === 'call_hotline') {
      window.location.href = 'tel:+9118002008899';
    }
  }

  handleUserMessage(rawText) {
    const text = (rawText || '').trim();
    if (!text) return;

    this.messages.push({
      sender: 'user',
      text: text,
      time: this.getCurrentTime()
    });
    this.playBeep('send');
    this.renderChatWindow();

    this.showTypingIndicator(true);

    const typingDelay = Math.min(1000, Math.max(400, text.length * 15));
    setTimeout(() => {
      this.showTypingIndicator(false);
      const botReply = this.matchQuery(text);

      // Log AI Query for admin oversight
      window.jcfStorage?.logAIQuery(text, botReply.id || 'General', botReply.response);

      this.messages.push({
        sender: 'bot',
        text: botReply.response,
        time: this.getCurrentTime(),
        actions: botReply.actions || []
      });
      this.playBeep('receive');
      this.renderChatWindow();
    }, typingDelay);
  }

  showTypingIndicator(show) {
    const indicator = document.getElementById('carebot-typing-indicator');
    if (indicator) {
      indicator.style.display = show ? 'flex' : 'none';
      if (show) {
        const chatContainer = document.getElementById('carebot-messages');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }

  matchQuery(query) {
    const q = query.toLowerCase().trim();

    // Check specific reference ID search (JCF-PAT, JCF-VOL, JCF-APT, JCF-INQ)
    if (q.startsWith('jcf-pat') || q.startsWith('jcf-vol') || q.startsWith('jcf-apt') || q.startsWith('jcf-inq')) {
      const recordResult = window.jcfStorage?.findRecordById(q);
      if (recordResult) {
        const rec = recordResult.record;
        const dateVal = rec.submittedAt || rec.joinedAt || rec.createdDate || rec.date;
        let dateStr = 'Recent';
        try {
          if (dateVal) {
            const parsed = new Date(dateVal);
            if (!isNaN(parsed.getTime())) dateStr = parsed.toLocaleDateString();
            else dateStr = String(dateVal);
          }
        } catch (e) {
          dateStr = 'Recent';
        }

        return {
          id: 'status_lookup',
          response: `✅ **Record Found:** \`${rec.id}\` (${recordResult.type})
- **Name:** ${rec.name || rec.patientName}
- **Status:** 🟢 **${rec.status}**
- **Date Registered:** ${dateStr}
${rec.assignedVolunteerName ? `- **Assigned Volunteer:** ${rec.assignedVolunteerName}` : ''}
${rec.assignedDoctorName ? `- **Assigned Doctor:** ${rec.assignedDoctorName}` : ''}
${rec.adminNotes ? `- **Review Notes:** "${rec.adminNotes}"` : ''}`,
          actions: [
            { text: '📋 View in Full Tracker', action: 'open_tracker_modal' }
          ]
        };
      } else {
        return {
          id: 'status_not_found',
          response: `⚠️ No record found matching ID \`${query.toUpperCase()}\`. Please check the spelling or open the Tracker to view all saved applications.`,
          actions: [
            { text: '🔍 Open Application Tracker', action: 'open_tracker_modal' }
          ]
        };
      }
    }

    const kb = this.getKnowledgeBase();
    let bestMatch = null;
    let highestScore = 0;

    for (const item of kb) {
      let score = 0;
      for (const kw of item.keywords) {
        if (q.includes(kw.toLowerCase())) {
          score += (kw.length > 5 ? 3 : 2);
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && highestScore > 0) {
      return bestMatch;
    }

    return {
      id: 'general_fallback',
      response: `Thank you for reaching out! I understand you are inquiring about **"${query}"**.
As a non-profit healthcare foundation, JCF provides:
- 💊 **100% Free Prescription Medicines & Refills**
- 🚑 **Emergency Ambulance & Triage Assistance**
- ❤️ **Pediatric & Critical Surgery Sponsorship Grants**
- 🩺 **Doctor Tele-Consultations & Free OPD Camps**

How would you like to proceed?`,
      actions: [
        { text: '📝 Request Healthcare Aid', action: 'open_patient_form' },
        { text: '🩺 Book Doctor Appointment', action: 'open_appointment_modal' },
        { text: '🤝 Join as Volunteer Hero', action: 'open_volunteer_form' },
        { text: '📞 Call 24/7 Helpline', action: 'call_hotline' }
      ]
    };
  }

  toggleChat(forceState) {
    this.isOpen = typeof forceState === 'boolean' ? forceState : !this.isOpen;
    const windowEl = document.getElementById('carebot-window');
    const badgeEl = document.getElementById('carebot-badge-bubble');
    const floatBtn = document.getElementById('carebot-toggle-btn');

    if (windowEl) {
      if (this.isOpen) {
        windowEl.classList.add('active');
        if (badgeEl) badgeEl.style.display = 'none';
        if (floatBtn) floatBtn.classList.add('active');
        this.renderChatWindow();
        setTimeout(() => {
          document.getElementById('carebot-input')?.focus();
        }, 150);
      } else {
        windowEl.classList.remove('active');
        if (floatBtn) floatBtn.classList.remove('active');
      }
    }
  }

  clearChat() {
    this.initDOM();
    this.renderChatWindow();
  }
}

// Global CareBot instance
window.jcfBot = new JCFCareBot();
