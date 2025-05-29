import React from "react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { X, Save, FileDown, CalculatorIcon, Plus, Check, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { saveAnalysisResult } from "@/lib/mongodb";
import { runOptimization } from "@/utils/optimization";
import {
  OptimizationInput,
  OptimizationResult,
  OptimizationVariable,
  OptimizationConstraint,
  OptimizationGoal
} from "@/types/analysis";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PanelContainer } from "@/components/ui/PanelContainer";

// Form validation schema
const variableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Variable name is required" }),
  lowerBound: z.number(),
  upperBound: z.number(),
  cost: z.number().optional(),
  profit: z.number().optional(),
});

const constraintVarSchema = z.object({
  variableId: z.string(),
  coefficient: z.number(),
});

const constraintSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Constraint name is required" }),
  variables: z.array(constraintVarSchema),
  rhs: z.number(),
  sign: z.enum(["<=", ">=", "="]),
});

const goalVarSchema = z.object({
  variableId: z.string(),
  coefficient: z.number(),
});

const goalSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Goal name is required" }),
  target: z.number(),
  priority: z.number().min(1),
  variables: z.array(goalVarSchema),
  direction: z.enum(["min", "max"]),
});

const formSchema = z.object({
  name: z.string().min(1, { message: "Optimization name is required" }),
  type: z.enum(["profit_max", "cost_min", "goal_programming"]),
  variables: z.array(variableSchema)
    .min(1, { message: "At least one variable is required" }),
  constraints: z.array(constraintSchema)
    .min(1, { message: "At least one constraint is required" }),
  goals: z.array(goalSchema).optional(),
  objective: z.enum(["maximize", "minimize"]).optional(),
});

