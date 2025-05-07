import React, { useState } from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart4, TrendingUp, ShoppingCart, Leaf, 
  AlertCircle, Calendar, RefreshCw, Trash2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';

export function RecommendationsList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [season, setSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('spring');
  
  const {
    recommendationSets,
    isLoadingSets,
    selectedSet,
    setSelectedSetId,
    isLoadingSelectedSet,
    generateRecommendations,
    isGenerating,
    deleteRecommendation,
    isDeleting
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
    generateRecommendations(season);
  };

  const handleDelete = (setId: string) => {
    if (window.confirm('Are you sure you want to delete this recommendation set?')) {
      deleteRecommendation(setId);
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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'analysis':
        return 'Analysis';
      case 'chat':
        return 'Chat';
      case 'pattern':
        return 'Pattern';
      case 'seasonal':
        return 'Seasonal';
      default:
        return source;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'business':
        return 'Business';
      case 'market':
        return 'Market';
      case 'resource':
        return 'Resource';
      case 'crop':
        return 'Crop';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'market':
        return 'bg-purple-100 text-purple-800';
      case 'resource':
        return 'bg-amber-100 text-amber-800';
      case 'crop':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-gray-600';
  };

  const filterItemsByType = (items: any[] = [], type: string) => {
    if (type === 'all') return items;
    return items.filter(item => item.type === type);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-semibold text-primary">Recommendations</h2>
        
        <div className="flex space-x-2">
          <Select value={season} onValueChange={(value: any) => setSeason(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !user?.id}
            className="flex items-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoadingSets ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading recommendation sets...</p>
          </CardContent>
        </Card>
      ) : recommendationSets && recommendationSets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendationSets.map((set) => (
            <Card key={set.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-heading">{
                    set.summary.length > 70 
                      ? set.summary.substring(0, 70) + "..." 
                      : set.summary
                  }</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(set.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </Button>
                </div>
                <CardDescription>
                  <Calendar className="inline-block mr-1 h-3 w-3" />
                  {format(new Date(set.created_at), 'MMM d, yyyy')}
                  <span className="mx-1">•</span>
                  {set.items.length} recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setSelectedSetId(set.id)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3 py-6">
              <p className="text-gray-500">No recommendation sets found.</p>
              <p className="text-sm text-gray-400">
                Generate recommendations based on your chat history and analysis results.
              </p>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !user?.id}
                className="mt-4"
              >
                Generate Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Recommendation Set Detail */}
      {selectedSet && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-heading">{selectedSet.summary}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedSetId(null)}
              >
                Close
              </Button>
            </div>
            <CardDescription>
              Created on {format(new Date(selectedSet.created_at), 'MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="resource">Resource</TabsTrigger>
                <TabsTrigger value="crop">Crop</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {isLoadingSelectedSet ? (
                      <p className="text-center text-gray-500">Loading recommendations...</p>
                    ) : filterItemsByType(selectedSet.items, activeTab).length > 0 ? (
                      filterItemsByType(selectedSet.items, activeTab).map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <div className={`h-1 ${getTypeColor(item.type).split(' ')[0]}`}></div>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded-full ${getTypeColor(item.type)}`}>
                                  {getTypeIcon(item.type)}
                                </div>
                                <CardTitle className="text-base font-medium">
                                  {item.title}
                                </CardTitle>
                              </div>
                              <Badge variant="outline">
                                {getSourceLabel(item.source)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-sm text-gray-700">
                              {item.description}
                            </p>
                          </CardContent>
                          <CardFooter className="pt-0 pb-3 flex justify-between items-center">
                            <Badge variant="outline" className={getTypeColor(item.type)}>
                              {getTypeLabel(item.type)}
                            </Badge>
                            <p className={`text-xs ${getConfidenceColor(item.confidence)}`}>
                              Confidence: {Math.round(item.confidence * 100)}%
                            </p>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        No {activeTab !== 'all' ? activeTab : ''} recommendations found.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}