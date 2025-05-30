import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sprout, Mail, Lock, User, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signInWithEmail } from "@/lib/firebase";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function loadRecaptchaScript() {
  if (!document.getElementById('recaptcha-script')) {
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=' + RECAPTCHA_SITE_KEY;
    script.async = true;
    document.body.appendChild(script);
  }
}

export default function Login() {
  const { isAuthenticated, isLoading, loginWithEmail, registerWithEmailPassword, loginWithGoogle } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    loadRecaptchaScript();
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const executeRecaptcha = async (action: string) => {
    // @ts-ignore
    if (window.grecaptcha && RECAPTCHA_SITE_KEY) {
      // @ts-ignore
      return await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action });
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setFormLoading(true);
    try {
      const token = await executeRecaptcha("register");
      if (!token) throw new Error("reCAPTCHA failed. Please try again.");
      // Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, recaptchaToken: token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      // Auto-login after registration
      const loginToken = await executeRecaptcha("login");
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken: loginToken })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || "Login failed");
      // Also sign in with Firebase client SDK to update session
      await signInWithEmail(email, password);
      window.location.href = "/";
    } catch (error: any) {
      setError(error.message || "Failed to register. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setFormLoading(true);
    try {
      const token = await executeRecaptcha("login");
      if (!token) throw new Error("reCAPTCHA failed. Please try again.");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken: token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // Also sign in with Firebase client SDK to update session
      await signInWithEmail(email, password);
      window.location.href = "/";
    } catch (error: any) {
      setError(error.message || "Failed to login. Please check your credentials.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-500 text-lg">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex justify-center items-center bg-primary text-white p-3 rounded-full mb-4">
            <Sprout className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in to continue to Arina
          </p>
        </div>
        
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            {activeTab === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </Button>
                  
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-xs text-gray-500">
                        OR
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-gray-300 flex gap-2 items-center justify-center"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}>
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting to Google...
                      </>
                    ) : (
                      <>
                        <FcGoogle className="h-5 w-5" />
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your Name"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-xs text-gray-500">
                        OR
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-gray-300 flex gap-2 items-center justify-center"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}>
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting to Google...
                      </>
                    ) : (
                      <>
                        <FcGoogle className="h-5 w-5" />
                        <span>Sign up with Google</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pb-4 pt-2">
            <p className="text-sm text-gray-500">
              {activeTab === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab("register")}>
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setActiveTab("login")}>
                    Log in
                  </Button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-center text-gray-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Arina. All rights reserved.
        </p>
      </div>
    </div>
  );
}
