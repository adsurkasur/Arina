
// Session storage keys
export const STORAGE_KEYS = {
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  ANALYSIS: 'analysis',
  RECOMMENDATIONS: 'recommendations'
};

// Generic get/set helpers
export const getSessionData = (key: string) => {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
};

export const setSessionData = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting session data:', error);
  }
};
