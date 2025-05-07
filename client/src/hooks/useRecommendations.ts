import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';
import { RecommendationSet, RecommendationItem, GenerateRecommendationsParams } from '@/types/recommendations';
import { useToast } from './use-toast';

export function useRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<(RecommendationSet & { items: RecommendationItem[] })[]>([]);

  const fetchRecommendations = useCallback(async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      // Using the proper types to avoid TypeScript errors
      const response = await fetch(`/api/recommendations/${user.id}`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json() as (RecommendationSet & { items: RecommendationItem[] })[];
      setRecommendations(data);
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Failed to load recommendations',
        description: 'Could not retrieve your personalized recommendations.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const generateRecommendations = useCallback(async (params: Omit<GenerateRecommendationsParams, 'userId'>) => {
    if (!user) return null;
    
    try {
      setGenerating(true);
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          ...params
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json() as (RecommendationSet & { items: RecommendationItem[] });
      
      setRecommendations(prev => [data, ...prev]);
      
      toast({
        title: 'Recommendations Generated',
        description: 'New personalized recommendations are ready for you.',
      });
      
      return data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Failed to Generate Recommendations',
        description: 'An error occurred while creating recommendations.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setGenerating(false);
    }
  }, [user, toast]);

  const deleteRecommendationSet = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/recommendations/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recommendation set');
      }
      
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
      
      toast({
        title: 'Recommendations Deleted',
        description: 'The recommendation set has been removed.',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      toast({
        title: 'Failed to Delete Recommendations',
        description: 'An error occurred while deleting the recommendations.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return {
    recommendations,
    loading,
    generating,
    fetchRecommendations,
    generateRecommendations,
    deleteRecommendationSet,
  };
}