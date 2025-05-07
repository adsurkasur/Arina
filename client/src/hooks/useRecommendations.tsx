import { useState } from 'react';
import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import {
  getRecommendations,
  getRecommendationSet,
  generateRecommendations,
  deleteRecommendation
} from '@/lib/supabase';
import { useAuth } from './useAuth';

type RecommendationItem = {
  id: string;
  type: 'crop' | 'business' | 'resource' | 'market';
  title: string;
  description: string;
  confidence: number;
  data: any;
  source: 'analysis' | 'chat' | 'pattern' | 'seasonal';
  created_at: string;
};

type RecommendationSet = {
  id: string;
  user_id: string;
  summary: string;
  created_at: string;
  items: RecommendationItem[];
};

export function useRecommendations() {
  const { user } = useAuth();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  // Fetch all recommendation sets for the user
  const {
    data: recommendationSets,
    isLoading: isLoadingSets,
    refetch: refetchSets,
    error: setsError,
  } = useQuery<RecommendationSet[]>({
    queryKey: ['/api/recommendations', user?.id],
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => {
      return data || [];
    },
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await getRecommendations(user.id);
      if (error) throw error;
      return data;
    },
  });

  // Fetch a specific recommendation set
  const {
    data: selectedSet,
    isLoading: isLoadingSelectedSet,
    error: selectedSetError,
  }: UseQueryResult<RecommendationSet | null> = useQuery({
    queryKey: ['/api/recommendations/set', selectedSetId],
    enabled: !!selectedSetId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!selectedSetId) return null;
      const { data, error } = await getRecommendationSet(selectedSetId);
      if (error) throw error;
      return data;
    },
  });

  // Generate new recommendations
  const generateMutation = useMutation({
    mutationFn: async (season?: 'spring' | 'summer' | 'fall' | 'winter') => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await generateRecommendations(user.id, season);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', user?.id] });
    },
  });

  // Delete a recommendation set
  const deleteMutation = useMutation({
    mutationFn: async (setId: string) => {
      const { error } = await deleteRecommendation(setId);
      if (error) throw error;
      return setId;
    },
    onSuccess: (setId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', user?.id] });
      
      // If the deleted set was the selected one, clear selection
      if (selectedSetId === setId) {
        setSelectedSetId(null);
      }
    },
  });

  return {
    recommendationSets,
    isLoadingSets,
    setsError,
    
    selectedSet,
    isLoadingSelectedSet,
    selectedSetError,
    setSelectedSetId,
    
    generateRecommendations: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    generateError: generateMutation.error,
    
    deleteRecommendation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    
    refetchSets,
  };
}