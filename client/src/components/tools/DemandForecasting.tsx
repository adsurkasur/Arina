import React, { useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { X, Save, FileDown, CalculatorIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { saveAnalysisResult } from "@/lib/mongodb";
import { generateForecast } from "@/utils/forecasting";
import {
  ForecastInput,
  ForecastResult,
  HistoricalDemand,
} from "@/types/analysis";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useTranslation } from 'react-i18next';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { parse } from "date-fns";

// Form validation schema
const formSchema = z.object({
  productName: z.string().min(1, { message: "Product name is required" }),
  historicalDemand: z
    .array(
      z.object({
        id: z.string(),
        period: z.string().min(1, { message: "Period is required" }),
        demand: z
          .number()
          .min(0, { message: "Demand must be a positive number" }),
      }),
    )
    .min(3, { message: "At least 3 historical data points are required" }),
  method: z.enum(["sma", "exponential"]),
  smoothingFactor: z.number().min(0).max(1).optional(),
  periodLength: z.number().min(1).max(12),
});

export default function DemandForecasting({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<ForecastResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useAnalysisHistory();
  const { t } = useTranslation();

  // Initialize form with default values
  const form = useForm<ForecastInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      historicalDemand: [
        { id: uuidv4(), period: "Period 1", demand: 0 },
        { id: uuidv4(), period: "Period 2", demand: 0 },
        { id: uuidv4(), period: "Period 3", demand: 0 },
      ],
      method: "sma",
      smoothingFactor: 0.3,
      periodLength: 3,
    },
  });

  // Watch for method selection to show relevant controls
  const method = form.watch("method");

  // Setup field arrays for dynamic inputs
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "historicalDemand",
  });

  // Generate forecast
  const onSubmit = (data: ForecastInput) => {
    setIsCalculating(true);
    try {
      // Validate inputs
      if (!data.productName.trim()) {
        throw new Error("Product name is required");
      }

      // Check if historical demand has valid numbers
      const hasInvalidDemand = data.historicalDemand.some(
        (item) => isNaN(item.demand) || item.demand < 0 || !item.period.trim(),
      );

      if (hasInvalidDemand) {
        throw new Error(
          "All historical demand values must be valid positive numbers and periods must be filled",
        );
      }

      const result = generateForecast(data);
      setResults(result);
      setTimeout(() => {
        document
          .getElementById("forecast-results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error: any) {
      toast({
        title: "Forecast Error",
        description:
          error.message ||
          "There was an error generating the forecast. Please ensure all inputs are valid.",
        variant: "destructive",
      });
      console.error("Forecast error:", error);
    }
    setIsCalculating(false);
  };

  // Save analysis to database
  const saveAnalysis = async () => {
    if (!user || !results) return;

    setIsSaving(true);
    try {
      const formData = form.getValues();
      const analysisData = {
        input: formData,
        results: results,
      };

      const { data, error } = await saveAnalysisResult(
        user.id,
        "demand_forecast",
        analysisData,
      );
      if (error) throw error;

      toast({
        title: "Forecast Saved",
        description: "Your demand forecast has been saved successfully.",
      });
      await refetch(); // Refresh analysis history after save
    } catch (error: any) {
      toast({
        title: "Error Saving Forecast",
        description:
          error.message ||
          "There was an error saving your forecast. Please try again.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  // Export as PDF (simplified)
  const exportAsPDF = () => {
    toast({
      title: "Export Initiated",
      description: "Your forecast is being prepared for download.",
    });
    // In a real app, this would connect to a PDF generation service
  };

  // Reset form
  const resetForm = () => {
    form.reset();
    setResults(null);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!results) return [];
    const chartData = [];
    const historical = results.chart.historical;
    const forecast = results.chart.forecast;

    // Add all historical points
    for (const point of historical) {
      chartData.push({
        name: point.period,
        Historical: point.value,
        Forecast: null,
      });
    }

    // If there is forecast data, connect the last historical point to the forecast line
    if (historical.length && forecast.length) {
      // Add a connector point: same period as the last historical, both values set
      const lastHist = historical[historical.length - 1];
      chartData[chartData.length - 1] = {
        name: lastHist.period,
        Historical: lastHist.value,
        Forecast: lastHist.value, // This ensures the lines connect visually
      };
      // Add all forecast points (including the first, which will duplicate the last historical period)
      for (let i = 0; i < forecast.length; i++) {
        chartData.push({
          name: forecast[i].period,
          Historical: null,
          Forecast: forecast[i].value,
        });
      }
    }
    return chartData;
  };

  // Graph container styles
  const graphContainerClass =
    "relative bg-white rounded-lg border border-gray-200 p-4 mb-6 overflow-x-auto";


  const chartData = useMemo(() => prepareChartData(), [results]);

  const handleCloseFullscreen = useCallback(() => setIsFullscreen(false), []);

  return (
    <PanelContainer onClose={onClose} title={t('tools.demandForecasting.title')}>
      <div className="space-y-6">
        {/* Section: Forecast Info */}
        <div className="mb-4">
          <h3 className="font-medium text-lg mb-2">{t('tools.demandForecasting.infoTitle')}</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              {/* Product Name */}
              <FormField
                control={form.control as any}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {t('tools.demandForecasting.productName')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          {t('tools.demandForecasting.productNameTooltip')}
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('tools.demandForecasting.productNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Section: Historical Demand */}
        <div className="mb-4">
          <h3 className="font-medium text-lg mb-2">{t('tools.demandForecasting.historicalTitle')}</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-base font-medium text-gray-700">
                  {t('tools.demandForecasting.historicalDemand')}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      {t('tools.demandForecasting.historicalDemandTooltip')}
                    </TooltipContent>
                  </Tooltip>
                </label>
                <p className="text-sm text-muted-foreground">
                  {t('tools.demandForecasting.historicalDemandDesc')}
                </p>

                <div className="grid grid-cols-12 gap-2 mb-2">
                  <div className="col-span-5">
                    <label className="text-xs flex items-center gap-2 font-medium text-gray-700">
                      {t('tools.demandForecasting.period')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          {t('tools.demandForecasting.periodTooltip')}
                        </TooltipContent>
                      </Tooltip>
                    </label>
                  </div>
                  <div className="col-span-5">
                    <label className="text-xs flex items-center gap-2 font-medium text-gray-700">
                      {t('tools.demandForecasting.demand')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          {t('tools.demandForecasting.demandTooltip')}
                        </TooltipContent>
                      </Tooltip>
                    </label>
                  </div>
                  <div className="col-span-2"></div>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <FormField
                        control={form.control as any}
                        name={`historicalDemand.${index}.period`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Period 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-5">
                      <FormField
                        control={form.control as any}
                        name={`historicalDemand.${index}.demand`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="0"
                                type="number"
                                step="1"
                                min="0"
                                max={Math.pow(2, 63) - 1} // 64 BBit signed integer max value
                                onKeyDown={(e) => {
                                  let prohibitedKeys = ["e", "E", "+", "-", ".", ","];
                                  if (prohibitedKeys.includes(e.key)) {
                                    e.preventDefault();
                                  }

                                  if (!isNaN(parseFloat(e.key))) {
                                    // check if the input value is a 0
                                    // ts-ignore-next-line
                                    const input = e.target as HTMLInputElement;
                                    if (input.value === "0" && e.key !== "0") {	
                                      input.value = e.key; // replace 0 with the pressed key
                                      e.preventDefault(); // prevent default behavior
                                      field.onChange(parseFloat(e.key)); // update the field value
                                    }
                                  }
                                }}
                                {...field}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 0
                                      : Math.floor(parseFloat(e.target.value));
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={fields.length <= 3}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      id: uuidv4(),
                      period: t('tools.demandForecasting.period', { number: fields.length + 1 }),
                      demand: 0,
                    })
                  }
                  className="mt-2"
                >
                  {t('tools.demandForecasting.addPeriod')}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Section: Forecast Method */}
        <div className="mb-4">
          <h3 className="font-medium text-lg mb-2">{t('tools.demandForecasting.methodTitle')}</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              {/* Forecast Method */}
              <FormField
                control={form.control as any}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {t('tools.demandForecasting.method')}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          {t('tools.demandForecasting.methodTooltip')}
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tools.demandForecasting.methodPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sma">
                          {t('tools.demandForecasting.sma')}
                        </SelectItem>
                        <SelectItem value="exponential">
                          {t('tools.demandForecasting.exponential')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {method === "sma"
                        ? t('tools.demandForecasting.smaDesc')
                        : t('tools.demandForecasting.exponentialDesc')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Method-specific parameters */}

              {method === "exponential" && (
                <FormField
                  control={form.control as any}
                  name="smoothingFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {t('tools.demandForecasting.smoothingFactor')}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            {t('tools.demandForecasting.smoothingFactorTooltip')}
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.05}
                          value={[field.value || 0.3]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {method === "sma" && (
                <FormField
                  control={form.control as any}
                  name="periodLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {t('tools.demandForecasting.periodLength')}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            {t('tools.demandForecasting.periodLengthTooltip')}
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2}
                          max={12}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 3)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </div>

        {/* Section: Results/Actions */}
        <div className="flex justify-end gap-3 mt-6">
          {/* Forecast Buttons */}
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90"
            disabled={isCalculating}
            onClick={form.handleSubmit(onSubmit as any)}
          >
            {isCalculating ? (
              <>
                <span className="animate-spin mr-2"></span>
                {t('tools.demandForecasting.calculating')}
              </>
            ) : (
              <>
                <CalculatorIcon className="mr-2 h-4 w-4" />
                {t('tools.demandForecasting.generateForecast')}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={resetForm}>
            {t('form.reset')}
          </Button>
        </div>

        {/* Results Section */}
        {results && (
          <div
            id="forecast-results"
            className="mt-6 border-t border-gray-200 pt-4"
          >
            <h3 className="text-lg font-heading font-medium text-primary mb-3">
              {t('tools.demandForecasting.resultsTitle')}
            </h3>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Chart */}
              <div className={graphContainerClass} style={{ minWidth: '350px' }}>
                <div className="flex justify-between items-center mb-2 w-full">
                  <h4 className="font-medium text-gray-700">{t('tools.demandForecasting.chartTitle')}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    onClick={() => setIsFullscreen(true)}
                  >
                    {t('tools.demandForecasting.showGraphFullscreen')}
                  </Button>
                </div>
                <div className="space-y-4 w-full">
                  <div className="bg-cream p-4 rounded-lg">
                    <h5 className="font-medium text-primary mb-2">{t('tools.demandForecasting.chartHelpTitle')}</h5>
                    <ul className="text-sm space-y-2">
                      <li>{t('tools.demandForecasting.chartHelpSolid')}</li>
                      <li>{t('tools.demandForecasting.chartHelpDashed')}</li>
                      <li>{t('tools.demandForecasting.chartHelpPoint')}</li>
                      <li>{t('tools.demandForecasting.chartHelpHover')}</li>
                    </ul>
                  </div>
                  <div className="h-80 w-full min-w-[350px] mb-6" style={{ overflow: 'visible' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          label={{
                            value: "Time Periods",
                            position: "insideBottom",
                            offset: -10,
                          }}
                          interval={0}
                          tick={{ fontSize: 13 }}
                          minTickGap={0}
                        />
                        <YAxis
                          label={{
                            value: "Demand Quantity",
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                          }}
                          tick={{ fontSize: 13 }}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                          formatter={(value) => [`Quantity: ${value}`, ""]}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          formatter={(value) => {
                            return value === "Historical"
                              ? "Past Data"
                              : "Future Prediction";
                          }}
                        />
                        <Line
                          type="linear"
                          dataKey="Historical"
                          stroke="#4caf50"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          type="linear"
                          dataKey="Forecast"
                          stroke="#2196f3"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                          strokeDasharray="6 3"
                          connectNulls={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Fullscreen Modal */}
              {isFullscreen && (
                createPortal(
                  <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
                    onClick={handleCloseFullscreen}
                  >
                    <div
                      className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-full max-h-[90vh] overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 flex justify-between items-center border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">
                          {t('tools.demandForecasting.fullscreenChartTitle')}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCloseFullscreen}
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>
                      {/* Understanding the Chart Section */}
                      <div className="bg-cream p-4 border-b border-gray-100">
                        <h5 className="font-medium text-primary mb-2">Understanding the Chart</h5>
                        <ul className="text-sm space-y-1 list-disc pl-5">
                          <li>Solid line: Your actual historical demand data</li>
                          <li>Dashed line: Predicted future demand</li>
                          <li>Each point represents demand for one period</li>
                          <li>Hover over points to see exact values</li>
                        </ul>
                      </div>
                      <div className="h-full w-full p-2 flex items-start justify-center">
                        <div className="w-full max-w-[700px] min-h-[200px] h-[32vh] sm:h-[40vh] md:h-[45vh] mx-auto" style={{ minWidth: 0 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={chartData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="name"
                                label={{
                                  value: "Time Periods",
                                  position: "insideBottom",
                                  offset: -10,
                                }}
                                interval={0}
                                tick={{ fontSize: 13 }}
                                minTickGap={0}
                              />
                              <YAxis
                                label={{
                                  value: "Demand Quantity",
                                  angle: -90,
                                  position: "insideLeft",
                                  offset: 10,
                                }}
                                tick={{ fontSize: 13 }}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: "white",
                                  borderRadius: "8px",
                                  border: "1px solid #e5e7eb",
                                }}
                                formatter={(value) => [`Quantity: ${value}`, ""]}
                              />
                              <Legend
                                verticalAlign="top"
                                height={36}
                                formatter={(value) => {
                                  return value === "Historical"
                                    ? "Past Data"
                                    : "Future Prediction";
                                }}
                              />
                              <Line
                                type="linear"
                                dataKey="Historical"
                                stroke="#4caf50"
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                              />
                              <Line
                                type="linear"
                                dataKey="Forecast"
                                stroke="#2196f3"
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                                strokeDasharray="6 3"
                                connectNulls={true}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )
              )}
              {/* Data Table replaced with MAE and MAPE */}
              <div className="p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  {t('tools.demandForecasting.accuracyTitle')}
                </h4>
                {/* Forecast Accuracy Metrics as cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {/* MAE Card */}
                  <div className="bg-cream rounded-lg p-4 flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">MAE</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>{t('tools.demandForecasting.maeTooltip')}</p>
                          <p className="mt-2 text-xs">{t('tools.demandForecasting.maeFormula')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="font-medium text-primary text-lg">
                      {results.accuracy?.mae !== undefined && !isNaN(results.accuracy.mae)
                        ? <>{results.accuracy.mae.toFixed(2)}</>
                        : <span className="text-gray-400">{t('tools.demandForecasting.notEnoughData')}</span>}
                    </div>
                  </div>
                  {/* MAPE Card */}
                  <div className="bg-cream rounded-lg p-4 flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">MAPE</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          <p>{t('tools.demandForecasting.mapeTooltip')}</p>
                          <p className="mt-2 text-xs">{t('tools.demandForecasting.mapeFormula')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="font-medium text-primary text-lg">
                      {results.accuracy?.mape !== undefined && !isNaN(results.accuracy.mape)
                        ? <>{results.accuracy.mape.toFixed(2)}%</>
                        : <span className="text-gray-400">{t('tools.demandForecasting.notEnoughData')}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interpretation Section */}
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">
                  {t('tools.demandForecasting.interpretationTitle')}
                </h4>
                <div className="text-sm text-gray-600">
                  {(() => {
                    if (!results) return null;
                    const { forecasted, accuracy, productName } = results;
                    const forecastValue = forecasted && forecasted.length > 0 ? forecasted[0].forecast : null;
                    let interp = "";
                    if (forecastValue !== null && !isNaN(forecastValue)) {
                      interp += `${t('tools.demandForecasting.predictedDemand')} <b>${productName}</b> ${t('tools.demandForecasting.is')} <b>${forecastValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>. `;
                    }
                    if (
                      accuracy &&
                      typeof accuracy.mape === 'number' && !isNaN(accuracy.mape) &&
                      typeof accuracy.mae === 'number' && !isNaN(accuracy.mae)
                    ) {
                      interp += `${t('tools.demandForecasting.forecastModel')} <b>${accuracy.mae.toFixed(2)}</b> ${t('tools.demandForecasting.and')} <b>${accuracy.mape.toFixed(2)}%</b>. `;
                      if (accuracy.mape < 10) {
                        interp += t('tools.demandForecasting.highlyAccurate');
                      } else if (accuracy.mape < 20) {
                        interp += t('tools.demandForecasting.reasonablyAccurate');
                      } else {
                        interp += t('tools.demandForecasting.significantError');
                      }
                    }
                    return <span dangerouslySetInnerHTML={{ __html: interp }} />;
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-4 py-3 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportAsPDF}
                  className="mr-2"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('tools.demandForecasting.exportPDF')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveAnalysis}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="animate-spin mr-2"></span>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {t('tools.demandForecasting.saveAnalysis')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PanelContainer>
  );
}
