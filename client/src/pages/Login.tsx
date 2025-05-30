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
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
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
      setError(t('error.fillAllFields', 'Please fill in all fields'));
      return;
    }
    if (password.length < 6) {
      setError(t('error.passwordLength', 'Password must be at least 6 characters'));
      return;
    }
    setFormLoading(true);
    try {
      const token = await executeRecaptcha("register");
      if (!token) throw new Error(t('error.recaptchaFailed', 'reCAPTCHA failed. Please try again.'));
      // Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, recaptchaToken: token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('error.registrationFailed', 'Registration failed'));
      // Auto-login after registration
      const loginToken = await executeRecaptcha("login");
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken: loginToken })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || t('error.loginFailed', 'Login failed'));
      // Also sign in with Firebase client SDK to update session
      await signInWithEmail(email, password);
      window.location.href = "/";
    } catch (error: any) {
      setError(error.message || t('error.registerTryAgain', 'Failed to register. Please try again.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(t('error.fillAllFields', 'Please fill in all fields'));
      return;
    }
    setFormLoading(true);
    try {
      const token = await executeRecaptcha("login");
      if (!token) throw new Error(t('error.recaptchaFailed', 'reCAPTCHA failed. Please try again.'));
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken: token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('error.loginFailed', 'Login failed'));
      // Also sign in with Firebase client SDK to update session
      await signInWithEmail(email, password);
      window.location.href = "/";
    } catch (error: any) {
      setError(error.message || t('error.loginCredentials', 'Failed to login. Please check your credentials.'));
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
      setError(error.message || t('error.googleSignIn', 'Failed to sign in with Google. Please try again.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const languageOptions = [
    { code: "en", label: "EN", flag: "\uD83C\uDDFA\uD83C\uDDF8" }, // 🇺🇸
    { code: "id", label: "ID", flag: "\uD83C\uDDEE\uD83C\uDDE9" }  // 🇮🇩
  ];
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langBtnRef.current && !langBtnRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    if (showLangDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLangDropdown]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-500 text-lg">{t('login.checkingAuth', 'Checking authentication...')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Switcher Dropdown */}
        <div className="flex justify-end mb-2 relative" ref={langBtnRef}>
          <button
            className="px-2 py-1 rounded text-xs font-medium bg-gray-200 flex items-center gap-1 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setShowLangDropdown((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={showLangDropdown}
            type="button"
          >
            <span>{languageOptions.find(l => l.code === language)?.flag}</span>
            <span>{languageOptions.find(l => l.code === language)?.label}</span>
            <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showLangDropdown && (
            <ul className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow z-10" role="listbox">
              {languageOptions.map(opt => (
                <li key={opt.code}>
                  <button
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors duration-100
                      ${language === opt.code ? 'bg-primary text-white font-semibold hover:bg-primary/80' : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900'}
                    `}
                    onClick={() => { setLanguage(opt.code); setShowLangDropdown(false); }}
                    disabled={language === opt.code}
                    role="option"
                    aria-selected={language === opt.code}
                    style={language === opt.code ? { fontWeight: 600 } : {}}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="text-center mb-6">
          <div className="inline-flex justify-center items-center bg-primary text-white p-3 rounded-full mb-4">
            <Sprout className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{t('login.title', 'Sign in to Arina')}</h1>
          <p className="text-gray-500">{t('login.subtitle', 'Your AI-powered agricultural business assistant')}</p>
        </div>
        
        <Card className="border shadow-sm">
          <CardHeader className="pb-4">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('login.tabLogin')}</TabsTrigger>
                <TabsTrigger value="register">{t('login.tabRegister')}</TabsTrigger>
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
                    <Label htmlFor="email">{t('login.labelEmail')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('login.placeholderEmail')}
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('login.labelPassword')}</Label>
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
                        {t('login.buttonLogin')}
                      </>
                    ) : (
                      t('login.buttonLogin')
                    )}
                  </Button>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-xs text-gray-500">
                        {t('login.or')}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 flex gap-2 items-center justify-center"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('login.google')}
                      </>
                    ) : (
                      <>
                        <FcGoogle className="h-5 w-5" />
                        <span>{t('login.google')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('login.labelName')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder={t('login.placeholderName')}
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('login.labelEmail')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('login.placeholderEmail')}
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('login.labelPassword')}</Label>
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
                        {t('login.buttonRegister')}
                      </>
                    ) : (
                      t('login.buttonRegister')
                    )}
                  </Button>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-xs text-gray-500">
                        {t('login.or')}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 flex gap-2 items-center justify-center"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('login.google')}
                      </>
                    ) : (
                      <>
                        <FcGoogle className="h-5 w-5" />
                        <span>{t('login.google')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        
        <p className="text-center text-gray-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Arina. {t('common.allRightsReserved', 'All rights reserved.')}
        </p>
      </div>
    </div>
  );
}
