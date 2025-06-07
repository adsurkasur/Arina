import * as React from "react";
const { useState, useEffect } = React;
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart as BarChartIcon, 
  Calculator, 
  ChartBar, 
  ClipboardList, 
  Clock, 
  Search, 
  Trash2, 
  XCircle,
  TrendingUp,
  Info,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelContainer } from "@/components/ui/PanelContainer";

interface AnalysisHistoryProps {
  onClose: () => void;
}

const TYPE_LABELS = {
  'business_feasibility': ['Business Feasibility', 'Kelayakan Bisnis'],
  'demand_forecast': ['Demand Forecasting', 'Peramalan Permintaan'],
  'optimization': ['Optimization Analysis', 'Analisis Optimasi']
};

const TYPE_ICONS = {
  'business_feasibility': <Calculator className="h-5 w-5" />,
  'demand_forecast': <ChartBar className="h-5 w-5" />,
  'optimization': <BarChartIcon className="h-5 w-5" />
};

// Chart colors using CSS variables for palette consistency
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  highlight: 'hsl(var(--popover))',
  muted: 'hsl(var(--muted))',
  background: 'hsl(var(--background))',
  lightGreen: 'hsl(var(--muted))',
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.highlight,
  CHART_COLORS.secondary,
  CHART_COLORS.lightGreen
];

