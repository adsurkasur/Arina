import { useState, useEffect } from 'react';
import { X, RefreshCw, Calendar, Trash2, Lightbulb } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { RecommendationSet, RecommendationItem } from '@/types/recommendations';

interface RecommendationDashboardProps {
  onClose?: () => void;
}

export default function RecommendationDashboard({ onClose }: RecommendationDashboardProps) {
  const { toast } = useToast();
  const { 
    recommendations, 
    loading, 
    generating, 
    fetchRecommendations, 
    generateRecommendations, 
    deleteRecommendationSet 
  } = useRecommendations();
  const [selectedTab, setSelectedTab] = useState('all');
  const [currentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>(
    () => {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'fall';
      return 'winter';
    }
  );

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleGenerateRecommendations = async () => {
    try {
      await generateRecommendations({ currentSeason });
      toast({
        title: 'Recommendations Generated',
        description: 'New insights based on your data have been created.',
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    try {
      await deleteRecommendationSet(id);
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    const confidenceNum = parseFloat(confidence);
    if (confidenceNum >= 0.8) return 'bg-green-100 text-green-800';
    if (confidenceNum >= 0.6) return 'bg-blue-100 text-blue-800';
    if (confidenceNum >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'analysis':
        return '📊';
      case 'chat':
        return '💬';
      case 'pattern':
        return '📈';
      case 'seasonal':
        return '🌱';
      default:
        return '💡';
    }
  };

  // Filter recommendations by type if a specific tab is selected
  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedTab === 'all') return true;
    return rec.items.some(item => item.type === selectedTab);
  });

  return (
    <div className="h-full overflow-y-auto bg-white p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Lightbulb size={24} />
          <span>Smart Recommendations</span>
        </h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <p className="text-muted-foreground mt-1 mb-4">
        AI-generated insights based on your agricultural data, chat history, and analysis.
      </p>
      
      <div className="flex items-center gap-2 mb-6 mt-4">
        <Button 
          onClick={handleGenerateRecommendations} 
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
              Generate New Recommendations
            </>
          )}
        </Button>
        
        <Badge variant="outline" className="flex items-center gap-1 ml-2">
          <Calendar className="h-3 w-3" />
          <span className="capitalize">{currentSeason}</span>
        </Badge>
      </div>
      
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="crop">Crops</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Card key={n} className="mb-6">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="text-center py-10 bg-cream/30 rounded-lg">
          <Lightbulb className="mx-auto h-10 w-10 text-primary/50 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No recommendations yet</h3>
          <p className="text-muted-foreground mb-4">
            Generate your first set of personalized recommendations
          </p>
          <Button 
            onClick={handleGenerateRecommendations} 
            disabled={generating}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {generating ? 'Generating...' : 'Generate Recommendations'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRecommendations.map((recSet) => (
            <Card key={recSet.id} className="mb-6 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{recSet.summary}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(recSet.created_at)}</span>
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteRecommendation(recSet.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recSet.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="border rounded-md p-4 bg-cream/10 hover:bg-cream/30 transition-colors"
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
                          {Math.round(parseFloat(item.confidence) * 100)}%
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                      <div className="flex items-center mt-3 justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-cream/20 pt-3 pb-3 px-6 text-xs text-muted-foreground">
                <p>
                  Recommendations based on your historical data and current agricultural conditions.
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}