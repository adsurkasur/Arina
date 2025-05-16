// User management
// Local storage fallback keys
const STORAGE_KEYS = {
  USERS: "local_users",
  CHATS: "local_chats",
  MESSAGES: "local_messages",
};

// Local storage helper functions
const getLocalData = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error reading from local storage:", e);
    return null;
  }
};

const setLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Error writing to local storage:", e);
    return false;
  }
};

// User profile management
export const createUserProfile = async (
  userId: string,
  email: string,
  name: string,
  photoURL?: string,
) => {
  try {
    const userData = {
      id: userId,
      email,
      name,
      photo_url: photoURL,
      created_at: new Date().toISOString(),
    };

    const users = getLocalData(STORAGE_KEYS.USERS) || {};
    users[userId] = userData;
    setLocalData(STORAGE_KEYS.USERS, users);

    return { data: userData, error: null, isLocal: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { data: null, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const users = getLocalData(STORAGE_KEYS.USERS) || {};
    const user = users[userId];
    if (!user) throw new Error("User not found");
    return { data: user, error: null };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: null, error };
  }
};

// Chat history
export const getChatHistory = async (userId: string) => {
  try {
    const chats = getLocalData(STORAGE_KEYS.CHATS) || {};
    return { data: chats[userId] || [], error: null };
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return { data: null, error };
  }
};

export const createChat = async (userId: string, title: string) => {
  try {
    const chatId = crypto.randomUUID();
    const chatData = {
      id: chatId,
      user_id: userId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const chats = getLocalData(STORAGE_KEYS.CHATS) || {};
    if (!chats[userId]) chats[userId] = [];
    chats[userId].unshift(chatData);
    setLocalData(STORAGE_KEYS.CHATS, chats);

    return { data: chatData, error: null, isLocal: true };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { data: null, error };
  }
};

export const updateChatTitle = async (chatId: string, title: string) => {
  try {
    // await mongoClient.connect();
    // const db = mongoClient.db(dbName);
    // const chatsCollection = db.collection("chats");

    // const result = await chatsCollection.updateOne(
    //   { _id: chatId },
    //   { $set: { title } },
    // );

    // if (result.matchedCount === 0) {
    //   throw new Error("Chat not found");
    // }

    return { data: { chatId, title }, error: null };
  } catch (error) {
    console.error("Error updating chat title:", error);
    return { data: null, error };
  } finally {
    // await mongoClient.close();
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    // await mongoClient.connect();
    // const db = mongoClient.db(dbName);
    // const chatsCollection = db.collection("chats");

    // const result = await chatsCollection.deleteOne({ _id: chatId });

    // if (result.deletedCount === 0) {
    //   throw new Error("Chat not found");
    // }

    return { error: null };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { error };
  } finally {
    // await mongoClient.close();
  }
};

// Chat messages
export const getChatMessages = async (conversationId: string) => {
  try {
    // await mongoClient.connect();
    // const db = mongoClient.db(dbName);
    // const messagesCollection = db.collection("messages");

    // const messages = await messagesCollection
    //   .find({ conversation_id: conversationId })
    //   .toArray();

    return { data: [], error: null };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { data: null, error };
  } finally {
    // await mongoClient.close();
  }
};

export const addChatMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) => {
  try {
    // await mongoClient.connect();
    // const db = mongoClient.db(dbName);
    // const messagesCollection = db.collection("messages");

    // const message = {
    //   conversation_id: conversationId,
    //   role,
    //   content,
    //   created_at: new Date().toISOString(),
    // };

    // await messagesCollection.insertOne(message);

    return { data: null, error: null };
  } catch (error) {
    console.error("Error adding chat message:", error);
    return { data: null, error };
  } finally {
    // await mongoClient.close();
  }
};

export const saveAnalysisResult = async (
  userId: string,
  type: string,
  data: any,
) => {
  try {
    // await mongoClient.connect();
    // const db = mongoClient.db(dbName);
    // const analysisCollection = db.collection("analysis_results");

    // const analysisData = {
    //   user_id: userId,
    //   type,
    //   data,
    //   created_at: new Date().toISOString(),
    //   updated_at: new Date().toISOString(),
    // };

    // const result = await analysisCollection.insertOne(analysisData);

    return { data: null, error: null };
  } catch (error) {
    console.error("Error saving analysis result:", error);
    return { data: null, error };
  } finally {
    // await mongoClient.close();
  }
};
