import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  LayoutDashboard, Lightbulb, History, Activity, MapPin, Maximize, Bell, Calendar,
  Cloud, Thermometer, Droplets, Wind, Sun, RefreshCw, Navigation, Layers, Satellite,
  Newspaper, TrendingUp, Bot, ExternalLink, ChevronRight, AlertTriangle, BarChart3,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useWeather } from "@/hooks/useWeather";

// Types
interface AgricultureNews {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  date: string;
  category: 'harga' | 'cuaca' | 'teknologi' | 'kebijakan' | 'penyakit';
  urgency: 'low' | 'medium' | 'high';
}

interface BPSData {
  indicator: string;
  value: number;
  unit: string;
  change: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

// Mock Data
const mockNews: AgricultureNews[] = [
  {
    id: '1',
    title: 'Harga Gabah Naik 5% di Jawa Barat',
    excerpt: 'Kenaikan harga gabah dipicu oleh tingginya permintaan dan cuaca yang mendukung panen.',
    source: 'BPS',
    date: '2025-05-30',
    category: 'harga',
    urgency: 'medium',
  },
  {
    id: '2',
    title: 'Prediksi Curah Hujan Tinggi Minggu Depan',
    excerpt: 'BMKG memprediksi curah hujan tinggi akan terjadi di wilayah Jawa dan Sumatra.',
    source: 'BMKG',
    date: '2025-05-29',
    category: 'cuaca',
    urgency: 'high',
  },
  {
    id: '3',
    title: 'Teknologi Drone untuk Monitoring Tanaman',
    excerpt: 'Pemerintah meluncurkan program bantuan drone untuk membantu petani memantau kondisi tanaman.',
    source: 'Kementerian Pertanian',
    date: '2025-05-28',
    category: 'teknologi',
    urgency: 'low',
  },
  {
    id: '4',
    title: 'Waspada Serangan Hama Wereng Coklat',
    excerpt: 'Dinas Pertanian mengeluarkan peringatan dini terkait potensi serangan hama wereng coklat.',
    source: 'Dinas Pertanian',
    date: '2025-05-27',
    category: 'penyakit',
    urgency: 'high',
  },
  {
    id: '5',
    title: 'Subsidi Pupuk Tahun 2025 Naik 15%',
    excerpt: 'Pemerintah mengumumkan kenaikan subsidi pupuk untuk mendukung produktivitas petani.',
    source: 'Kementerian Pertanian',
    date: '2025-05-26',
    category: 'kebijakan',
    urgency: 'medium',
  }
];

const mockBPSData: BPSData[] = [
  { indicator: 'Harga Gabah', value: 5850, unit: 'Rp/kg', change: 2.5, period: 'Mei 2025', trend: 'up' },
  { indicator: 'Luas Panen', value: 2.8, unit: 'juta ha', change: -1.2, period: 'Mei 2025', trend: 'down' },
  { indicator: 'Produktivitas', value: 5.2, unit: 'ton/ha', change: 0.8, period: 'Mei 2025', trend: 'up' },
  { indicator: 'Curah Hujan', value: 250, unit: 'mm', change: 15.5, period: 'Mei 2025', trend: 'up' },
  { indicator: 'Harga Pupuk', value: 2850, unit: 'Rp/kg', change: -3.2, period: 'Mei 2025', trend: 'down' },
];

// Utility functions
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    harga: 'bg-green-100 text-green-800 border-green-200',
    cuaca: 'bg-blue-100 text-blue-800 border-blue-200',
    teknologi: 'bg-purple-100 text-purple-800 border-purple-200',
    kebijakan: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    penyakit: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getUrgencyIcon = (urgency: string) => {
  if (urgency === 'high') return <AlertTriangle className="h-3 w-3 text-red-500" />;
  if (urgency === 'medium') return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
  return null;
};

const getTrendIcon = (trend: string) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
  return <TrendingUp className="h-4 w-4 text-gray-500" />;
};

// Custom scrollbar styles
const customScrollbarClass = `
  scrollbar-thin 
  scrollbar-track-transparent 
  scrollbar-thumb-gray-300 
  hover:scrollbar-thumb-gray-400 
  scrollbar-thumb-rounded-full
`;

