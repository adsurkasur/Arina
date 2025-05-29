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
        <div className="flex space-x-2 overflow-x-auto w-full max-w-2xl">
          <img 
            src="https://cdn.pixabay.com/photo/2016/11/08/05/50/agriculture-1807549_1280.jpg" 
            alt="Modern farming technology with drone" 
            className="rounded-lg shadow-md h-32 w-auto object-cover" 
          />
          <img 
            src="https://cdn.pixabay.com/photo/2017/07/26/11/53/woman-2541231_1280.jpg" 
            alt="Farmer using tablet for agricultural analysis" 
            className="rounded-lg shadow-md h-32 w-auto object-cover" 
          />
          <img 
            src="https://cdn.pixabay.com/photo/2017/10/17/19/11/agriculture-2861789_1280.jpg" 
            alt="Advanced greenhouse farming technology" 
            className="rounded-lg shadow-md h-32 w-auto object-cover" 
          />
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
              className="w-full justify-start text-left text-gray-800 bg-cream hover:bg-cream-dark border-0"
              onClick={() => onToolSelect && onToolSelect('businessFeasibility')}
            >
              {t('chat.example.businessFeasibility')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left text-gray-800 bg-cream hover:bg-cream-dark border-0"
              onClick={() => onToolSelect && onToolSelect('demandForecasting')}
            >
              {t('chat.example.demandForecasting')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left text-gray-800 bg-cream hover:bg-cream-dark border-0"
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
