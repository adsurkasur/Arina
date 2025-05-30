import React from "react";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart3, PieChart, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WelcomeBannerProps {
  onToolSelect?: (tool: string) => void;
}

export default function WelcomeBanner({ onToolSelect }: WelcomeBannerProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Welcome Message */}
      <div className="flex justify-center mb-6 font-sans">
        <div className="bg-cream rounded-lg p-6 shadow-md max-w-2xl w-full">
          <h2 className="text-2xl font-semibold text-primary mb-4">{t('chat.welcomeTitle')}</h2>
          <p className="mb-4">{t('chat.welcomeDesc')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <LineChart className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">{t('chat.businessFeasibility')}</h3>
                <p className="text-sm">{t('chat.businessFeasibilityDesc')}</p>
              </div>
            </div>
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <BarChart3 className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">{t('chat.demandForecasting')}</h3>
                <p className="text-sm">{t('chat.demandForecastingDesc')}</p>
              </div>
            </div>
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <PieChart className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">{t('chat.optimizationAnalysis')}</h3>
                <p className="text-sm">{t('chat.optimizationAnalysisDesc')}</p>
              </div>
            </div>
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <Brain className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">{t('chat.aiAssistance')}</h3>
                <p className="text-sm">{t('chat.aiAssistanceDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Example Images Banner */}
      <div className="flex justify-center mb-6 font-sans">
        <div className="flex justify-center w-full">
          <div className="flex space-x-2 overflow-x-auto max-w-2xl">
        <img 
          src="https://cdn.statically.io/img/www.uasolutions.ch/wp-content/uploads/2021/08/Agriculture-drones-for-crop-spraying-a-field.jpg" 
          alt="Modern farming technology with drone" 
          className="rounded-lg shadow-md h-32 w-auto object-cover" 
        />
        <img 
          src="https://cdn.statically.io/img/img.freepik.com/premium-photo/smart-farmer-using-technology-app-tablet-checking-grow-analysis-by-technology-agriculture-field-farm-smart-farm-concept_1962-2028.jpg" 
          alt="Farmer using tablet for agricultural analysis" 
          className="rounded-lg shadow-md h-32 w-auto object-cover" 
        />
        <img 
          src="https://cdn.statically.io/img/imageio.forbes.com/specials-images/imageserve/5f4852f38638e0c8be8dfff0/Greenhouse-in-the-Westland-area-of-the-Netherlands-/960x0.jpg?format=jpg&width=960" 
          alt="Advanced greenhouse farming technology" 
          className="rounded-lg shadow-md h-32 w-auto object-cover" 
        />
          </div>
        </div>
      </div>

      {/* Getting Started Prompt */}
      <div className="flex justify-center mb-6 font-sans">
        <div className="bg-white rounded-lg p-6 shadow-md max-w-2xl w-full">
          <h3 className="font-heading font-medium text-primary text-lg mb-2">{t('chat.gettingStarted')}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('chat.gettingStartedDesc')}
          </p>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="button-suggestion"
              onClick={() => onToolSelect && onToolSelect('businessFeasibility')}
            >
              {t('chat.example.businessFeasibility')}
            </Button>
            <Button 
              variant="outline" 
              className="button-suggestion"
              onClick={() => onToolSelect && onToolSelect('demandForecasting')}
            >
              {t('chat.example.demandForecasting')}
            </Button>
            <Button 
              variant="outline" 
              className="button-suggestion"
              onClick={() => onToolSelect && onToolSelect('optimizationAnalysis')}
            >
              {t('chat.example.optimizationAnalysis')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
