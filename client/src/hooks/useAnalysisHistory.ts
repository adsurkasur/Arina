import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';

export interface AnalysisResult {
  id: string;
  user_id: string;
  type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export function useAnalysisHistory() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all analysis results
  const {
    data: analysisResults = [],
    isLoading,
    error,
    refetch
  } = useQuery<AnalysisResult[]>({
    queryKey: ['/api/analysis', user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }
      return getQueryFn({ on401: 'throw' })({ 
        queryKey: ['/api/analysis'], 
        signal: undefined,
        meta: undefined 
      }, { 
        userId: user.id 
      });
    },
    enabled: !!user?.id,
  });

  // Fetch analysis results by type
  const getAnalysisByType = (type: string) => {
    return analysisResults.filter(result => result.type === type);
  };

  // Delete analysis result
  const deleteAnalysisMutation = useMutation({
    mutationFn: async (analysisId: string) => {
      await apiRequest('DELETE', `/api/analysis/${analysisId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analysis'] });
      toast({
        title: 'Analysis deleted',
        description: 'The analysis has been removed from your history.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting analysis',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  return {
    analysisResults,
    isLoading,
    error,
    refetch,
    getAnalysisByType,
    deleteAnalysis: deleteAnalysisMutation.mutate,
    isDeletingAnalysis: deleteAnalysisMutation.isPending,
  };
}