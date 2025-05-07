import { Button } from "@/components/ui/button";
import { LineChart, BarChart3, PieChart, Brain } from "lucide-react";

interface WelcomeBannerProps {
  onToolSelect?: (tool: string) => void;
}

export default function WelcomeBanner({ onToolSelect }: WelcomeBannerProps) {
  return (
    <>
      {/* Welcome Message */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-6 shadow-md max-w-2xl w-full">
          <h2 className="text-2xl font-heading font-semibold text-primary mb-4">Welcome to Arina</h2>
          <p className="mb-4">Your AI-powered agricultural business assistant. I can help you with:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <LineChart className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">Business Feasibility</h3>
                <p className="text-sm">Analyze profitability and break-even points</p>
              </div>
            </div>
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <BarChart3 className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">Demand Forecasting</h3>
                <p className="text-sm">Predict future sales and market trends</p>
              </div>
            </div>
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <PieChart className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">Optimization Analysis</h3>
                <p className="text-sm">Maximize profits or minimize costs</p>
              </div>
            </div>
            <div className="bg-cream p-3 rounded-lg flex items-start">
              <Brain className="text-primary mt-1 mr-2 h-5 w-5" />
              <div>
                <h3 className="font-medium text-primary">AI Assistance</h3>
                <p className="text-sm">Get insights and advice for your farm</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example Images Banner */}
      <div className="flex justify-center mb-6">
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
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-6 shadow-md max-w-2xl w-full">
          <h3 className="font-heading font-medium text-primary text-lg mb-2">How can I help you today?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Type a question in the chat or try one of these examples:
          </p>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left text-gray-800 bg-cream hover:bg-cream-dark border-0"
              onClick={() => onToolSelect && onToolSelect('businessFeasibility')}
            >
              Help me analyze if a strawberry farm would be profitable
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left text-gray-800 bg-cream hover:bg-cream-dark border-0"
              onClick={() => onToolSelect && onToolSelect('demandForecasting')}
            >
              Forecast corn demand for the next 6 months
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left text-gray-800 bg-cream hover:bg-cream-dark border-0"
              onClick={() => onToolSelect && onToolSelect('optimizationAnalysis')}
            >
              Optimize my crop selection to maximize profits
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
import React from 'react';

export default function WelcomeBanner() {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-semibold text-primary mb-3">Welcome to ArinaAI</h2>
      <p className="text-gray-600">
        Start a conversation to get AI-powered agricultural insights and recommendations.
      </p>
    </div>
  );
}
