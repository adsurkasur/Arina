The code adds tooltips to recommendation fields by importing necessary UI components and integrating them into the RecommendationsList component.
```
```replit_final_file
import React, { useState } from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, Calendar, Trash2, Lightbulb,
  BarChart4, TrendingUp, ShoppingCart, Leaf, 
  AlertCircle, Info
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RecommendationsList() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('all');
  const [currentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>(
    () => {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'fall';
      return 'winter';
    }
  );

  const {
    recommendations,
    loading,
    generating,
    fetchRecommendations,
    generateRecommendations,
    deleteRecommendationSet
  } = useRecommendations();

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Please sign in to view recommendations</p>
        </CardContent>
      </Card>
    );
  }

  const handleGenerate = () => {
    generateRecommendations({ currentSeason });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recommendation set?')) {
      deleteRecommendationSet(id);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'analysis':
        return <BarChart4 className="h-4 w-4 text-blue-500" />;
      case 'chat':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'pattern':
        return <ShoppingCart className="h-4 w-4 text-purple-500" />;
      case 'seasonal':
        return <Leaf className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <BarChart4 className="h-4 w-4" />;
      case 'market':
        return <TrendingUp className="h-4 w-4" />;
      case 'resource':
        return <ShoppingCart className="h-4 w-4" />;
      case 'crop':
        return <Leaf className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getConfidenceBadgeColor = (confidence: string | number) => {
    const confidenceValue = typeof confidence === 'string' ? parseFloat(confidence) : confidence;
    if (confidenceValue >= 0.8) return "bg-green-100 text-green-800 border-green-300";
    if (confidenceValue >= 0.6) return "bg-blue-100 text-blue-800 border-blue-300";
    if (confidenceValue >= 0.4) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  // Filter recommendations based on the active tab
  const filteredRecommendations = recommendations.filter(set => {
    if (currentTab === 'all') return true;
    return set.items.some(item => item.type === currentTab);
  });

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Button 
          onClick={handleGenerate} 
          disabled={generating}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {generating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Recommendations
            </>
          )}
        </Button>

        <Badge variant="outline" className="flex items-center gap-1 ml-2">
          <Calendar className="h-3 w-3" />
          <span className="capitalize">{currentSeason}</span>
        </Badge>
      </div>

      {/* Tabs for filtering recommendations */}
      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="crop">Crops</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-4">
          {loading ? (
            // Loading state
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            // Empty state
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <Lightbulb className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No recommendations available yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Generate recommendations based on your data and chat history
                </p>
                <Button 
                  onClick={handleGenerate} 
                  disabled={generating}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {generating ? "Generating..." : "Generate Now"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Recommendation sets
            <div className="space-y-6">
              {filteredRecommendations.map(set => (
                <Card key={set.id} className="overflow-hidden">
                  <CardHeader className="pb-2 bg-cream/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-medium text-primary">
                          {set.summary}
                        </CardTitle>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(set.created_at), 'MMM d, yyyy')}
                          </span>
                          <span>•</span>
                          <span>{set.items.length} recommendations</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(set.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 pb-2">
                    <div className="space-y-4">
                      {set.items.map(item => (
                        <div
                          key={item.id}
                          className="p-3 border border-gray-100 rounded-md hover:border-gray-200 transition-colors bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getSourceIcon(item.source)}</span>
                              <h4 className="font-medium text-primary">{item.title}</h4>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={getConfidenceBadgeColor(item.confidence)}
                            >
                              {Math.round(typeof item.confidence === 'string' 
                                ? parseFloat(item.confidence) * 100 
                                : item.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                          <div className="flex items-center mt-3 justify-between">
                          <Tooltip>
                              <TooltipTrigger>
                                  <Badge variant="secondary" className="capitalize flex items-center gap-1">
                                      {item.type}
                                      <Info className="h-3 w-3" />
                                  </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>Type of recommendation: {item.type}</p>
                              </TooltipContent>
                          </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="bg-cream/5 pt-3 pb-3 px-6 text-xs text-muted-foreground">
                    <p>
                      Recommendations based on your historical data and agricultural conditions.
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}