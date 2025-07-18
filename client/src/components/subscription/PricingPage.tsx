import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, Crown, Zap, Star, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Declare Midtrans global variable
declare global {
  interface Window {
    snap: any;
  }
}

interface PricingPageProps {
  onClose: () => void;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'destructive';
}

export function PricingPage({ onClose }: PricingPageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: t('pricing.freePlan'),
      price: 0,
      period: t('pricing.forever'),
      description: t('pricing.freeDescription'),
      features: [
        t('pricing.basicAnalysis'),
        t('pricing.limitedChats'),
        t('pricing.basicSupport'),
        t('pricing.standardTemplates')
      ],
      icon: <Users className="h-6 w-6" />,
      buttonText: t('pricing.currentPlan'),
      buttonVariant: 'outline'
    },
    {
      id: 'pro',
      name: t('pricing.proPlan'),
      price: billingPeriod === 'monthly' ? 99000 : 990000,
      period: billingPeriod === 'monthly' ? t('pricing.perMonth') : t('pricing.perYear'),
      description: t('pricing.proDescription'),
      features: [
        t('pricing.unlimitedAnalysis'),
        t('pricing.unlimitedChats'),
        t('pricing.prioritySupport'),
        t('pricing.advancedTemplates'),
        t('pricing.exportFeatures'),
        t('pricing.aiRecommendations')
      ],
      recommended: true,
      icon: <Crown className="h-6 w-6" />,
      buttonText: t('pricing.upgradeToPro'),
      buttonVariant: 'default'
    },
    {
      id: 'enterprise',
      name: t('pricing.enterprisePlan'),
      price: billingPeriod === 'monthly' ? 299000 : 2990000,
      period: billingPeriod === 'monthly' ? t('pricing.perMonth') : t('pricing.perYear'),
      description: t('pricing.enterpriseDescription'),
      features: [
        t('pricing.everythingInPro'),
        t('pricing.customIntegrations'),
        t('pricing.dedicatedSupport'),
        t('pricing.customReports'),
        t('pricing.teamCollaboration'),
        t('pricing.apiAccess'),
        t('pricing.whiteLabeling')
      ],
      icon: <Zap className="h-6 w-6" />,
      buttonText: t('pricing.contactSales'),
      buttonVariant: 'outline'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Initialize Midtrans Snap
  const initializeMidtrans = () => {
    if (!window.snap) {
      const script = document.createElement('script');
      script.src = import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
      document.head.appendChild(script);
    }
  };

  // Handle payment process
  const handlePayment = async (plan: PricingPlan) => {
    if (plan.id === 'free') return;
    if (plan.id === 'enterprise') {
      // Handle contact sales
      toast({
        title: t('pricing.contactSales'),
        description: t('pricing.contactSalesDesc'),
      });
      return;
    }

    setLoadingPayment(plan.id);

    try {
      // Initialize Midtrans if not already done
      initializeMidtrans();

      // Create transaction
      const response = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create transaction');
      }

      // Open Midtrans payment popup
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result);
            toast({
              title: t('payment.success'),
              description: t('payment.successDesc'),
            });
            // Handle success - update user subscription status
            handlePaymentSuccess(plan.id, result);
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            toast({
              title: t('payment.pending'),
              description: t('payment.pendingDesc'),
            });
          },
          onError: function(result: any) {
            console.log('Payment error:', result);
            toast({
              title: t('payment.error'),
              description: t('payment.errorDesc'),
              variant: 'destructive',
            });
          },
          onClose: function() {
            console.log('Payment popup closed');
          }
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: t('payment.error'),
        description: error instanceof Error ? error.message : t('payment.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoadingPayment(null);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (planId: string, paymentResult: any) => {
    try {
      const response = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          orderId: paymentResult.order_id,
          transactionStatus: paymentResult.transaction_status,
          planId,
        }),
      });

      if (response.ok) {
        // Close pricing page and refresh user data
        onClose();
        window.location.reload(); // Or use your state management to update user subscription
      }
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-muted to-muted rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{t('pricing.title')}</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('pricing.heroTitle')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('pricing.heroDescription')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {t('pricing.monthly')}
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingPeriod === 'yearly' ? 'bg-muted' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              {t('pricing.yearly')}
            </span>
            {billingPeriod === 'yearly' && (
              <Badge variant="secondary" className="ml-2">
                {t('pricing.save20Percent')}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.recommended
                  ? 'border-muted shadow-xl scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-muted hover:bg-muted text-white px-4 py-1 cursor-default">
                    <Star className="h-3 w-3 mr-1" />
                    {t('pricing.mostPopular')}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.recommended ? 'bg-muted/20' : 'bg-gray-100'
                  }`}>
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? t('pricing.free') : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-2">/ {plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-muted mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  size="lg"
                  disabled={plan.id === 'free' || loadingPayment === plan.id}
                  onClick={() => handlePayment(plan)}
                >
                  {loadingPayment === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('payment.processing')}
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">{t('pricing.faqTitle')}</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq1Question')}</h4>
              <p className="text-gray-600">{t('pricing.faq1Answer')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq2Question')}</h4>
              <p className="text-gray-600">{t('pricing.faq2Answer')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq3Question')}</h4>
              <p className="text-gray-600">{t('pricing.faq3Answer')}</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-12 p-8 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t('pricing.needHelp')}</h3>
          <p className="text-gray-600 mb-6">{t('pricing.contactDescription')}</p>
          <Button variant="outline">
            {t('pricing.contactSupport')}
          </Button>
        </div>
      </div>
    </div>
  );
}