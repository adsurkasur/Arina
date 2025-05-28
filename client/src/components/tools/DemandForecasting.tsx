import React from "react";
import { useState } from "react";
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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

interface DemandForecastingProps {
  onClose: () => void;
}

export default function DemandForecasting({ onClose }: DemandForecastingProps) {
  const [results, setResults] = useState<ForecastResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

    // Add historical data
    for (const point of results.chart.historical) {
      chartData.push({
        name: point.period,
        Historical: point.value,
        Forecast: null,
      });
    }

    // Add forecast data (extending the array)
    for (const point of results.chart.forecast) {
      chartData.push({
        name: point.period,
        Historical: null,
        Forecast: point.value,
      });
    }

    return chartData;
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-heading font-semibold text-primary">
            Demand Forecasting
          </CardTitle>
          <CardDescription>
            Predict future demand using historical data and forecasting methods.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="overflow-y-auto max-h-[calc(100vh-12rem)]">
        <div className="bg-cream rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            Enter historical demand data and select a forecasting method to
            predict future demand.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            {/* Product Name */}
            <FormField
              control={form.control as any}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Product Name
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        Enter the name of the product you want to forecast
                        demand for.
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Rice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Historical Demand Section */}
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                Historical Demand
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    Provide historical demand data for at least three periods to
                    generate an accurate forecast.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
              <FormDescription>
                Enter at least 3 periods of historical data
              </FormDescription>

              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-5">
                  <FormLabel className="text-xs flex items-center gap-2">
                    Period
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        Specify the time period for the historical demand (e.g.,
                        "January 2025").
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                </div>
                <div className="col-span-5">
                  <FormLabel className="text-xs flex items-center gap-2">
                    Demand
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        Enter the demand quantity for the specified period.
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
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
                              onKeyDown={(e) => {
                                if (e.key === "." || e.key === ",") {
                                  e.preventDefault();
                                }
                              }}
                              {...field}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? ""
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
                    period: `Period ${fields.length + 1}`,
                    demand: 0,
                  })
                }
                className="mt-2"
              >
                Add Period
              </Button>
            </div>

            {/* Forecast Method */}
            <FormField
              control={form.control as any}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Forecast Method
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        Select the forecasting method to use: Simple Moving
                        Average (SMA) or Exponential Smoothing.
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sma">
                        Simple Moving Average (SMA)
                      </SelectItem>
                      <SelectItem value="exponential">
                        Exponential Smoothing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {method === "sma"
                      ? "SMA calculates the average of the last n periods."
                      : "Exponential smoothing gives more weight to recent observations."}
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
                      Smoothing Factor (Alpha)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          Alpha determines how much weight is given to recent
                          observations (higher = more weight to recent data).
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
                      Historical Periods for SMA
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          Number of historical periods to use for SMA
                          calculation (e.g., SMA3 uses 3 periods).
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

            {/* Forecast Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Calculating...
                  </>
                ) : (
                  <>
                    <CalculatorIcon className="mr-2 h-4 w-4" />
                    Generate Forecast
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Results Section */}
        {results && (
          <div
            id="forecast-results"
            className="mt-6 border-t border-gray-200 pt-4"
          >
            <h3 className="text-lg font-heading font-medium text-primary mb-3">
              Forecast Results
            </h3>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Chart */}
              <div className="p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  Forecast Chart
                </h4>
                <div className="space-y-4">
                  <div className="bg-cream p-4 rounded-lg">
                    <h5 className="font-medium text-primary mb-2">
                      Understanding the Chart
                    </h5>
                    <ul className="text-sm space-y-2">
                      <li>• Solid line: Your actual historical demand data</li>
                      <li>• Dashed line: Predicted future demand</li>
                      <li>• Each point represents demand for one period</li>
                      <li>• Hover over points to see exact values</li>
                    </ul>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={prepareChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          label={{
                            value: "Time Periods",
                            position: "bottom",
                            offset: 0,
                          }}
                        />
                        <YAxis
                          label={{
                            value: "Demand Quantity",
                            angle: -90,
                            position: "left",
                            offset: 0,
                          }}
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
                          type="monotone"
                          dataKey="Historical"
                          stroke="#4caf50"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="Forecast"
                          stroke="#2196f3"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  Forecast Data Table
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Historical Demand
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Forecasted Demand
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.chart.historical.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {item.period}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {item.value}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {results.chart.forecast[index]?.value || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  Export as PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveAnalysis}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="animate-spin mr-2">◌</span>
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Analysis
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
