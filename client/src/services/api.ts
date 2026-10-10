const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:4000/api' : ''))
  .replace(/\/+$/, '');

async function authRequest(path: string, options: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error('Sign in is not configured for this deployment. The site owner must connect the backend API.');
  }

  const response = await fetch(`${API_BASE_URL}/auth/${path}`, options);
  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error('The authentication server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(data.error || `Authentication failed (HTTP ${response.status}).`);
  }

  return data;
}

async function roomRequest(path: string, options: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error('Quiz rooms are not configured for this deployment. The site owner must connect the backend API.');
  }

  const response = await fetch(`${API_BASE_URL}/rooms/${path}`, options);
  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error('The quiz server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(data.error || `Quiz request failed (HTTP ${response.status}).`);
  }

  return data;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('logicrush_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async register(data: any) {
    return authRequest('register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async login(data: any) {
    return authRequest('login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async guestLogin() {
    return authRequest('guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async getMe() {
    return authRequest('me', {
      headers: getAuthHeaders()
    });
  },

  async resetPassword(data: any) {
    return authRequest('reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // Questions & Topics
  async getTopics() {
    const res = await fetch(`${API_BASE_URL}/questions/topics`);
    return res.json();
  },

  async getQuestions(topicId?: string, difficulty?: string, limit = 50, topics?: string[]) {
    const query = new URLSearchParams();
    if (topics?.length) query.set('topics', topics.join(','));
    else if (topicId) query.set('topic_id', topicId);
    if (difficulty) query.set('difficulty', difficulty);
    query.set('limit', String(limit));
    const res = await fetch(`${API_BASE_URL}/questions?${query.toString()}`);
    return res.json();
  },

  async createQuestion(data: any) {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Rooms
  async createRoom(data: any) {
    return roomRequest('create', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async getRoomByCode(code: string) {
    return roomRequest(`code/${encodeURIComponent(code)}`);
  },

  async getPublicRooms() {
    return roomRequest('public');
  },

  async getMyRooms() {
    return roomRequest('my-rooms', {
      headers: getAuthHeaders()
    });
  },

  // Analytics & Weakness
  async getMyAnalytics() {
    const res = await fetch(`${API_BASE_URL}/analytics/my-stats`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async fixWeaknessSession(data: any) {
    const res = await fetch(`${API_BASE_URL}/analytics/fix-weakness`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Social & Leaderboards
  async getLeaderboard(type = 'global', topic_id?: string) {
    const query = new URLSearchParams({ type });
    if (topic_id) query.set('topic_id', topic_id);
    const res = await fetch(`${API_BASE_URL}/social/leaderboard?${query.toString()}`);
    return res.json();
  },

  async getLeagues() {
    const res = await fetch(`${API_BASE_URL}/social/leagues`);
    return res.json();
  },

  async getTeams() {
    const res = await fetch(`${API_BASE_URL}/social/teams`);
    return res.json();
  },

  async getDailyChallenge() {
    const res = await fetch(`${API_BASE_URL}/social/daily-challenge`);
    return res.json();
  },

  async submitDailyChallenge(data: any) {
    const res = await fetch(`${API_BASE_URL}/social/daily-challenge/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAchievements() {
    const res = await fetch(`${API_BASE_URL}/social/achievements`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE_URL}/social/notifications`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
