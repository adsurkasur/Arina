import React, { createContext, useCallback, useState, useEffect } from "react";
import {
  onAuthChanged,
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  signOut,
} from "@/lib/firebase";
import { createUserProfile } from "@/lib/mongodb";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmailPassword: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => void;
  userReady: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  showAuthModal: false,
  setShowAuthModal: () => {},
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmailPassword: async () => {},
  logout: async () => {},
  checkAuthState: () => {},
  userReady: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const checkAuthState = useCallback(() => {
    setIsLoading(true);
    onAuthChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "User",
          photoURL: firebaseUser.photoURL || undefined,
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    setUserReady(false);
    setProfileError(null);
    if (user) {
      createUserProfile(user.id, user.email, user.name, user.photoURL)
        .then((res) => {
          if (res.error) setProfileError((res.error as Error)?.message || 'Failed to create user profile');
        })
        .catch((err) => {
          setProfileError((err as Error)?.message || 'Failed to create user profile');
        })
        .finally(() => setUserReady(true));
    } else {
      setUserReady(false);
    }
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        // Create profile in Supabase if it doesn't exist
        await createUserProfile(
          result.user.uid,
          result.user.email || "",
          result.user.displayName || result.user.email?.split("@")[0] || "User",
          result.user.photoURL || undefined,
        );

        setShowAuthModal(false);
        toast({
          title: "Success",
          description: "Signed in with Google successfully",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmail(email, password);
      // Ensure user exists in MongoDB after email login
      if (result && result.user) {
        await createUserProfile(
          result.user.uid,
          result.user.email || email,
          result.user.displayName || email.split("@")[0] || "User",
          result.user.photoURL || undefined
        );
      }
      setShowAuthModal(false);
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const registerWithEmailPassword = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      const result = await registerWithEmail(email, password);
      if (result && result.user) {
        await createUserProfile(result.user.uid, email, name);
        setShowAuthModal(false);
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Only block with spinner if user is authenticated and userReady is false
  if (isLoading || (user && !userReady)) {
    if (profileError && user) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <div className="text-red-500 text-lg mb-2">{profileError}</div>
          <button
            className="px-4 py-2 bg-primary text-white rounded"
            onClick={() => {
              setProfileError(null);
              setUserReady(false);
              createUserProfile(user.id, user.email, user.name, user.photoURL)
                .then((res) => {
                  if (res.error) setProfileError((res.error as Error)?.message || 'Failed to create user profile');
                  else setProfileError(null);
                })
                .catch((err) => setProfileError((err as Error)?.message || 'Failed to create user profile'))
                .finally(() => setUserReady(true));
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    // If not authenticated, do not block the app (let login screen show)
    if (!user) return <>{children}</>;
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-500 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        showAuthModal,
        setShowAuthModal,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmailPassword,
        logout,
        checkAuthState,
        userReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