// Weather Widget
const WeatherWidget = React.memo(() => {
  const { t } = useTranslation();
  const { weatherData, loading, error, refreshWeather } = useWeather();

  const WeatherIcon = weatherData?.condition?.includes('rain') ? Droplets : 
                     weatherData?.condition?.includes('cloud') ? Cloud : Sun;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-gray-400 to-gray-600 text-white h-full">
        <CardContent className="p-6 text-center h-full flex flex-col justify-center">
          <p className="text-sm mb-2">Gagal memuat cuaca</p>
          <Button variant="ghost" size="sm" onClick={refreshWeather} className="text-white">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <Cloud className="mr-2 h-5 w-5" />
            Cuaca {weatherData?.location || 'Jakarta'}
          </span>
          <Button variant="ghost" size="icon" onClick={refreshWeather} className="text-white h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{weatherData?.temperature || '30'}°C</p>
            <p className="text-sm opacity-90">{weatherData?.condition || 'Cerah'}</p>
          </div>
          <WeatherIcon className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center">
            <Thermometer className="h-3 w-3 mr-1" />
            {weatherData?.highTemp || '30'}°/{weatherData?.lowTemp || '20'}°
          </div>
          <div className="flex items-center">
            <Droplets className="h-3 w-3 mr-1" />
            {weatherData?.humidity || '65'}%
          </div>
          <div className="flex items-center">
            <Wind className="h-3 w-3 mr-1" />
            {weatherData?.windSpeed || '10'} km/h
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Farm Location Widget
const FarmLocationWidget = React.memo(() => {
  const [viewMode, setViewMode] = useState<'map' | 'satellite'>('map');

  return (
    <Card className="bg-white shadow-lg h-[400px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-green-600" />
            Lokasi Lahan
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="h-7 text-xs"
            >
              <Layers className="h-3 w-3 mr-1" />
              Peta
            </Button>
            <Button
              variant={viewMode === 'satellite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('satellite')}
              className="h-7 text-xs"
            >
              <Satellite className="h-3 w-3 mr-1" />
              Satelit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-3">
        {/* Map Area */}
        <div className="relative flex-1 bg-gradient-to-br from-green-100 to-green-200 rounded-xl overflow-hidden flex flex-col">
          {/* Peta */}
          <div className="absolute inset-0">
            <OpenStreetMap className="w-full h-full" height="100%" />
          </div>
          {/* Overlay Pin di tengah peta */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <MapPin className="h-12 w-12 text-green-600 animate-bounce drop-shadow-lg" />
          </div>
          {/* Info lahan di bawah peta */}
          <div className="absolute bottom-0 left-0 w-full bg-white/80 py-2 px-4 rounded-b-xl text-center border-t border-green-100 z-10">
            <p className="font-semibold text-green-800">Lahan Pertanian</p>
            <p className="text-sm text-green-600">2.5 Hektar</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">2.5</p>
            <p className="text-xs text-gray-600">Hektar</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-600">4</p>
            <p className="text-xs text-gray-600">Blok</p>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <p className="text-lg font-bold text-orange-600">85%</p>
            <p className="text-xs text-gray-600">Produktif</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Agriculture Insights Widget
const AgricultureInsightsWidget = React.memo(() => {
  const [activeTab, setActiveTab] = useState('news');
  const [selectedNews, setSelectedNews] = useState<AgricultureNews | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');

  const handleGetAISolution = useCallback((news: AgricultureNews) => {
    setSelectedNews(news);
    setAiLoading(true);
    
    setTimeout(() => {
      const recommendations = {
        harga: 'Manfaatkan kenaikan harga dengan strategi penjualan bertahap dan perencanaan tanam berikutnya.',
        cuaca: 'Pastikan drainase optimal, tingkatkan monitoring penyakit, dan tunda pemupukan nitrogen.',
        penyakit: 'Lakukan monitoring rutin setiap 3 hari dan gunakan pestisida jika diperlukan.',
        kebijakan: 'Manfaatkan program pemerintah dengan mendaftar melalui dinas pertanian setempat.',
        teknologi: 'Ikuti pelatihan teknologi pertanian untuk meningkatkan produktivitas.',
      };
      setAiRecommendation(recommendations[news.category] || 'Konsultasi dengan penyuluh pertanian setempat.');
      setAiLoading(false);
    }, 1500);
  }, []);

  if (selectedNews && aiRecommendation) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h4 className="font-semibold text-lg">Solusi AI</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedNews(null);
              setAiRecommendation('');
            }}
            className="h-8"
          >
            Kembali
          </Button>
        </div>
        
        <div className={`flex-1 overflow-y-auto ${customScrollbarClass}`}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{selectedNews.title}</CardTitle>
              <Badge className={getCategoryColor(selectedNews.category)}>
                {selectedNews.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aiRecommendation}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
          <TabsTrigger value="news" className="text-xs">
            <Newspaper className="h-3 w-3 mr-1" />
            Berita
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="news" className="flex-1 overflow-hidden mt-0">
          <div className={`h-full overflow-y-auto space-y-2 pr-1 ${customScrollbarClass}`}>
            {mockNews.map((news) => (
              <Card key={news.id} className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getUrgencyIcon(news.urgency)}
                        <Badge className={`text-xs ${getCategoryColor(news.category)}`}>
                          {news.category}
                        </Badge>
                        <span className="text-xs text-gray-500 truncate">{news.source}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-2 leading-tight line-clamp-2">
                        {news.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {news.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(news.date).toLocaleDateString('id-ID')}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGetAISolution(news)}
                          disabled={aiLoading}
                          className="h-6 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {aiLoading ? (
                            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Bot className="h-3 w-3 mr-1" />
                          )}
                          AI
                        </Button>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="flex-1 overflow-hidden mt-0">
          <div className={`h-full overflow-y-auto space-y-2 pr-1 ${customScrollbarClass}`}>
            {mockBPSData.map((data, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-sm">{data.indicator}</h4>
                        {getTrendIcon(data.trend)}
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-blue-600">
                          {data.value.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-gray-500">{data.unit}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={data.change > 0 ? "default" : "destructive"} className="text-xs">
                          {data.change > 0 ? '+' : ''}{data.change}%
                        </Badge>
                        <span className="text-xs text-gray-500">{data.period}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outline" size="sm" className="w-full h-8 mt-3">
              <ExternalLink className="h-3 w-3 mr-2" />
              Lihat Data Lengkap
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

// Recent Activity Widget
const RecentActivityWidget = React.memo(({ analysisResults }: { analysisResults: any[] }) => {
  const recentActivities = analysisResults?.slice(0, 6) || [];

  return (
    <Card className="h-64">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <History className="mr-2 h-5 w-5 text-blue-500" />
          Aktivitas Terkini
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full pb-6">
        {recentActivities.length > 0 ? (
          <div className={`h-full overflow-y-auto space-y-2 pr-1 ${customScrollbarClass}`}>
            {recentActivities.map((analysis, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {analysis.data?.name || analysis.type || 'Analisis'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(analysis.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {analysis.type?.replace('_', ' ') || 'Unknown'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Belum ada aktivitas</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Komponen OpenStreetMap
export const OpenStreetMap: React.FC<{ height?: string; className?: string }> = ({
  height = "200px",
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let marker: any;

    // Dynamic import agar SSR aman
    import("leaflet").then(L => {
      // Hapus map sebelumnya jika ada
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        (mapRef.current as any)._leaflet_id = null;
      }

      // Default ke Jakarta
      const defaultLatLng: [number, number] = [-6.2088, 106.8456];

      // Inisialisasi map
      map = L.map(mapRef.current!).setView(defaultLatLng, 13);

      L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        crossOrigin: true,
      }).addTo(map);

      // Ambil lokasi sekarang
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            map.setView(latlng, 15);
            marker = L.marker(latlng).addTo(map)
              .bindPopup("Lokasi Anda Sekarang").openPopup();
          },
          () => {
            // Jika gagal, tetap di default
            marker = L.marker(defaultLatLng).addTo(map)
              .bindPopup("Lokasi Default (Jakarta)").openPopup();
          }
        );
      } else {
        marker = L.marker(defaultLatLng).addTo(map)
          .bindPopup("Lokasi Default (Jakarta)").openPopup();
      }
    });

    // Cleanup
    return () => {
      if (mapRef.current && mapRef.current.innerHTML) {
        mapRef.current.innerHTML = "";
      }
      if (map && map.remove) map.remove();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: "100%", height, borderRadius: 12, overflow: "hidden" }}
    />
  );
};

// Main Dashboard Component
export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { analysisResults, isLoading: analysisLoading } = useAnalysisHistory();
  const { recommendations: recommendationSets } = useRecommendations();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const userName = user?.name?.split(' ')[0] || 'Farmer';
  const currentDate = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const totalRecommendations = useMemo(() => 
    recommendationSets ? 
      recommendationSets.reduce((acc, set) => acc + (set?.items?.length || 0), 0) : 12,
    [recommendationSets]
  );

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Selamat datang, {userName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">{currentDate}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Calendar className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-6 overflow-y-auto ${customScrollbarClass}`}>
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <WeatherWidget />
          
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col justify-center">
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

          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col justify-center">
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

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FarmLocationWidget />
          
          <Card className="bg-white shadow-md h-[400px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 flex-shrink-0">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Newspaper className="mr-2 h-5 w-5 text-blue-600" />
                  Info & Data Pertanian
                </CardTitle>
                <CardDescription className="text-sm">Berita terkini dengan solusi AI</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(true)} className="h-8 w-8">
                <Maximize className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pb-6">
              <AgricultureInsightsWidget />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <RecentActivityWidget analysisResults={analysisResults || []} />
      </div>

      {/* Fullscreen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold flex items-center">
              <Newspaper className="mr-3 h-8 w-8 text-blue-600" />
              Info & Data Pertanian
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)}>
              <LayoutDashboard className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AgricultureInsightsWidget />
          </div>
        </div>
      )}

    </div>
  );
}