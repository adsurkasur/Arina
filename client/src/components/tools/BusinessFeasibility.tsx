import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { X, Save, FileDown, CalculatorIcon, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { saveAnalysisResult } from "@/lib/supabase";
import { analyzeBusiness } from "@/utils/calculations";
import {
  BusinessFeasibilityInput,
  BusinessFeasibilityResult,
  InvestmentCost,
  OperationalCost
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Form validation schema
const formSchema = z.object({
  businessName: z.string().min(1, { message: "Business name is required" }),
  investmentCosts: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, { message: "Item name is required" }),
      quantity: z.number().min(0, { message: "Quantity must be a positive number" }),
      price: z.number().min(0, { message: "Price must be a positive number" }),
      amount: z.number().min(0, { message: "Amount must be a positive number" }),
    })
  ),
  operationalCosts: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, { message: "Item name is required" }),
      quantity: z.number().min(0, { message: "Quantity must be a positive number" }),
      price: z.number().min(0, { message: "Price must be a positive number" }),
      amount: z.number().min(0, { message: "Amount must be a positive number" }),
    })
  ),
  productionCostPerUnit: z.number().min(0, { message: "Production cost must be a positive number" }),
  monthlySalesVolume: z.number().min(1, { message: "Sales volume must be at least 1" }),
  markup: z.number().min(0, { message: "Markup must be a positive number" }),
  projectLifespan: z.number().min(1, { message: "Project lifespan must be at least 1 year" }),
});

interface BusinessFeasibilityProps {
  onClose: () => void;
}

