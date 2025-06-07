// All functions in this file now use the backend API for MongoDB integration.
// Local storage and stubbed logic have been removed. All data is persisted via Express API endpoints.

// User management

// User profile management
export const createUserProfile = async (
  userId: string,
  email: string,
  name: string,
  photoURL?: string,
) => {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, email, name, photo_url: photoURL }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create user");
    return { data, error: null };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { data: null, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "User not found");
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: null, error };
  }
};

// Update user preferences
/**
 * Update user preferences in MongoDB. If user is missing, auto-create and retry.
 * @param userId - Firebase UID
 * @param prefs - Preferences to update
 * @param userInfo - { email, name, photoURL } (required for fallback)
 */
export const updateUserPreferences = async (
  userId: string,
  prefs: { dark_mode?: boolean; language?: string },
  userInfo: { email: string; name: string; photoURL?: string }
) => {
  if (!userInfo.email || !userInfo.name) {
    console.warn("updateUserPreferences called with missing email or name:", userInfo);
  }
  try {
    // Always include user info in PATCH body for upsert
    const patchBody = { ...prefs, email: userInfo.email, name: userInfo.name, photo_url: userInfo.photoURL };
    const response = await fetch(`/api/users/${userId}/preferences`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });
    const data = await response.json();
    if (!response.ok) {
      // If user not found, try to create user and retry
      if (data.message === "User not found" && userInfo) {
        await createUserProfile(userId, userInfo.email, userInfo.name, userInfo.photoURL);
        // Retry update
        const retryResponse = await fetch(`/api/users/${userId}/preferences`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        });
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) throw new Error(retryData.message || "Failed to update preferences");
        return { data: retryData, error: null };
      }
      throw new Error(data.message || "Failed to update preferences");
    }
    return { data, error: null };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { data: null, error };
  }
};

export const deleteUserAccount = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}/account`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete user account");
    return { data, error: null };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { data: null, error };
  }
};

// Chat history
export const getChatHistory = async (userId: string) => {
  try {
    const response = await fetch(`/api/conversations/${userId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to fetch chat history");
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return { data: null, error };
  }
};

export const createChat = async (userId: string, title: string) => {
  try {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create chat");
    return { data, error: null };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { data: null, error };
  }
};

export const updateChatTitle = async (chatId: string, title: string) => {
  try {
    const response = await fetch(`/api/conversations/${chatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update chat title");
    return { data, error: null };
  } catch (error) {
    console.error("Error updating chat title:", error);
    return { data: null, error };
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    const response = await fetch(`/api/conversations/${chatId}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Failed to delete chat");
    return { error: null };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { error };
  }
};

// Chat messages
export const getChatMessages = async (conversationId: string) => {
  try {
    const response = await fetch(`/api/messages/${conversationId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch messages");
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { data: null, error };
  }
};

export const addChatMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  sender_id: string,
) => {
  try {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId, role, content, sender_id }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to add message");
    return { data, error: null };
  } catch (error) {
    console.error("Error adding chat message:", error);
    return { data: null, error };
  }
};

export const saveAnalysisResult = async (
  userId: string,
  type: string,
  data: any,
) => {
  try {
    const response = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, type, data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to save analysis");
    return { data: result, error: null };
  } catch (error) {
    console.error("Error saving analysis result:", error);
    return { data: null, error };
  }
};