export default function OptimizationAnalysis({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("variables");
  const [results, setResults] = useState<OptimizationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useAnalysisHistory();

  // Initialize form with default values for profit maximization
  const form = useForm<OptimizationInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Farm Optimization",
      type: "profit_max",
      variables: [
        { id: uuidv4(), name: "Product A", lowerBound: 0, upperBound: 100, profit: 10 },
        { id: uuidv4(), name: "Product B", lowerBound: 0, upperBound: 100, profit: 15 },
      ],
      constraints: [
        { 
          id: uuidv4(), 
          name: "Land Constraint", 
          variables: [
            { variableId: "0", coefficient: 2 },
            { variableId: "1", coefficient: 3 }
          ],
          rhs: 100, 
          sign: "<=" 
        },
      ],
      objective: "maximize",
      goals: [],
    },
  });

  // Watch for optimization type
  const optimizationType = form.watch("type");
  const variables = form.watch("variables");

  // Setup field arrays for dynamic inputs
  const { 
    fields: variableFields,
    append: appendVariable, 
    remove: removeVariable 
  } = useFieldArray({
    control: form.control,
    name: "variables",
  });

  const { 
    fields: constraintFields,
    append: appendConstraint, 
    remove: removeConstraint 
  } = useFieldArray({
    control: form.control,
    name: "constraints",
  });

  const { 
    fields: goalFields,
    append: appendGoal, 
    remove: removeGoal 
  } = useFieldArray({
    control: form.control,
    name: "goals",
  });

  // Helper to add a constraint
  const addConstraint = () => {
    const variableCoeffs = variables.map((variable, index) => ({
      variableId: index.toString(),
      coefficient: 0
    }));

    appendConstraint({
      id: uuidv4(),
      name: `Constraint ${constraintFields.length + 1}`,
      variables: variableCoeffs,
      rhs: 0,
      sign: "<="
    });
  };

  // Helper to add a goal (for goal programming)
  const addGoal = () => {
    const variableCoeffs = variables.map((variable, index) => ({
      variableId: index.toString(),
      coefficient: 0
    }));

    appendGoal({
      id: uuidv4(),
      name: `Goal ${goalFields.length + 1}`,
      target: 0,
      priority: goalFields.length + 1,
      variables: variableCoeffs,
      direction: "max"
    });
  };

  // Run optimization
  const onSubmit = (data: OptimizationInput) => {
    setIsCalculating(true);
    try {
      const result = runOptimization(data);
      setResults(result);
      // Scroll to results section
      setTimeout(() => {
        document.getElementById("optimization-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast({
        title: "Optimization Error",
        description: "There was an error running the optimization. Please check your inputs.",
        variant: "destructive",
      });
      console.error("Optimization error:", error);
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

      const { data, error } = await saveAnalysisResult(user.id, "optimization", analysisData);
      if (error) throw error;

      toast({
        title: "Analysis Saved",
        description: "Your optimization analysis has been saved successfully.",
      });
      await refetch(); // Refresh analysis history after save
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

  // Prepare chart data
  const prepareChartData = () => {
    if (!results) return [];
    return results.variables.map(variable => ({
      name: variable.name,
      value: variable.value
    }));
  };

  return (
    <PanelContainer onClose={onClose} title="Optimization Analysis">
      <div className="space-y-6">
        {/* Section: Problem Definition */}
        <div className="mb-4">
          <h3 className="font-medium text-lg mb-2">Problem Definition</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Name
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            Provide a name for this optimization analysis (e.g., "Farm Optimization").
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Farm Production Optimization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Objective
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            Choose whether to maximize profit, minimize cost, or set multiple goals.
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value !== "goal_programming") {
                            form.setValue("goals", []);
                          }
                          if (value === "profit_max") {
                            form.setValue("objective", "maximize");
                          } else if (value === "cost_min") {
                            form.setValue("objective", "minimize");
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select optimization type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="profit_max">Profit Maximization</SelectItem>
                          <SelectItem value="cost_min">Cost Minimization</SelectItem>
                          <SelectItem value="goal_programming">Goal Programming</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {optimizationType === "profit_max" && "Maximize profits subject to constraints."}
                        {optimizationType === "cost_min" && "Minimize costs while meeting requirements."}
                        {optimizationType === "goal_programming" && "Set multiple objectives with priorities."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(optimizationType === "profit_max" || optimizationType === "cost_min") && (
                  <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objective</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="maximize" />
                              </FormControl>
                              <FormLabel className="font-normal">Maximize</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="minimize" />
                              </FormControl>
                              <FormLabel className="font-normal">Minimize</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Tabs for Variables, Constraints, and Goals */}
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="variables" className="flex-1">Variables</TabsTrigger>
                  <TabsTrigger value="constraints" className="flex-1">Constraints</TabsTrigger>
                  {optimizationType === "goal_programming" && (
                    <TabsTrigger value="goals" className="flex-1">Goals</TabsTrigger>
                  )}
                </TabsList>

                {/* Variables Tab */}
                <TabsContent value="variables" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Define Variables</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        Variables represent the quantities or resources to optimize (e.g., production quantities, resource allocations).
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        appendVariable({
                          id: uuidv4(),
                          name: `Variable ${variableFields.length + 1}`,
                          lowerBound: 0,
                          upperBound: 100,
                          profit: optimizationType === "profit_max" ? 0 : undefined,
                          cost: optimizationType === "cost_min" ? 0 : undefined,
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Variable
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {variableFields.map((field, index) => (
                      <div key={field.id} className="p-4 border border-gray-200 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`variables.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Name
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                      Name of the variable to optimize (e.g., production quantity, resource allocation).
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Rice production (tons)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {optimizationType === "profit_max" && (
                            <FormField
                              control={form.control}
                              name={`variables.${index}.profit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Profit per Unit
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="h-4 w-4 text-gray-500" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[300px]">
                                        Enter the profit generated per unit of this variable.
                                      </TooltipContent>
                                    </Tooltip>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={form.control}
                            name={`variables.${index}.lowerBound`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Lower Bound
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                      Minimum value this variable can take.
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variables.${index}.upperBound`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Upper Bound
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                      Maximum value this variable can take.
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="100"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Constraints Tab */}
                <TabsContent value="constraints" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Define Constraints</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        Constraints limit the optimization problem (e.g., resource availability, budget limits).
                      </TooltipContent>
                    </Tooltip>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addConstraint}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Constraint
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {constraintFields.map((field, index) => (
                      <div key={field.id} className="p-4 border border-gray-200 rounded-md">
                        <FormField
                          control={form.control}
                          name={`constraints.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Name
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-gray-500" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[300px]">
                                    Name of the constraint (e.g., "Land Constraint").
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Land constraint" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="mt-3">
                          <FormLabel className="flex items-center gap-2">
                            Coefficients
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">
                                Set the coefficient for each variable in this constraint.
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormDescription>How each variable contributes to this constraint.</FormDescription>

                          {variables.map((variable, varIndex) => (
                            <div key={varIndex} className="grid grid-cols-12 gap-2 items-center mt-2">
                              <div className="col-span-4">
                                <span className="text-sm">{variable.name}</span>
                              </div>
                              <div className="col-span-8">
                                <FormField
                                  control={form.control}
                                  name={`constraints.${index}.variables.${varIndex}.coefficient`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="0"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-end gap-4 mt-4">
                          <FormField
                            control={form.control}
                            name={`constraints.${index}.sign`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <FormLabel className="flex items-center gap-2">
                                  Sign
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                      Choose the comparison operator for this constraint (≤, ≥, =).
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sign" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="<=">≤</SelectItem>
                                    <SelectItem value=">=">≥</SelectItem>
                                    <SelectItem value="=">=</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`constraints.${index}.rhs`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel className="flex items-center gap-2">
                                  Right Hand Side
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-gray-500" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                      Enter the right-hand side value for this constraint.
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Goals Tab (for Goal Programming) */}
                {optimizationType === "goal_programming" && (
                  <TabsContent value="goals" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Define Goals</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px]">
                          Goals represent specific objectives to achieve, such as maximizing profit or minimizing costs.
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGoal}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Goal
                      </Button>
                    </div>

                    {goalFields.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-gray-300 rounded-md">
                        <p className="text-gray-500">No goals defined yet. Click "Add Goal" to create one.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {goalFields.map((field, index) => (
                          <div key={field.id} className="p-4 border border-gray-200 rounded-md">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">Goal {index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeGoal(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`goals.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Goal Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., Maximize profit" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`goals.${index}.direction`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Direction</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Direction" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="max">Maximize</SelectItem>
                                        <SelectItem value="min">Minimize</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`goals.${index}.target`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Target Value</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="0" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormDescription>Desired goal value</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`goals.${index}.priority`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="1" 
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      />
                                    </FormControl>
                                    <FormDescription>Higher values = higher priority</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="mt-3">
                              <FormLabel>Goal Coefficients</FormLabel>
                              <FormDescription>How each variable contributes to this goal</FormDescription>

                              {variables.map((variable, varIndex) => (
                                <div key={varIndex} className="grid grid-cols-12 gap-2 items-center mt-2">
                                  <div className="col-span-4">
                                    <span className="text-sm">{variable.name}</span>
                                  </div>
                                  <div className="col-span-8">
                                    <FormField
                                      control={form.control}
                                      name={`goals.${index}.variables.${varIndex}.coefficient`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input 
                                              type="number" 
                                              placeholder="0" 
                                              {...field}
                                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <input 
                                      type="hidden" 
                                      {...form.register(`goals.${index}.variables.${varIndex}.variableId`)} 
                                      value={varIndex.toString()} 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>

              {/* Optimization Buttons */}
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
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <CalculatorIcon className="mr-2 h-4 w-4" />
                      Run Optimization
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        {/* Results Section */}
        {results && (
          <div id="optimization-results" className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-heading font-medium text-primary mb-3">Optimization Results</h3>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Feasibility Status */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className={`h-4 w-4 rounded-full mr-2 ${results.feasible ? "bg-green-500" : "bg-red-500"}`}></div>
                  <h4 className="font-medium text-lg">
                    {results.feasible ? "Feasible Solution Found" : "No Feasible Solution"}
                  </h4>
                </div>
                {results.objectiveValue && (
                  <p className="mt-2">
                    <span className="font-medium">
                      {optimizationType === "profit_max" ? "Total Profit: " : "Total Cost: "}
                    </span>
                    {results.objectiveValue.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Solution Visualization */}
              {results.feasible && (
                <div className="p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Decision Variables</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#1F3A13" name="Optimal Value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Results Table */}
              {results.feasible && (
                <div className="p-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Optimal Solution</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Variable
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.variables.map((variable, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {variable.name}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {variable.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Constraints Status */}
              {results.feasible && (
                <div className="p-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Constraints Status</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Constraint
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Slack
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.constraints.map((constraint, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {constraint.name}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {constraint.slack.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${constraint.satisfied ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {constraint.satisfied ? 'Satisfied' : 'Not Satisfied'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Goal Achievement (for Goal Programming) */}
              {results.feasible && results.goals && results.goals.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Goal Achievement</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Goal
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Achievement
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Deviation
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.goals.map((goal, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {goal.name}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {goal.achievement.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                              {goal.deviation.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Optimization Summary</h4>
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded">
                  {results.summary}
                </pre>
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
      </div>
    </PanelContainer>
  );
}