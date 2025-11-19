// Production-ready API configuration
const getApiBaseUrl = () => {
  // Priority 1: Check if VITE_API_URL is explicitly set (for custom deployments)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Default to production URL (for all deployments)
  const productionUrl = 'https://portfolio-ea4s.onrender.com';
  
  // Priority 3: Only use localhost if explicitly in development mode AND running locally
  // This ensures production builds always use the production URL
  if (import.meta.env.DEV && typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  
  // Default to production URL
  return productionUrl;
};

const API_BASE_URL = getApiBaseUrl();

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
        const error = new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.response = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      // Preserve status code if available
      if (error.status) {
        const enhancedError = new Error(error.message || `HTTP ${error.status}: Request failed`);
        enhancedError.status = error.status;
        enhancedError.response = error.response;
        throw enhancedError;
      }
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
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
    const response = await this.request('/api/auth/register', {
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
    return await this.request('/api/auth/profile');
  }

  async verifyToken() {
    // Verify endpoint doesn't require auth, it checks if token is valid
    return await this.request('/api/auth/verify', {
      requireAuth: false,
    });
  }

  // Projects API
  async getProjects() {
    const response = await this.request('/api/projects');
    return response.projects || [];
  }

  async getProject(id) {
    const response = await this.request(`/api/projects/${id}`);
    return response.project;
  }

  async createProject(projectData) {
    const response = await this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.project;
  }

  async updateProject(id, projectData) {
    const response = await this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
    return response.project;
  }

  async deleteProject(id) {
    return await this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Work Experience API
  async getWorkExperience() {
    const response = await this.request('/api/work');
    return response.workExperience || [];
  }

  async getWorkExperienceById(id) {
    const response = await this.request(`/api/work/${id}`);
    return response.experience;
  }

  async createWorkExperience(experienceData) {
    const response = await this.request('/api/work', {
      method: 'POST',
      body: JSON.stringify(experienceData),
    });
    return response.experience;
  }

  async updateWorkExperience(id, experienceData) {
    const response = await this.request(`/api/work/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experienceData),
    });
    return response.experience;
  }

  async deleteWorkExperience(id) {
    return await this.request(`/api/work/${id}`, {
      method: 'DELETE',
    });
  }

  // Certificates API
  async getCertificates() {
    const response = await this.request('/api/certificates');
    return response.certificates || [];
  }

  async getCertificate(id) {
    const response = await this.request(`/api/certificates/${id}`);
    return response.certificate;
  }

  async createCertificate(certificateData) {
    const response = await this.request('/api/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
    return response.certificate;
  }

  async updateCertificate(id, certificateData) {
    const response = await this.request(`/api/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
    return response.certificate;
  }

  async deleteCertificate(id) {
    return await this.request(`/api/certificates/${id}`, {
      method: 'DELETE',
    });
  }

  // Gears API
  async getGears() {
    const response = await this.request('/api/gears');
    return response.gears || { devices: [], extensions: [] };
  }

  async getGear(id) {
    const response = await this.request(`/api/gears/${id}`);
    return response.gear;
  }

  async createGear(gearData) {
    const response = await this.request('/api/gears', {
      method: 'POST',
      body: JSON.stringify(gearData),
    });
    return response.gear;
  }

  async updateGear(id, gearData) {
    const response = await this.request(`/api/gears/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gearData),
    });
    return response.gear;
  }

  async deleteGear(id) {
    return await this.request(`/api/gears/${id}`, {
      method: 'DELETE',
    });
  }

  // About Me API
  async getAboutMe() {
    const response = await this.request('/api/about');
    return response.aboutMe;
  }

  async updateAboutMe(aboutData) {
    const response = await this.request('/api/about', {
      method: 'PUT',
      body: JSON.stringify(aboutData),
    });
    return response.aboutMe;
  }

  // Bulk operations
  async bulkProjects(action, projects) {
    return await this.request('/api/projects/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, projects }),
    });
  }

  async bulkWorkExperience(action, workExperience) {
    return await this.request('/api/work/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, workExperience }),
    });
  }

  async bulkCertificates(action, certificates) {
    return await this.request('/api/certificates/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, certificates }),
    });
  }

  async bulkGears(action, gears) {
    return await this.request('/api/gears/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, gears }),
    });
  }

  // Upload methods
  async uploadToCloudinary(formData) {
    const url = `${this.baseURL}/api/upload/cloudinary`;
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

  // Upload video specifically
  async uploadVideoToCloudinary(formData) {
    const url = `${this.baseURL}/api/upload/cloudinary/video`;
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
      console.error('Cloudinary video upload failed:', error);
      throw error;
    }
  }

  async validateImageUrl(url) {
    return await this.request('/api/upload/validate-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  async deleteFromCloudinary(publicId) {
    return await this.request(`/api/upload/cloudinary/${publicId}`, {
      method: 'DELETE',
    });
  }

  // Resume upload method
  async uploadResume(formData) {
    const url = `${this.baseURL}/api/upload/resume`;
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
      console.error('Resume upload failed:', error);
      throw error;
    }
  }

  // Get resume download URL
  async getResume() {
    return await this.request('/api/upload/resume', {
      requireAuth: false,
    });
  }

  // WakaTime API methods
  async getWakaTimeStatus() {
    return await this.request('/api/wakatime/status', {
      requireAuth: false,
    });
  }

  async getWakaTimeStatusBar() {
    return await this.request('/api/wakatime/status-bar', {
      requireAuth: false,
    });
  }

  async getWakaTimeAllTimeSinceToday() {
    return await this.request('/api/wakatime/all-time-since-today', {
      requireAuth: false,
    });
  }

  async getWakaTimeDurations(date = null) {
    const query = date ? `?date=${date}` : '';
    return await this.request(`/api/wakatime/durations${query}`, {
      requireAuth: false,
    });
  }

  async getWakaTimeHeartbeats(date = null) {
    // Date is optional - if not provided, backend will default to today
    const query = date ? `?date=${date}` : '';
    return await this.request(`/api/wakatime/heartbeats${query}`, {
      requireAuth: false,
    });
  }

  async createWakaTimeHeartbeat(heartbeatData) {
    return await this.request('/api/wakatime/heartbeats', {
      method: 'POST',
      requireAuth: false,
      body: JSON.stringify(heartbeatData),
    });
  }

  async createWakaTimeHeartbeatsBulk(heartbeatsArray) {
    if (!Array.isArray(heartbeatsArray) || heartbeatsArray.length === 0) {
      throw new Error('Expected a non-empty array of heartbeats');
    }
    if (heartbeatsArray.length > 25) {
      throw new Error('Bulk endpoint is limited to 25 heartbeats per request');
    }
    return await this.request('/api/wakatime/heartbeats.bulk', {
      method: 'POST',
      requireAuth: false,
      body: JSON.stringify(heartbeatsArray),
    });
  }

  async deleteWakaTimeHeartbeatsBulk(date, ids) {
    if (!date || !Array.isArray(ids)) {
      throw new Error('Expected date (YYYY-MM-DD) and array of heartbeat IDs');
    }
    return await this.request('/api/wakatime/heartbeats.bulk', {
      method: 'DELETE',
      requireAuth: false,
      body: JSON.stringify({ date, ids }),
    });
  }

  async getWakaTimeProjectCommits(project, options = {}) {
    const { author, branch, page } = options;
    const queryParams = new URLSearchParams();
    if (author) queryParams.append('author', author);
    if (branch) queryParams.append('branch', branch);
    if (page) queryParams.append('page', page);
    const query = queryParams.toString();
    return await this.request(`/api/wakatime/projects/${encodeURIComponent(project)}/commits${query ? `?${query}` : ''}`, {
      requireAuth: false,
    });
  }

  async getWakaTimeEditors() {
    return await this.request('/api/wakatime/editors', {
      requireAuth: false,
    });
  }

  // WakaTime OAuth methods
  async getWakaTimeAuthUrl() {
    return await this.request('/api/wakatime/oauth/authorize', {
      requireAuth: false,
    });
  }

  async exchangeWakaTimeCode(code, redirectUri = null) {
    // Use the current origin + /callback as default redirect_uri
    const defaultRedirectUri = redirectUri || `${window.location.origin}/callback`;
    return await this.request('/api/wakatime/oauth/callback', {
      method: 'POST',
      requireAuth: false,
      body: JSON.stringify({ 
        code,
        redirect_uri: defaultRedirectUri
      }),
    });
  }

  async getWakaTimeOAuthStatus() {
    return await this.request('/api/wakatime/oauth/status', {
      requireAuth: false,
    });
  }

  async refreshWakaTimeToken() {
    return await this.request('/api/wakatime/oauth/refresh', {
      method: 'POST',
      requireAuth: false,
    });
  }

  async revokeWakaTimeToken() {
    return await this.request('/api/wakatime/oauth/revoke', {
      method: 'POST',
      requireAuth: false,
    });
  }

  // Blogs API methods (stored blog posts with embedded codes)
  async getBlogs() {
    return await this.request('/api/blogs', {
      requireAuth: false,
    });
  }

  async getBlog(id) {
    return await this.request(`/api/blogs/${id}`, {
      requireAuth: false,
    });
  }

  async createBlog(blogData) {
    return await this.request('/api/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  }

  async updateBlog(id, blogData) {
    return await this.request(`/api/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  }

  async deleteBlog(id) {
    return await this.request(`/api/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  // Twitter/Blog API methods (using OEmbed - no auth required)
  async getTwitterPosts(username = null) {
    const query = username ? `?username=${encodeURIComponent(username)}` : '';
    return await this.request(`/api/blog/tweets${query}`, {
      requireAuth: false,
    });
  }

  async getTwitterTweetEmbed(tweetUrl) {
    const query = tweetUrl ? `?url=${encodeURIComponent(tweetUrl)}` : '';
    return await this.request(`/api/blog/tweet${query}`, {
      requireAuth: false,
    });
  }

  // Spotify API methods
  async getSpotifyCurrentlyPlaying() {
    return await this.request('/api/spotify/currently-playing', {
      requireAuth: false,
    });
  }

  async getSpotifyPlayerStatus() {
    return await this.request('/api/spotify/player-status', {
      requireAuth: false,
    });
  }

  // Assistant API methods
  async sendAssistantMessage(message, conversationHistory = []) {
    return await this.request('/api/assistant/chat', {
      method: 'POST',
      requireAuth: false,
      body: JSON.stringify({ message, conversationHistory }),
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
