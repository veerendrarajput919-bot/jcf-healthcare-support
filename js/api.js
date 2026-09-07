/**
 * JCF Healthcare Support - Frontend REST API Client
 * Seamlessly interfaces with the Node.js Express backend and SQLite DB
 */

const JCF_API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? '' // Same-origin relative path when served from Express backend
  : '';

class JCFAPIClient {
  constructor() {
    this.baseUrl = JCF_API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.warn(`[JCF API Warning] ${endpoint}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  // Auth APIs
  async login(email, password, role) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Patients APIs
  async getPatients(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/patients${query ? `?${query}` : ''}`);
  }

  async getPatientById(id) {
    return this.request(`/api/patients/${id}`);
  }

  async submitPatientAid(patientData) {
    return this.request('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  }

  async updatePatientStatus(id, updateData) {
    return this.request(`/api/patients/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  }

  // Doctors APIs
  async getDoctors(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/doctors${query ? `?${query}` : ''}`);
  }

  async updateDoctorAvailability(id, status) {
    return this.request(`/api/doctors/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async updateDoctorProfile(id, doctorData) {
    return this.request(`/api/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(doctorData)
    });
  }

  async addDoctor(doctorData) {
    return this.request('/api/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  }

  // Volunteers APIs
  async getVolunteers() {
    return this.request('/api/volunteers');
  }

  async registerVolunteer(volData) {
    return this.request('/api/volunteers', {
      method: 'POST',
      body: JSON.stringify(volData)
    });
  }

  async updateVolunteerStatus(id, status, verified = true) {
    return this.request(`/api/volunteers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, verified })
    });
  }

  // Appointments APIs
  async getAppointments(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/appointments${query ? `?${query}` : ''}`);
  }

  async bookAppointment(aptData) {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(aptData)
    });
  }

  async updateAppointmentStatus(id, status) {
    return this.request(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async saveConsultationNotes(id, notesData) {
    return this.request(`/api/appointments/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(notesData)
    });
  }

  // Inquiries APIs
  async submitInquiry(inqData) {
    return this.request('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(inqData)
    });
  }

  async getInquiries() {
    return this.request('/api/inquiries');
  }

  async updateInquiryStatus(id, status) {
    return this.request(`/api/inquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // FAQs APIs
  async getFAQs() {
    return this.request('/api/faqs');
  }

  async addFAQ(faqData) {
    return this.request('/api/faqs', {
      method: 'POST',
      body: JSON.stringify(faqData)
    });
  }

  async deleteFAQ(id) {
    return this.request(`/api/faqs/${id}`, {
      method: 'DELETE'
    });
  }

  // Notifications & Activities
  async getNotifications(role = null, recipientId = null) {
    const params = {};
    if (role) params.role = role;
    if (recipientId) params.recipientId = recipientId;
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationsAsRead() {
    return this.request('/api/notifications/read', { method: 'PATCH' });
  }

  async addNotification(notifData) {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData)
    });
  }

  async getActivities() {
    return this.request('/api/activities');
  }

  // Stats API
  async getStats() {
    return this.request('/api/stats');
  }

  // AI CareBot Chat API
  async sendChatMessage(message) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // System Backup / Reset
  async exportDatabase() {
    return this.request('/api/system/export');
  }

  async resetDatabase() {
    return this.request('/api/system/reset', { method: 'POST' });
  }
}

// Global API instance
window.jcfAPI = new JCFAPIClient();
