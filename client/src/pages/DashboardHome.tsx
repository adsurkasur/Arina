import React, { useState } from "react";
import {
  LayoutDashboard,
  Lightbulb,
  History,
  Activity,
  MapPin,
  MessageSquare,
  UserCircle,
  Maximize,
  Bell,
  Calendar,
  TrendingUp,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  RefreshCw,
} from "lucide-react";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useChat } from "@/hooks/useChat";
import { useWeather } from "@/hooks/useWeather";

// Weather Widget Component
const WeatherWidget = () => {
  const { t } = useTranslation();
  const { weatherData, loading, error, refreshWeather } = useWeather();

  const getWeatherIcon = (condition: string) => {
    if (condition.includes('clear') || condition.includes('cerah')) return Sun;
    if (condition.includes('cloud') || condition.includes('awan')) return Cloud;
    if (condition.includes('rain') || condition.includes('hujan')) return Droplets;
    return Sun; // default
  };

  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.condition.toLowerCase()) : Sun;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Cloud className="mr-2 h-5 w-5" />
            {t('dashboard.weather')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center h-20">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Cloud className="mr-2 h-5 w-5" />
              {t('dashboard.weather')}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={refreshWeather}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <p className="text-sm opacity-90">Gagal memuat cuaca</p>
            <p className="text-xs opacity-75">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Cloud className="mr-2 h-5 w-5" />
            {t('dashboard.weather')}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={refreshWeather}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{weatherData?.temperature}°C</p>
            <p className="text-sm opacity-90 capitalize">{weatherData?.condition}</p>
            {weatherData?.location && (
              <p className="text-xs opacity-75">{weatherData.location}</p>
            )}
          </div>
          <WeatherIcon className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center">
            <Thermometer className="h-3 w-3 mr-1" />
            <span>{weatherData?.highTemp}°/{weatherData?.lowTemp}°</span>
          </div>
          <div className="flex items-center">
            <Droplets className="h-3 w-3 mr-1" />
            <span>{weatherData?.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="h-3 w-3 mr-1" />
            <span>{weatherData?.windSpeed} km/h</span>
          </div>
        </div>
        <div className="text-xs opacity-75 text-center">
          Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Action Widget
const QuickActionsWidget = ({ onActionClick }: { onActionClick: (action: string) => void }) => {
  const { t } = useTranslation();
  const actions = [
    { id: 'plantAnalysis', label: 'Analisis Tanaman', icon: Activity, color: 'bg-green-500' },
    { id: 'soilAnalysis', label: 'Analisis Tanah', icon: MapPin, color: 'bg-brown-500' },
    { id: 'pestAnalysis', label: 'Analisis Hama', icon: History, color: 'bg-red-500' },
    { id: 'chat', label: 'Chat AI', icon: MessageSquare, color: 'bg-blue-500' },
  ];

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform"
              onClick={() => onActionClick(action.id)}
            >
              <action.icon className={`h-6 w-6 text-white p-1 rounded ${action.color}`} />
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Farm Stats Widget
const FarmStatsWidget = ({ analysisResults }: { analysisResults: any[] }) => {
  const { t } = useTranslation();
  const totalAnalyses = analysisResults?.length || 0;
  const healthyPlants = Math.floor(totalAnalyses * 0.8);
  const healthPercentage = totalAnalyses > 0 ? (healthyPlants / totalAnalyses) * 100 : 0;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
          {t('dashboard.farmHealth')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Kesehatan Tanaman</span>
          <Badge variant={healthPercentage > 80 ? "default" : "destructive"}>
            {healthPercentage.toFixed(0)}%
          </Badge>
        </div>
        <Progress value={healthPercentage} className="h-2" />
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-500">{healthyPlants}</p>
            <p className="text-xs text-gray-500">Tanaman Sehat</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500">{totalAnalyses - healthyPlants}</p>
            <p className="text-xs text-gray-500">Perlu Perhatian</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity Widget
const RecentActivityWidget = ({ analysisResults }: { analysisResults: any[] }) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <History className="mr-2 h-5 w-5 text-blue-500" />
          {t('dashboard.recentActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analysisResults?.slice(0, 4).map((analysis, index) => (
            <div key={analysis.id || index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {analysis.data?.name || analysis.type || 'Analisis'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {analysis.type?.replace('_', ' ') || 'Unknown'}
              </Badge>
            </div>
          )) || (
            <p className="text-sm text-gray-500 text-center py-4">
              {t('dashboard.noRecentActivity')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { analysisResults, loading: analysisLoading, error: analysisError } = useAnalysisHistory();
  const { recommendations: recommendationSets, loading: recommendationsLoading } = useRecommendations();
  const { conversations, activeConversation } = useChat();
  const [isMainFeatureFullScreen, setIsMainFeatureFullScreen] = useState(false);

  const handleToolSelect = (tool: string) => {
    console.log("Selected tool:", tool);
    // Add navigation logic here
  };

  const handleQuickAction = (action: string) => {
    console.log("Quick action:", action);
    // Handle quick actions
  };

  const totalRecommendations = recommendationSets ? 
    recommendationSets.reduce((acc, set) => acc + (set?.items?.length || 0), 0) : 0;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'Farmer'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Weather Widget */}
          <WeatherWidget />
          
          {/* Farm Stats Widget */}
          <FarmStatsWidget analysisResults={analysisResults || []} />
          
          {/* Total Analyses Card */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Analisis</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analysisResults?.length || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rekomendasi</p>
                  <p className="text-3xl font-bold text-green-600">{totalRecommendations}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row - Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Feature Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white h-96">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{t('dashboard.mainFeatureArea')}</CardTitle>
                  <CardDescription>Analisis dan Rekomendasi Utama</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMainFeatureFullScreen(!isMainFeatureFullScreen)}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {recommendationsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">{t('common.loading')}</p>
                  </div>
                ) : (
                  <RecommendationsList />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <QuickActionsWidget onActionClick={handleQuickAction} />
        </div>

        {/* Bottom Row - Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivityWidget analysisResults={analysisResults || []} />
          
          {/* Farm Location Map */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-red-500" />
                {t('dashboard.farmLocation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{t('dashboard.mapPlaceholder')}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Lihat Peta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isMainFeatureFullScreen && (
        <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('dashboard.mainFeatureArea')}</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMainFeatureFullScreen(false)}
            >
              <LayoutDashboard className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <RecommendationsList />
          </div>
        </div>
      )}
    </div>
  );
}