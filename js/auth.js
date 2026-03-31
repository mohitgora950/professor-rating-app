/* ============================================================
   js/auth.js  —  Real Authentication: Backend API calls + JWT tokens
   Now using Express backend with MySQL database
   ============================================================ */

// API Base URL - Use absolute URL to avoid network errors
const API_BASE = 'http://localhost:3000';
const TOKEN_KEY = "edurate:token";
const USER_KEY = "edurate:user";

const AuthService = {

  /**
   * LOGIN — Call backend API with email and password
   * Returns: { success: true, token, user } or { success: false, message }
   */
  async login(email, password) {
    try {
      console.log('🔐 Attempting login with email:', email);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      // Check if response was successful
      if (!response.ok) {
        console.log('❌ Login failed:', data.error);
        return {
          success: false,
          message: data.error || 'Login failed'
        };
      }

      // Validate response contains token and user
      if (!data.token || !data.user) {
        console.log('❌ Invalid response structure');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      // Store token and user info in localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      console.log('✅ Login successful. User stored:', data.user.email, 'Role:', data.user.role);

      return {
        success: true,
        token: data.token,
        user: data.user
      };

    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  },

  /**
   * REGISTER — Call backend API to create new user account
   * Returns: { success: true, token, user } or { success: false, message }
   */
  async register({ name, email, password, role }) {
    try {
      console.log('📝 Registration attempt with email:', email, 'Role:', role);

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: role || 'student' })
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      // Check if response was successful
      if (!response.ok) {
        console.log('❌ Registration failed:', data.error);
        return {
          success: false,
          message: data.error || 'Registration failed'
        };
      }

      // Validate response contains token and user
      if (!data.token || !data.user) {
        console.log('❌ Invalid response structure');
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      // Store token and user info in localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      console.log('✅ Registration successful. User stored:', data.user.email, 'Role:', data.user.role);

      return {
        success: true,
        token: data.token,
        user: data.user
      };

    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  },

  /**
   * GET SESSION — Retrieve stored user info from localStorage
   * Returns user object or null if not logged in
   */
  getSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      
      if (!token || !user) return null;
      
      return JSON.parse(user);
    } catch (error) {
      return null;
    }
  },

  /**
   * GET TOKEN — Retrieve JWT token from localStorage
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * IS LOGGED IN — Check if user has valid session
   */
  isLoggedIn() {
    return !!this.getToken() && !!this.getSession();
  },

  /**
   * IS ADMIN — Check if logged-in user is admin
   */
  isAdmin() {
    const user = this.getSession();
    return user && user.role === 'admin';
  },

  /**
   * LOGOUT — Clear token and user data
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * GET HEADERS — Return authorized headers with JWT token
   */
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
};

/* ── Shared UI helpers (used in login & register pages) ── */
function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 4000);
}

function showSuc(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}
