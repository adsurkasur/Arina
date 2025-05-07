import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { RecommendationSet, RecommendationItem } from "@/types/recommendations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function RecommendationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<(RecommendationSet & { items: RecommendationItem[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>(
    // Simple logic to determine current season in Northern hemisphere
    () => {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'fall';
      return 'winter';
    }
  );

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await apiRequest(`/api/recommendations/${user.id}`, { method: 'GET' });
      setRecommendations(data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast({
        title: "Failed to load recommendations",
        description: "An error occurred while loading your recommendations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!user) return;
    
    try {
      setGenerating(true);
      const data = await apiRequest('/api/recommendations/generate', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          currentSeason
        })
      });
      
      // Add new recommendation set to the list
      setRecommendations(prev => [data, ...prev]);
      
      toast({
        title: "Recommendations generated",
        description: "New recommendations have been created based on your data.",
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Failed to generate recommendations",
        description: "An error occurred while creating new recommendations.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const deleteRecommendationSet = async (id: string) => {
    try {
      await apiRequest(`/api/recommendations/${id}`, { method: 'DELETE' });
      setRecommendations(prev => prev.filter(set => set.id !== id));
      
      toast({
        title: "Recommendations deleted",
        description: "The recommendation set has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting recommendation set:", error);
      toast({
        title: "Failed to delete recommendations",
        description: "An error occurred while deleting the recommendation set.",
        variant: "destructive",
      });
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'analysis': return 'bg-blue-100 text-blue-800';
      case 'chat': return 'bg-purple-100 text-purple-800';
      case 'pattern': return 'bg-orange-100 text-orange-800';
      case 'seasonal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'crop': return 'bg-green-100 text-green-800';
      case 'business': return 'bg-blue-100 text-blue-800';
      case 'resource': return 'bg-amber-100 text-amber-800';
      case 'market': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-blue-100 text-blue-800';
    if (confidence >= 0.4) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Personalized Recommendations</h2>
          <p className="text-gray-600">
            Custom insights based on your analysis results and interaction history
          </p>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={generating}
          className="bg-primary hover:bg-primary/90"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Recommendations
            </>
          )}
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card className="p-6 text-center">
          <h3 className="text-lg font-medium">No recommendations yet</h3>
          <p className="text-gray-600 mt-2">
            Generate your first set of personalized recommendations based on your data.
          </p>
          <Button 
            onClick={generateRecommendations} 
            variant="outline" 
            className="mt-4"
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Recommendations"}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {recommendations.map((recSet) => (
            <Card key={recSet.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">
                      {new Date(recSet.created_at).toLocaleDateString()}
                    </span>
                    <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">
                      {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Season
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mt-2">Agricultural Insights</h3>
                  <p className="text-gray-700 mt-1">{recSet.summary}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteRecommendationSet(recSet.id)}
                >
                  <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500" />
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {recSet.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800">{item.title}</h4>
                      <div className="flex space-x-2">
                        <span className={`text-xs rounded-full px-2 py-1 ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span className={`text-xs rounded-full px-2 py-1 ${getSourceColor(item.source)}`}>
                          {item.source}
                        </span>
                        <span className={`text-xs rounded-full px-2 py-1 ${getConfidenceColor(parseFloat(item.confidence))}`}>
                          {Math.round(parseFloat(item.confidence) * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}