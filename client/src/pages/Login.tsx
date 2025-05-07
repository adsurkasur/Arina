import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

export default function Login() {
  const { isAuthenticated, isLoading, setShowAuthModal } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show the login/register modal
  const handleOpenAuthModal = () => {
    setShowAuthModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="bg-primary text-white p-4 rounded-full">
              <Sprout className="h-12 w-12" />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-heading font-bold text-primary sm:text-5xl">
            Welcome to Arina
          </h1>
          <p className="mt-2 text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI-powered platform for agricultural business analysis, forecasting, and optimization.
          </p>
          
          <div className="mt-8">
            <Button
              onClick={handleOpenAuthModal}
              size="lg"
              className="px-8 bg-primary hover:bg-primary/90 text-lg"
            >
              Sign In / Register
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-primary">Powerful Features</h2>
            <p className="mt-2 text-lg text-gray-600">Designed to help farmers make smart business decisions.</p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-cream rounded-lg p-6 shadow-md tool-card">
                <div className="flex items-start mb-4">
                  <div className="bg-primary text-white p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-xl font-medium text-primary">Business Feasibility</h3>
                </div>
                <p className="text-gray-600">Analyze profitability, calculate break-even points, and determine ROI for your agricultural ventures.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-cream rounded-lg p-6 shadow-md tool-card">
                <div className="flex items-start mb-4">
                  <div className="bg-primary text-white p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-xl font-medium text-primary">Demand Forecasting</h3>
                </div>
                <p className="text-gray-600">Predict future sales and market trends using advanced statistical methods like SMA and exponential smoothing.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-cream rounded-lg p-6 shadow-md tool-card">
                <div className="flex items-start mb-4">
                  <div className="bg-primary text-white p-2 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-xl font-medium text-primary">Optimization Analysis</h3>
                </div>
                <p className="text-gray-600">Maximize profits, minimize costs, and solve complex multi-objective problems with linear programming techniques.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images Banner */}
      <div className="py-8 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto py-4">
            <img 
              src="https://cdn.pixabay.com/photo/2016/11/08/05/50/agriculture-1807549_1280.jpg" 
              alt="Modern farming technology with drone" 
              className="h-48 w-auto object-cover rounded-lg shadow-md" 
            />
            <img 
              src="https://cdn.pixabay.com/photo/2016/11/14/03/29/farmer-1822530_1280.jpg" 
              alt="Agricultural business analysis" 
              className="h-48 w-auto object-cover rounded-lg shadow-md" 
            />
            <img 
              src="https://cdn.pixabay.com/photo/2016/11/08/05/54/agriculture-1807581_1280.jpg" 
              alt="Farming optimization" 
              className="h-48 w-auto object-cover rounded-lg shadow-md" 
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center">
              <Sprout className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-heading font-bold text-primary">Arina</span>
            </div>
            <p className="mt-4 text-gray-500 text-sm">
              © {new Date().getFullYear()} Arina. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
