const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth-token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
  }

  // Get headers for API requests
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.requireAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requireAuth: false,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(email, password, name) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      requireAuth: false,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
    return { message: 'Logged out successfully' };
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async verifyToken() {
    return await this.request('/auth/verify');
  }

  // Projects API
  async getProjects() {
    const response = await this.request('/projects');
    return response.projects || [];
  }

  async getProject(id) {
    const response = await this.request(`/projects/${id}`);
    return response.project;
  }

  async createProject(projectData) {
    const response = await this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.project;
  }

  async updateProject(id, projectData) {
    const response = await this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    return response.project;
  }

  async deleteProject(id) {
    return await this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Work Experience API
  async getWorkExperience() {
    const response = await this.request('/work');
    return response.workExperience || [];
  }

  async getWorkExperienceById(id) {
    const response = await this.request(`/work/${id}`);
    return response.experience;
  }

  async createWorkExperience(experienceData) {
    const response = await this.request('/work', {
      method: 'POST',
      body: JSON.stringify(experienceData),
    });
    return response.experience;
  }

  async updateWorkExperience(id, experienceData) {
    const response = await this.request(`/work/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experienceData),
    });
    return response.experience;
  }

  async deleteWorkExperience(id) {
    return await this.request(`/work/${id}`, {
      method: 'DELETE',
    });
  }

  // Certificates API
  async getCertificates() {
    const response = await this.request('/certificates');
    return response.certificates || [];
  }

  async getCertificate(id) {
    const response = await this.request(`/certificates/${id}`);
    return response.certificate;
  }

  async createCertificate(certificateData) {
    const response = await this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
    return response.certificate;
  }

  async updateCertificate(id, certificateData) {
    const response = await this.request(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
    return response.certificate;
  }

  async deleteCertificate(id) {
    return await this.request(`/certificates/${id}`, {
      method: 'DELETE',
    });
  }

  // Gears API
  async getGears() {
    const response = await this.request('/gears');
    return response.gears || { devices: [], extensions: [] };
  }

  async getGear(id) {
    const response = await this.request(`/gears/${id}`);
    return response.gear;
  }

  async createGear(gearData) {
    const response = await this.request('/gears', {
      method: 'POST',
      body: JSON.stringify(gearData),
    });
    return response.gear;
  }

  async updateGear(id, gearData) {
    const response = await this.request(`/gears/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gearData),
    });
    return response.gear;
  }

  async deleteGear(id) {
    return await this.request(`/gears/${id}`, {
      method: 'DELETE',
    });
  }

  // About Me API
  async getAboutMe() {
    const response = await this.request('/about');
    return response.aboutMe;
  }

  async updateAboutMe(aboutData) {
    const response = await this.request('/about', {
      method: 'PUT',
      body: JSON.stringify(aboutData),
    });
    return response.aboutMe;
  }

  // Bulk operations
  async bulkProjects(action, projects) {
    return await this.request('/projects/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, projects }),
    });
  }

  async bulkWorkExperience(action, workExperience) {
    return await this.request('/work/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, workExperience }),
    });
  }

  async bulkCertificates(action, certificates) {
    return await this.request('/certificates/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, certificates }),
    });
  }

  async bulkGears(action, gears) {
    return await this.request('/gears/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, gears }),
    });
  }

  // Upload methods
  async uploadToCloudinary(formData) {
    const url = `${this.baseURL}/upload/cloudinary`;
    const headers = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  }

  async validateImageUrl(url) {
    return await this.request('/upload/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async deleteFromCloudinary(publicId) {
    return await this.request(`/upload/cloudinary/${publicId}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
