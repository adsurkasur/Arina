import { Button } from "@/components/ui/button";
import { LineChart, BarChart3, PieChart, Sprout } from "lucide-react";

interface WelcomeBannerProps {
  onToolSelect?: (tool: string) => void;
}

export default function WelcomeBanner({ onToolSelect }: WelcomeBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Sprout className="w-12 h-12 text-primary" />
      </div>

      <h1 className="text-4xl font-heading font-semibold text-primary mb-4 text-center">
        Welcome to Arina
      </h1>

      <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
        Your AI-powered agricultural business assistant. How can I help you today?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        <div className="bg-cream p-4 rounded-lg flex items-start">
          <LineChart className="text-primary mt-1 mr-3 h-5 w-5" />
          <div>
            <h3 className="font-medium text-primary">Business Feasibility</h3>
            <p className="text-sm text-gray-600">Analyze profitability and break-even points</p>
          </div>
        </div>

        <div className="bg-cream p-4 rounded-lg flex items-start">
          <BarChart3 className="text-primary mt-1 mr-3 h-5 w-5" />
          <div>
            <h3 className="font-medium text-primary">Demand Forecasting</h3>
            <p className="text-sm text-gray-600">Predict future sales and market trends</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-sm text-gray-600 mb-3 text-center">Try asking about:</p>
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
        </div>
      </div>
    </div>
  );
}