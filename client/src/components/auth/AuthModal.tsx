import React, { useRef, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";

// Form schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { 
    message: "Password must be at least 6 characters long" 
  }),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, { 
    message: "Name must be at least 2 characters long" 
  }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { 
    message: "Password must be at least 6 characters long" 
  }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

declare global {
  interface Window {
    grecaptcha?: any;
    onRecaptchaSuccess?: (token: string) => void;
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, loginWithGoogle, loginWithEmail, registerWithEmailPassword } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaWidgetRef = useRef<HTMLDivElement>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });
  
  // Callback for reCAPTCHA v2
  useEffect(() => {
    window.onRecaptchaSuccess = (token) => {
      setRecaptchaToken(token);
      setRecaptchaError(null);
    };
    // Cleanup global callback on unmount
    return () => {
      delete window.onRecaptchaSuccess;
    };
  }, []);

  // Effect to render/reset reCAPTCHA on tab switch or component mount
  useEffect(() => {
    setRecaptchaToken(null); // Reset token state
    setRecaptchaError(null); // Reset error state

    const renderRecaptchaInActiveTab = () => {
      if (recaptchaWidgetRef.current && window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        const recaptchaInnerDiv = recaptchaWidgetRef.current.querySelector('.g-recaptcha');
        
        if (recaptchaInnerDiv) {
          // Clear out the inner div before rendering to prevent issues with multiple widgets.
          recaptchaInnerDiv.innerHTML = ''; 
          try {
            window.grecaptcha.render(recaptchaInnerDiv, {
              'sitekey': RECAPTCHA_SITE_KEY,
              'callback': 'onRecaptchaSuccess', // Global callback name
              'expired-callback': () => {
                setRecaptchaToken(null);
                setRecaptchaError(t('error.recaptchaExpired', 'reCAPTCHA has expired. Please complete it again.'));
                // Consider re-rendering the captcha automatically or prompting user
                // For now, clearing token and showing error is a safe default.
              },
              'error-callback': () => {
                setRecaptchaError(t('error.recaptchaLoadFailed', 'Failed to load reCAPTCHA. Please try again.'));
              }
            });
          } catch (e) {
            console.error("Error rendering reCAPTCHA:", e);
            setRecaptchaError(t('error.recaptchaLoadFailed', 'An error occurred while loading reCAPTCHA.'));
          }
        } else {
          // console.warn("'.g-recaptcha' div not found in the current tab.");
        }
      } else {
        // console.warn("reCAPTCHA API or widget ref not available for rendering.");
        // This might happen if the reCAPTCHA script hasn't loaded yet.
        // You might want to add a retry mechanism or ensure the script is loaded before the modal is displayed.
      }
    };

    // Use a small timeout to allow React to update the DOM for the new tab
    // and for the reCAPTCHA script to be ready if loaded asynchronously.
    const timerId = setTimeout(renderRecaptchaInActiveTab, 100);

    return () => {
      clearTimeout(timerId);
    };
  }, [activeTab, t]); // Added t as a dependency because it's used in callbacks

  const onLoginSubmit = (values: LoginFormValues) => {
    if (!recaptchaToken) {
      setRecaptchaError(t('error.recaptchaRequired', 'Please complete the reCAPTCHA.'));
      return;
    }
    setRecaptchaError(null);
    loginWithEmail(values.email, values.password);
  };
  
  const onRegisterSubmit = (values: RegisterFormValues) => {
    if (!recaptchaToken) {
      setRecaptchaError(t('error.recaptchaRequired', 'Please complete the reCAPTCHA.'));
      return;
    }
    setRecaptchaError(null);
    registerWithEmailPassword(values.name, values.email, values.password);
  };
  
  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center">
          <Sprout className="h-6 w-6 text-primary mr-2" />
          <DialogTitle className="text-xl font-heading">{activeTab === "login" ? t('auth.login') : t('auth.register')}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setShowAuthModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Tabs 
          defaultValue="login" 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as "login" | "register")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.email')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('auth.emailPlaceholder')} 
                          type="email" 
                          autoComplete="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('auth.passwordPlaceholder')} 
                          type="password"
                          autoComplete="current-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={loginForm.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{t('auth.rememberMe')}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button variant="link" className="p-0 h-auto text-sm text-primary" type="button">
                    {t('auth.forgotPassword')}
                  </Button>
                </div>
                
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  {t('auth.login')}
                </Button>
                
                <div className="relative flex items-center justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200"></div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border border-gray-300 text-gray-700"
                  onClick={() => loginWithGoogle()}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t('auth.loginWithGoogle')}
                </Button>
                
                <div ref={recaptchaWidgetRef} className="flex justify-center">
                  <div
                    className="g-recaptcha"
                    data-sitekey={RECAPTCHA_SITE_KEY}
                    data-callback="onRecaptchaSuccess"
                  ></div>
                </div>
                {recaptchaError && <div className="text-red-500 text-xs text-center mt-2">{recaptchaError}</div>}
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.namePlaceholder')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.namePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.email')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('auth.emailPlaceholder')} 
                          type="email"
                          autoComplete="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('auth.passwordPlaceholder')} 
                          type="password"
                          autoComplete="new-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('auth.confirmPasswordPlaceholder')} 
                          type="password"
                          autoComplete="new-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          {t('auth.privacyPolicy')}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  {t('auth.register')}
                </Button>
                
                <div className="relative flex items-center justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200"></div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border border-gray-300 text-gray-700"
                  onClick={() => loginWithGoogle()}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {t('auth.loginWithGoogle')}
                </Button>
                
                <div ref={recaptchaWidgetRef} className="flex justify-center">
                  <div
                    className="g-recaptcha"
                    data-sitekey={RECAPTCHA_SITE_KEY}
                    data-callback="onRecaptchaSuccess"
                  ></div>
                </div>
                {recaptchaError && <div className="text-red-500 text-xs text-center mt-2">{recaptchaError}</div>}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
