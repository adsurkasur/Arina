import { useState } from 'react';
import { 
  BarChart, 
  Calculator, 
  ChartBar, 
  ClipboardList, 
  Clock, 
  Search, 
  Trash2, 
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { AnalysisResult } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisHistoryProps {
  onClose: () => void;
}

const TYPE_LABELS = {
  'business_feasibility': 'Business Feasibility',
  'demand_forecast': 'Demand Forecasting',
  'optimization': 'Optimization Analysis'
};

const TYPE_ICONS = {
  'business_feasibility': <Calculator className="h-5 w-5" />,
  'demand_forecast': <ChartBar className="h-5 w-5" />,
  'optimization': <BarChart className="h-5 w-5" />
};

export default function AnalysisHistory({ onClose }: AnalysisHistoryProps) {
  const { user } = useAuth();
  const { 
    analysisResults, 
    isLoading, 
    error, 
    deleteAnalysis, 
    isDeletingAnalysis 
  } = useAnalysisHistory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Apply filters to results
  const filteredResults = analysisResults.filter(result => {
    const matchesSearch = JSON.stringify(result.data)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' ? true : result.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    return TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type;
  };

  const getTypeIcon = (type: string) => {
    return TYPE_ICONS[type as keyof typeof TYPE_ICONS] || <ClipboardList className="h-5 w-5" />;
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Unknown date';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Function to render JSON data in a more readable format
  const renderAnalysisData = (data: unknown) => {
    if (!data) return <p>No data available</p>;
    
    // Type guard to check if data is an object
    if (data && typeof data === 'object') {
      const dataObj = data as Record<string, any>;
      
      // If the data has a simple structure, extract key info
      if (dataObj.title || dataObj.description || dataObj.summary) {
        return (
          <div className="space-y-2">
            {dataObj.title && <h4 className="font-medium">{dataObj.title}</h4>}
            {dataObj.description && <p>{dataObj.description}</p>}
            {dataObj.summary && <p>{dataObj.summary}</p>}
            
            {/* If there's numerical data, show it in a more structured way */}
            {dataObj.metrics && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(dataObj.metrics).map(([key, value]) => (
                  <div key={key} className="bg-secondary/20 p-2 rounded">
                    <div className="text-xs text-muted-foreground">{key}</div>
                    <div className="font-medium">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      
      // For more complex objects, render as a list of key-value pairs
      return (
        <div className="space-y-2">
          {Object.entries(dataObj).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-medium">{key}: </span>
              <span>
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2) 
                  : String(value)
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    // If data is a string or other primitive, just display it
    return <p>{String(data)}</p>;
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-primary">Analysis History</h2>
          <button 
            className="text-gray-500 hover:text-gray-800" 
            onClick={onClose}
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-2">Failed to load analysis history</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">Analysis History</h2>
        <button 
          className="text-gray-500 hover:text-gray-800" 
          onClick={onClose}
        >
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search analysis history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="business_feasibility">Business Feasibility</SelectItem>
            <SelectItem value="demand_forecast">Demand Forecasting</SelectItem>
            <SelectItem value="optimization">Optimization Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading analysis history...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium mb-1">No analysis results found</h3>
          <p className="text-muted-foreground max-w-md">
            {analysisResults.length === 0 
              ? "Start using the analysis tools to generate insights that will be saved here."
              : "No results match your current filters. Try adjusting your search criteria."}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <Accordion type="multiple" className="space-y-4">
            {filteredResults.map((result) => (
              <Card key={result.id} className="overflow-hidden">
                <CardHeader className="py-4 px-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 rounded-full bg-primary/10 text-primary">
                        {getTypeIcon(result.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {(result.data as any)?.title || getTypeLabel(result.type)}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(result.created_at)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto mr-2">
                      {getTypeLabel(result.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <AccordionItem value={result.id} className="border-0">
                  <AccordionTrigger className="py-0 px-5 text-sm hover:no-underline">
                    <span className="text-muted-foreground">View details</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 px-5 pb-4">
                    <CardContent className="p-0 pt-4">
                      <div className="text-sm">
                        {renderAnalysisData(result.data)}
                      </div>
                    </CardContent>
                    <CardFooter className="px-0 pt-4 pb-0 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={() => deleteAnalysis(result.id)}
                        disabled={isDeletingAnalysis}
                      >
                        {isDeletingAnalysis && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  );
}