export default function BusinessFeasibility({ onClose }: BusinessFeasibilityProps) {
  const [results, setResults] = useState<BusinessFeasibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<BusinessFeasibilityInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      investmentCosts: [{ id: uuidv4(), name: "", quantity: 0, price: 0, amount: 0 }],
      operationalCosts: [{ id: uuidv4(), name: "", quantity: 0, price: 0, amount: 0 }],
      productionCostPerUnit: 0,
      monthlySalesVolume: 0,
      markup: 0,
      projectLifespan: 1,
    },
  });

  // Setup field arrays for dynamic inputs
  const { fields: investmentFields, append: appendInvestment, remove: removeInvestment } = useFieldArray({
    control: form.control,
    name: "investmentCosts",
  });

  const { fields: operationalFields, append: appendOperational, remove: removeOperational } = useFieldArray({
    control: form.control,
    name: "operationalCosts",
  });

  // Calculate feasibility
  const onSubmit = (data: BusinessFeasibilityInput) => {
    setIsCalculating(true);
    try {
      if (!data.businessName || data.monthlySalesVolume <= 0 || data.markup < 0) {
        throw new Error("Please fill in all required fields with valid values");
      }

      const processedData = {
        ...data,
        investmentCosts: data.investmentCosts.filter(cost => cost.name && cost.amount > 0).map(cost => ({
          ...cost,
          amount: Number(cost.amount)
        })),
        operationalCosts: data.operationalCosts.filter(cost => cost.name && cost.amount > 0).map(cost => ({
          ...cost,
          amount: Number(cost.amount)
        })),
        productionCostPerUnit: Number(data.productionCostPerUnit),
        monthlySalesVolume: Number(data.monthlySalesVolume),
        markup: Number(data.markup),
        projectLifespan: Number(data.projectLifespan) || 1
      };

      if (processedData.investmentCosts.length === 0) {
        throw new Error("Please add at least one investment cost");
      }

      if (processedData.operationalCosts.length === 0) {
        throw new Error("Please add at least one operational cost");
      }

      const result = analyzeBusiness(processedData);
      setResults(result);
      // Scroll to results section
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "There was an error calculating the business feasibility. Please check your inputs.",
        variant: "destructive",
      });
      console.error("Calculation error:", error);
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

      const { data, error } = await saveAnalysisResult(user.id, "business_feasibility", analysisData);
      if (error) throw error;

      toast({
        title: "Analysis Saved",
        description: "Your business feasibility analysis has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Analysis",
        description: error.message || "There was an error saving your analysis. Please try again.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  // Export as PDF (simplified)
  const exportAsPDF = () => {
    toast({
      title: "Export Initiated",
      description: "Your analysis is being prepared for download.",
    });
    // In a real app, this would connect to a PDF generation service
  };

  // Reset form
  const resetForm = () => {
    form.reset();
    setResults(null);
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-heading font-semibold text-primary">
            Business Feasibility Analysis
          </CardTitle>
          <CardDescription>
            Analyze profitability, break-even point, and ROI for your agricultural business.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="overflow-y-auto max-h-[calc(100vh-12rem)]">
        <div className="bg-cream rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            Enter your business parameters to analyze feasibility, calculate break-even point, and determine profitability metrics.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Business Name */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
  <FormLabel>Business Name</FormLabel>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p>The name of your agricultural business venture</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
                  <FormControl>
                    <Input placeholder="Strawberry Farm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Investment Costs Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
  <FormLabel>Investment Costs</FormLabel>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p>One-time expenses required to start the business, such as equipment, land, buildings, etc.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
              <FormDescription>One-time expenses to start the business</FormDescription>

              {investmentFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`investmentCosts.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`investmentCosts.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormControl>
                          <Input 
                            placeholder="Quantity" 
                            type="number"
                            step="1"
                            min="0"
                            onWheel={(e) => e.currentTarget.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '.' || e.key === ',') {
                                e.preventDefault();
                              }
                            }}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : Math.floor(parseFloat(e.target.value));
                              field.onChange(value);
                              const price = form.getValues(`investmentCosts.${index}.price`) || 0;
                              form.setValue(`investmentCosts.${index}.amount`, value * price);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`investmentCosts.${index}.price`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <Input 
                            placeholder="Price" 
                            type="number"
                            step="1"
                            min="0"
                            onWheel={(e) => e.currentTarget.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '.' || e.key === ',') {
                                e.preventDefault();
                              }
                            }}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : Math.floor(parseFloat(e.target.value));
                              field.onChange(value);
                              const quantity = form.getValues(`investmentCosts.${index}.quantity`) || 0;
                              form.setValue(`investmentCosts.${index}.amount`, value * quantity);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInvestment(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={investmentFields.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendInvestment({ id: uuidv4(), name: "", amount: 0 })}
                className="mt-2"
              >
                Add Investment Cost
              </Button>
            </div>

            {/* Operational Costs Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1">
  <FormLabel>Periodical Operational Costs</FormLabel>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p>Recurring expenses required to keep the business running, such as labor, utilities, raw materials, etc.</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
              <FormDescription>Recurring monthly expenses</FormDescription>

              {operationalFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`operationalCosts.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`operationalCosts.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormControl>
                          <Input 
                            placeholder="Quantity" 
                            type="number"
                            step="1"
                            min="0"
                            onWheel={(e) => e.currentTarget.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '.' || e.key === ',') {
                                e.preventDefault();
                              }
                            }}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : Math.floor(parseFloat(e.target.value));
                              field.onChange(value);
                              const price = form.getValues(`operationalCosts.${index}.price`) || 0;
                              form.setValue(`operationalCosts.${index}.amount`, value * price);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`operationalCosts.${index}.price`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <Input 
                            placeholder="Price" 
                            type="number"
                            step="1"
                            min="0"
                            onWheel={(e) => e.currentTarget.blur()}
                            onKeyDown={(e) => {
                              if (e.key === '.' || e.key === ',') {
                                e.preventDefault();
                              }
                            }}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : Math.floor(parseFloat(e.target.value));
                              field.onChange(value);
                              const quantity = form.getValues(`operationalCosts.${index}.quantity`) || 0;
                              form.setValue(`operationalCosts.${index}.amount`, value * quantity);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOperational(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={operationalFields.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendOperational({ id: uuidv4(), name: "", amount: 0 })}
                className="mt-2"
              >
                Add Operational Cost
              </Button>
            </div>

            {/* Production & Sales Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productionCostPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
  <FormLabel>Production Cost per Unit (Rp)</FormLabel>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p>The cost to produce one unit of your product, including direct materials and labor</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
                    <FormControl>
                      <Input 
                        placeholder="0" 
                        type="number"
                        step="1"
                        min="0"
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',') {
                            e.preventDefault();
                          }
                        }}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlySalesVolume"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
  <FormLabel>Sales Volume per Month</FormLabel>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p>Expected number of units sold per month</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
                    <FormControl>
                      <Input 
                        placeholder="0" 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="markup"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
  <FormLabel>Markup (%)</FormLabel>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-4 w-4 text-gray-500" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p>Percentage added to the cost price to determine selling price</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
                    <FormControl>
                      <Input 
                        placeholder="0" 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>

            {/* Analysis Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
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
                    Calculate
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Results Section */}
        {results && (
          <div id="results" className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-heading font-medium text-primary mb-3">Analysis Results</h3>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 p-4">
                <TooltipProvider>
                <div className="bg-cream rounded-lg p-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <div className="text-xs text-gray-500">Unit Cost (HPP)</div>
                      <div className="font-medium text-primary">Rp {results.unitCost.toLocaleString()}</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[300px]">
                    <p>Cost of producing one unit including direct materials, labor, and overhead.</p>
                    <p className="mt-2 text-xs">Formula: (Total Operational Costs + Production Cost) ÷ Monthly Volume</p>
                  </TooltipContent>
                </Tooltip>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <div className="text-xs text-gray-500">Selling Price</div>
                  <div className="font-medium text-primary">Rp {results.sellingPrice.toLocaleString()}</div>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <div className="text-xs text-gray-500">Break Even Point (Units)</div>
                  <div className="font-medium text-primary">{Math.ceil(results.breakEvenUnits).toLocaleString()} units</div>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <div className="text-xs text-gray-500">Break Even Point (Rp)</div>
                  <div className="font-medium text-primary">Rp {results.breakEvenAmount.toLocaleString()}</div>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <div className="text-xs text-gray-500">Monthly Net Profit</div>
                  <div className="font-medium text-primary">Rp {results.monthlyNetProfit.toLocaleString()}</div>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <div className="text-xs text-gray-500">Profit Margin</div>
                  <div className="font-medium text-primary">{results.profitMargin.toFixed(1)}%</div>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <div className="text-xs text-gray-500">Payback Period</div>
                  <div className="font-medium text-primary">{results.paybackPeriod.toFixed(1)} years</div>
                </div>
                <div className="bg-cream rounded-lg p-3">
                  <div className="text-xs text-gray-500">ROI</div>
                  <div className="font-medium text-primary">{results.roi.toFixed(1)}%</div>
                </div>
                </TooltipProvider>
              </div>

              {/* Summary */}
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Feasibility Summary</h4>
                <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: results.summary }}></div>
              </div>

              {/* Buttons */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={exportAsPDF}
                  className="text-gray-700"
                >
                  <FileDown className="mr-2 h-4 w-4" /> Export PDF
                </Button>
                <Button
                  onClick={saveAnalysis}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}