import React, { createContext, useCallback, useState, useEffect } from "react";
import { 
  onAuthChanged, 
  signInWithGoogle, 
  signInWithEmail, 
  registerWithEmail, 
  signOut 
} from "@/lib/firebase";
import { createUserProfile } from "@/lib/supabase";
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
  registerWithEmailPassword: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => void;
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
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const checkAuthState = useCallback(() => {
    setIsLoading(true);
    onAuthChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
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

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      toast({
        title: "Success",
        description: "Signed in with Google successfully",
      });
      navigate("/");
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
      await signInWithEmail(email, password);
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

  const registerWithEmailPassword = async (name: string, email: string, password: string) => {
    try {
      const result = await registerWithEmail(email, password);
      
      if (result.user) {
        // Create profile in Supabase
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
