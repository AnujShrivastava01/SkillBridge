import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    
    // Add more specific error information
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      error.message = 'Backend server is not accessible. Please check if the server is running.';
    } else if (error.response?.status === 401) {
      error.message = 'Authentication failed. Please log in again.';
    } else if (error.response?.status === 404) {
      error.message = 'Resource not found.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

class ApiService {
  constructor() {
    this.token = localStorage.getItem("authToken");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  // Auth methods
  async loginWithGoogle(userData) {
    try {
      const response = await api.post("/auth/google", userData);
      if (response.token) {
        this.setToken(response.token);
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  async getProfile() {
    try {
      return await api.get("/auth/profile");
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get profile");
    }
  }

  async verifyToken() {
    try {
      return await api.get("/auth/verify");
    } catch (error) {
      throw new Error(error.response?.data?.error || "Token verification failed");
    }
  }

  // User methods
  async updateProfile(userData) {
    try {
      return await api.put("/users/profile", userData);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Profile update failed");
    }
  }

  async getUserById(userId) {
    try {
      return await api.get(`/users/${userId}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get user");
    }
  }

  // Request methods
  async createRequest(requestData) {
    try {
      return await api.post("/requests", requestData);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to create request");
    }
  }

  async getRequests(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      return await api.get(`/requests?${params.toString()}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get requests");
    }
  }

  async getRequestById(requestId) {
    try {
      return await api.get(`/requests/${requestId}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get request");
    }
  }

  async updateRequest(requestId, updateData) {
    try {
      return await api.put(`/requests/${requestId}`, updateData);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to update request");
    }
  }

  async acceptRequest(requestId) {
    try {
      return await api.post(`/requests/${requestId}/accept`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to accept request");
    }
  }

  async completeRequest(requestId) {
    try {
      return await api.post(`/requests/${requestId}/complete`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to complete request");
    }
  }

  // Category methods
  async getCategories() {
    try {
      return await api.get("/requests/categories/all");
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get categories");
    }
  }

  // Message methods
  async getMessages(requestId) {
    try {
      return await api.get(`/messages/request/${requestId}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get messages");
    }
  }

  async sendMessage(messageData) {
    try {
      return await api.post("/messages", messageData);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to send message");
    }
  }

  async markMessagesAsRead(requestId) {
    try {
      return await api.put(`/messages/request/${requestId}/read`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to mark messages as read");
    }
  }

  async uploadFile(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData
      });

      if (!response.ok) {
        // Handle different types of error responses
        let errorMessage = "Failed to upload file";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // If all else fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Failed to upload file");
    }
  }

  // Review methods
  async createReview(reviewData) {
    try {
      return await api.post("/reviews", reviewData);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to create review");
    }
  }

  async getReviews(userId) {
    try {
      return await api.get(`/reviews/user/${userId}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get reviews");
    }
  }

  // Notification methods
  async getUnreadMessageCount() {
    try {
      return await api.get("/messages/unread/count");
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get unread count");
    }
  }

  async markAllMessagesAsRead() {
    try {
      return await api.put("/messages/read-all");
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to mark all messages as read");
    }
  }
  async getNotifications() {
    try {
      return await api.get("/notifications");
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to get notifications");
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      return await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to mark notification as read");
    }
  }

  async markAllNotificationsAsRead() {
    try {
      return await api.put("/notifications/read-all");
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to mark all notifications as read");
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await api.get("/health");
      console.log("✅ Backend health check passed:", response);
      return response;
    } catch (error) {
      console.error("❌ Backend health check failed:", error);
      throw new Error("Backend server is not accessible");
    }
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem("authToken");
  }
}

export default new ApiService();
