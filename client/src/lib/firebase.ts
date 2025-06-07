import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  signInWithPopup,
  deleteUser as firebaseDeleteUser, // Add this import
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google login
export const signInWithGoogle = async (): Promise<UserCredential> => {
  // signInWithRedirect does not return a UserCredential, so this should be handled differently if you want the user object
  // For now, return a Promise.reject to avoid type confusion
  return signInWithPopup(auth, googleProvider);
  // return Promise.reject(new Error("signInWithRedirect does not return UserCredential directly. Use getRedirectResult instead."));
};

// Email/password login
export const signInWithEmail = (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Email/password registration
export const registerWithEmail = (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign out
export const signOut = () => {
  return firebaseSignOut(auth);
};

// Auth state listener
export const onAuthChanged = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Delete user account
export const deleteCurrentUserAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
    return firebaseDeleteUser(user);
  }
  throw new Error("No user is currently signed in.");
};

/**
 * Re-authenticate the current user.
 * @param method 'password' | 'google'
 * @param credentialData { email, password } for password, or undefined for Google
 */
export const reauthenticateCurrentUser = async (
  method: 'password' | 'google',
  credentialData?: { email: string; password: string }
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently signed in.");
  if (method === 'password') {
    if (!credentialData?.email || !credentialData?.password) throw new Error('Email and password required');
    const credential = EmailAuthProvider.credential(credentialData.email, credentialData.password);
    await reauthenticateWithCredential(user, credential);
  } else if (method === 'google') {
    await reauthenticateWithPopup(user, googleProvider);
  } else {
    throw new Error('Unsupported re-authentication method');
  }
};

export { auth };