export default function AnalysisHistory({ onClose }: AnalysisHistoryProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    analysisResults, 
    isLoading, 
    error, 
    deleteAnalysis, 
    isDeletingAnalysis, 
    refetch 
  } = useAnalysisHistory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Apply filters to results
  const filteredResults = analysisResults.filter(result => {
    const matchesSearch = JSON.stringify(result.data)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' ? true : result.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type: string) => {
    const label = TYPE_LABELS[type as keyof typeof TYPE_LABELS];
    return label ? t(label[0], label[1]) : type;
  };

  const getTypeIcon = (type: string) => {
    return TYPE_ICONS[type as keyof typeof TYPE_ICONS] || <ClipboardList className="h-5 w-5" />;
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Unknown date';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Function to format numeric values with proper precision and units
  const formatValue = (value: number, unit: string = '', precision: number = 2) => {
    if (typeof value !== 'number') return value;
    
    const formatted = value.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: precision 
    });
    
    return unit ? `${formatted} ${unit}` : formatted;
  };
  
  // Format percentages
  const formatPercent = (value: number, precision: number = 1) => {
    if (typeof value !== 'number') return value;
    
    // Convert decimal to percentage
    const percent = value < 1 ? value * 100 : value;
    
    return percent.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: precision 
    }) + '%';
  };
  
  // Function to render a key metric with icon and visualization
  const renderKeyMetric = (
    label: string,
    value: any,
    icon: any, // fallback to any for icon
    trend?: 'up' | 'down' | 'neutral',
    unit: string = ''
  ) => {
    let trendIcon = null;
    let trendColor = 'text-muted-foreground';

    if (trend === 'up') {
      trendIcon = <TrendingUp className="h-4 w-4 ml-1 text-green-600" />;
      trendColor = 'text-green-600';
    } else if (trend === 'down') {
      trendIcon = <TrendingUp className="h-4 w-4 ml-1 text-red-500 transform rotate-180" />;
      trendColor = 'text-red-500';
    }

    const formattedValue = typeof value === 'number' 
      ? formatValue(value, unit)
      : value;

    return (
      <div className="bg-secondary/10 p-3 rounded-lg">
        <div className="flex items-center mb-1">
          <div className="mr-2 text-primary">{icon}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        <div className="flex items-center">
          <div className={`text-lg font-medium ${trendColor}`}>{formattedValue}</div>
          {trendIcon}
        </div>
      </div>
    );
  };
  
  // Render business feasibility analysis data with visualizations
  const renderBusinessFeasibility = (data: Record<string, any>) => {
    if (!data) return null;
    
    // Extract key metrics from data or data.data
    const metrics = data.data || data;
    const profitMargin = metrics.profitMargin || metrics.profit_margin;
    const roi = data.roi || data.ROI;
    const paybackPeriod = data.paybackPeriod || data.payback_period;
    const breakEvenUnits = data.breakEvenUnits || data.break_even_units;
    
    // Extract cost structure for pie chart if available
    const costStructure = data.operationalCosts || data.operational_costs || [];
    const hasCostStructure = Array.isArray(costStructure) && costStructure.length > 0;
    
    // Create pie chart data
    const pieData = hasCostStructure 
      ? costStructure.map((cost: any) => ({
          name: cost.name || cost.category || 'Unknown',
          value: cost.amount || cost.value || 0
        }))
      : [];
      
    return (
      <div className="space-y-4">
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            {hasCostStructure && <TabsTrigger value="costs">Cost Structure</TabsTrigger>}
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profitMargin !== undefined && renderKeyMetric(
                'Profit Margin', 
                formatPercent(profitMargin), 
                <DollarSign className="h-5 w-5" />,
                profitMargin > 0.2 ? 'up' : profitMargin < 0.1 ? 'down' : 'neutral'
              )}
              
              {roi !== undefined && renderKeyMetric(
                'Return on Investment', 
                formatPercent(roi), 
                <TrendingUp className="h-5 w-5" />,
                roi > 0.15 ? 'up' : roi < 0.05 ? 'down' : 'neutral'
              )}
              
              {paybackPeriod !== undefined && renderKeyMetric(
                'Payback Period', 
                paybackPeriod, 
                <Calendar className="h-5 w-5" />,
                paybackPeriod < 24 ? 'up' : paybackPeriod > 48 ? 'down' : 'neutral',
                'months'
              )}
              
              {breakEvenUnits !== undefined && renderKeyMetric(
                'Break-even Units', 
                formatValue(breakEvenUnits), 
                <BarChartIcon className="h-5 w-5" />
              )}
            </div>
            
            {data.summary && (
              <div className="mt-4 p-3 bg-primary/5 rounded-md">
                <h4 className="flex items-center text-primary font-medium mb-1">
                  <Info className="h-4 w-4 mr-1" /> Summary
                </h4>
                <p className="text-sm">{data.summary}</p>
              </div>
            )}
          </TabsContent>
          
          {hasCostStructure && (
            <TabsContent value="costs" className="pt-4">
              <div className="flex flex-col items-center">
                <h4 className="font-medium mb-4 text-center">Cost Structure</h4>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({name, percent}: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`$${formatValue(value as number)}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                  {costStructure.map((cost: any, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{backgroundColor: PIE_COLORS[index % PIE_COLORS.length]}} 
                      />
                      <span>{cost.name || 'Unknown'}: ${formatValue(cost.amount || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="raw" className="pt-4">
            <div className="w-full max-w-full max-h-[min(400px,60vh)] overflow-auto overflow-x-auto rounded border bg-muted p-2">
              <pre className="text-xs bg-muted break-words whitespace-pre-wrap w-full max-w-full min-w-0 overflow-x-auto rounded border p-2">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  // Render demand forecast analysis with line charts
  const renderDemandForecast = (data: Record<string, any>) => {
    if (!data) return null;
    
    // Ensure data is properly structured
    const forecasted = Array.isArray(data.forecasted) ? data.forecasted :
                      Array.isArray(data.forecasts) ? data.forecasts :
                      Array.isArray(data.data?.forecasted) ? data.data.forecasted :
                      Array.isArray(data.data?.forecasts) ? data.data.forecasts : [];
    const hasForecasts = Array.isArray(forecasted) && forecasted.length > 0;
    
    // Prepare chart data
    const chartData = hasForecasts 
      ? forecasted.map((f: any) => ({
          name: f.period || f.date || 'Unknown',
          forecast: f.forecast || f.value || 0,
          actual: f.actual || null
        }))
      : [];
    
    // Extract accuracy metrics if available
    const accuracy = data.accuracy || {};
    
    return (
      <div className="space-y-4">
        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forecast">Forecast Chart</TabsTrigger>
            <TabsTrigger value="metrics">Accuracy</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forecast" className="pt-4">
            {hasForecasts ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      tickFormatter={(value: any) => formatValue(value, '')}
                    />
                    <Tooltip 
                      formatter={(value: any) => [formatValue(value as number), 'Units']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      name="Forecast"
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={2}
                      dot={{ r: 4, fill: CHART_COLORS.primary }}
                      activeDot={{ r: 6 }}
                    />
                    {chartData.some(d => d.actual !== null) && (
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual"
                        stroke={CHART_COLORS.accent} 
                        strokeWidth={2}
                        dot={{ r: 4, fill: CHART_COLORS.accent }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground">No forecast data available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="metrics" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accuracy.mape !== undefined && renderKeyMetric(
                'Mean Absolute Percentage Error', 
                formatPercent(accuracy.mape), 
                <Info className="h-5 w-5" />,
                accuracy.mape < 10 ? 'up' : accuracy.mape > 20 ? 'down' : 'neutral'
              )}
              
              {accuracy.rmse !== undefined && renderKeyMetric(
                'Root Mean Square Error', 
                formatValue(accuracy.rmse), 
                <Calculator className="h-5 w-5" />
              )}
              
              {accuracy.mae !== undefined && renderKeyMetric(
                'Mean Absolute Error', 
                formatValue(accuracy.mae), 
                <Calculator className="h-5 w-5" />
              )}
              
              {accuracy.r2 !== undefined && renderKeyMetric(
                'R-squared', 
                formatValue(accuracy.r2, '', 3), 
                <TrendingUp className="h-5 w-5" />,
                accuracy.r2 > 0.7 ? 'up' : accuracy.r2 < 0.5 ? 'down' : 'neutral'
              )}
            </div>
            
            {data.summary && (
              <div className="mt-4 p-3 bg-primary/5 rounded-md">
                <h4 className="flex items-center text-primary font-medium mb-1">
                  <Info className="h-4 w-4 mr-1" /> Insights
                </h4>
                <p className="text-sm">{data.summary}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="raw" className="pt-4">
            <div className="w-full max-w-full max-h-[min(400px,60vh)] overflow-auto overflow-x-auto rounded border bg-muted p-2">
              <pre className="text-xs bg-muted break-words whitespace-pre-wrap w-full max-w-full min-w-0 overflow-x-auto rounded border p-2">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  // Render optimization analysis with bar charts
  const renderOptimization = (data: Record<string, any>) => {
    if (!data) return null;
    
    // Extract optimization results from data or data.data
    const results = data.data || data;
    const solution = results.solution || results.results || {};
    const hasSolution = solution && Object.keys(solution).length > 0;
    
    // Prepare chart data if we have a solution
    const chartData = hasSolution 
      ? Object.entries(solution).map(([key, value]) => ({
          name: key,
          value: typeof value === 'number' ? value : 0
        }))
      : [];
    
    // Extract constraints if available
    const constraints = data.constraints || [];
    const hasConstraints = Array.isArray(constraints) && constraints.length > 0;
    
    return (
      <div className="space-y-4">
        <Tabs defaultValue="solution" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solution">Optimal Solution</TabsTrigger>
            {hasConstraints && <TabsTrigger value="constraints">Constraints</TabsTrigger>}
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="solution" className="pt-4">
            {hasSolution ? (
              <>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        tickFormatter={(value: any) => formatValue(value, '')}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatValue(value as number, 'units'), 'Value']}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Optimal Value"
                        fill={CHART_COLORS.secondary}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {data.objective !== undefined && (
                  <div className="p-3 mt-4 bg-primary/5 rounded-md">
                    <h4 className="font-medium mb-1">Objective Value</h4>
                    <p className="text-xl font-semibold">
                      {formatValue(data.objective)}
                      {data.objective_unit && <span className="text-sm ml-1 text-muted-foreground">{data.objective_unit}</span>}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-4">
                <p className="text-muted-foreground">
                  {data.feasible === false 
                    ? "No feasible solution found with the given constraints." 
                    : "No solution data available"}
                </p>
              </div>
            )}
          </TabsContent>
          
          {hasConstraints && (
            <TabsContent value="constraints" className="pt-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-3 font-medium p-3 bg-gray-50 dark:bg-gray-800 border-b">
                  <div>Constraint</div>
                  <div>Value</div>
                  <div>Limit</div>
                </div>
                <div className="divide-y">
                  {constraints.map((constraint: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 p-3 items-center">
                      <div>{constraint.name || `Constraint ${index + 1}`}</div>
                      <div>{formatValue(constraint.value || 0)}</div>
                      <div className="flex items-center">
                        {constraint.type === '<=' || constraint.type === '<' ? '≤' : 
                         constraint.type === '>=' || constraint.type === '>' ? '≥' : '='}
                        <span className="ml-1">{formatValue(constraint.limit || 0)}</span>
                        {constraint.slack === 0 && (
                          <Badge variant="outline">Binding</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {data.summary && (
                <div className="mt-4 p-3 bg-primary/5 rounded-md">
                  <h4 className="flex items-center text-primary font-medium mb-1">
                    <Info className="h-4 w-4 mr-1" /> Insights
                  </h4>
                  <p className="text-sm">{data.summary}</p>
                </div>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="raw" className="pt-4">
            <div className="w-full max-w-full max-h-[min(400px,60vh)] overflow-auto overflow-x-auto rounded border bg-muted p-2">
              <pre className="text-xs bg-muted break-words whitespace-pre-wrap w-full max-w-full min-w-0 overflow-x-auto rounded border p-2">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  // Main function to render analysis data based on type
  const renderAnalysisData = (data: unknown, type?: string) => {
    if (!data) return <p>No data available</p>;
    
    // Type guard to check if data is an object
    if (data && typeof data === 'object') {
      const dataObj = data as Record<string, any>;
      
      // Select rendering based on analysis type
      if (type === 'business_feasibility') {
        return renderBusinessFeasibility(dataObj);
      } else if (type === 'demand_forecast') {
        return renderDemandForecast(dataObj);
      } else if (type === 'optimization') {
        return renderOptimization(dataObj);
      }
      
      // If we have a simple structure but no dedicated renderer
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
      
      // Fallback to raw data view with tabs
      return (
        <div className="space-y-4">
          <Tabs defaultValue="formatted" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formatted">Formatted</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formatted" className="pt-4">
              <div className="space-y-2">
                {Object.entries(dataObj).map(([key, value]) => {
                  // Don't display very large arrays or objects inline
                  const isLargeObject = typeof value === 'object' && value !== null && 
                                    (Array.isArray(value) ? value.length > 5 : Object.keys(value).length > 5);
                                    
                  return (
                    <div key={key} className="mb-2">
                      <div className="font-medium text-sm text-primary mb-1">{key}</div>
                      <div className="ml-2">
                        {isLargeObject ? (
                          <Badge variant="outline">
                            {Array.isArray(value) ? `Array[${value.length}]` : `Object{${Object.keys(value).length}}`}
                          </Badge>
                        ) : typeof value === 'object' ? (
                          <pre className="text-xs bg-muted break-words whitespace-pre-wrap w-full max-w-full min-w-0 overflow-x-auto rounded border p-2">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          <span>{String(value)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="raw" className="pt-4">
              <div className="w-full max-w-full max-h-[min(400px,60vh)] overflow-auto overflow-x-auto rounded border bg-muted p-2">
                <pre className="text-xs bg-muted break-words whitespace-pre-wrap w-full max-w-full min-w-0 overflow-x-auto rounded border p-2">
                  {JSON.stringify(dataObj, null, 2)}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      );
    }
    
    // If data is a string or other primitive, just display it
    return <p>{String(data)}</p>;
  };

  useEffect(() => {
    refetch(); // Always fetch latest history when this component mounts
  }, [refetch]);

  if (error) {
    return (
      <PanelContainer onClose={onClose} title={t('tools.analysisHistory.title')}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-2">{t('tools.analysisHistory.loadError')}</p>
          <Button onClick={() => window.location.reload()}>{t('form.retry')}</Button>
        </div>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer onClose={onClose} title={t('tools.analysisHistory.title')}>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('tools.analysisHistory.searchPlaceholder')}
            value={searchQuery}
            // @ts-ignore
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('tools.analysisHistory.allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tools.analysisHistory.allTypes')}</SelectItem>
            <SelectItem value="business_feasibility">{t('tools.analysisHistory.businessFeasibility')}</SelectItem>
            <SelectItem value="demand_forecast">{t('tools.analysisHistory.demandForecasting')}</SelectItem>
            <SelectItem value="optimization">{t('tools.analysisHistory.optimizationAnalysis')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>{t('tools.analysisHistory.loading')}</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium mb-1">{t('tools.analysisHistory.noResultsTitle')}</h3>
          <p className="text-muted-foreground max-w-md">
            {filteredResults.length === 0
              ? t('tools.analysisHistory.noResultsDesc')
              : t('tools.analysisHistory.noResultsFilter')}
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
                    <Badge variant="outline">
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
                      <div>
                        {renderAnalysisData(result.data, result.type)}
                      </div>
                    </CardContent>
                    <CardFooter className="px-0 pt-4 pb-0 flex justify-end space-x-2">
                      <Badge>
                        {formatDate(result.created_at)}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={async () => {
                          try {
                            await deleteAnalysis(result.id);
                          } catch (error) {
                            console.error("Failed to delete analysis:", error);
                          }
                        }}
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
    </PanelContainer>
  );
}