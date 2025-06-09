import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const dummyNews = [
  {
    title: "Rice Prices Hit New Highs in June",
    excerpt: "The price of rice has increased by 5% due to supply chain disruptions and high demand.",
    date: "2025-06-10",
    category: "Prices",
    urgency: "high",
    source: "BPS"
  },
  {
    title: "Government Launches New Subsidy for Corn Farmers",
    excerpt: "A new subsidy program aims to boost corn production and stabilize prices.",
    date: "2025-06-08",
    category: "Policy",
    urgency: "medium",
    source: "Ministry of Agriculture"
  },
  {
    title: "Heavy Rains Expected Next Week",
    excerpt: "BMKG forecasts above-average rainfall in major agricultural regions.",
    date: "2025-06-07",
    category: "Weather",
    urgency: "medium",
    source: "BMKG"
  },
  {
    title: "Chili Stocks Sufficient for Eid Season",
    excerpt: "National stocks of chili are reported to be stable ahead of the festive season.",
    date: "2025-06-05",
    category: "Stocks",
    urgency: "low",
    source: "Bulog"
  },
  {
    title: "New Technology for Smart Irrigation Introduced",
    excerpt: "IoT-based irrigation systems are being piloted in several provinces.",
    date: "2025-06-03",
    category: "Technology",
    urgency: "low",
    source: "Kementerian Pertanian"
  }
];

const categoryColors: Record<string, string> = {
  Prices: "bg-green-100 text-green-800 border-green-200",
  Policy: "bg-blue-100 text-blue-800 border-blue-200",
  Weather: "bg-cyan-100 text-cyan-800 border-cyan-200",
  Stocks: "bg-amber-100 text-amber-800 border-amber-200",
  Technology: "bg-purple-100 text-purple-800 border-purple-200"
};

const urgencyIcon = (urgency: string) => {
  if (urgency === "high") return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (urgency === "medium") return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return null;
};

export default function DashboardNews() {
  const { t } = useTranslation();
  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="m-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-blue-600" />
              {t('dashboard.newsTitle') || 'Agriculture News'}
            </CardTitle>
            <CardDescription>
              {t('dashboard.newsDescription') || 'Latest news and updates about agriculture.'}
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyNews.map((news, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {urgencyIcon(news.urgency)}
                  <Badge className={`text-xs border ${categoryColors[news.category] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>{news.category}</Badge>
                  <span className="text-xs text-gray-500">{news.source}</span>
                </div>
                <h4 className="font-semibold text-base mb-1 line-clamp-2">{news.title}</h4>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{news.excerpt}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{new Date(news.date).toLocaleDateString('id-ID')}</span>
                  <a href="#" className="text-blue-600 text-xs flex items-center gap-1 group-hover:underline">
                    <ExternalLink className="h-3 w-3" />
                    {t('dashboard.readMore') || 'Read more'}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
