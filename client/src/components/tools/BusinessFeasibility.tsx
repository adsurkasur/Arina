import React from "react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { X, Save, FileDown, CalculatorIcon, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { saveAnalysisResult } from "@/lib/mongodb";
import { analyzeBusiness } from "@/utils/calculations";
import {
  BusinessFeasibilityInput,
  BusinessFeasibilityResult,
  InvestmentCost,
  OperationalCost,
} from "@/types/analysis";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { useTranslation } from 'react-i18next';

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
} from "@/components/ui/tooltip";
import { PanelContainer } from "@/components/ui/PanelContainer";

// Form validation schema
const formSchema = z.object({
  businessName: z.string().min(1, { message: "Business name is required" }),
  investmentCosts: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, { message: "Item name is required" }),
      quantity: z
        .number()
        .min(0, { message: "Quantity must be a positive number" }),
      price: z.number().min(0, { message: "Price must be a positive number" }),
      amount: z
        .number()
        .min(0, { message: "Amount must be a positive number" }),
    }),
  ),
  operationalCosts: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, { message: "Item name is required" }),
      quantity: z
        .number()
        .min(0, { message: "Quantity must be a positive number" }),
      price: z.number().min(0, { message: "Price must be a positive number" }),
      amount: z
        .number()
        .min(0, { message: "Amount must be a positive number" }),
    }),
  ),
  productionCostPerUnit: z
    .number()
    .min(0, { message: "Production cost must be a positive number" }),
  monthlySalesVolume: z
    .number()
    .min(1, { message: "Sales volume must be at least 1" }),
  markup: z.number().min(0, { message: "Markup must be a positive number" }),
  projectLifespan: z
    .number()
    .min(1, { message: "Project lifespan must be at least 1 year" }),
});

interface BusinessFeasibilityProps {
  onClose: () => void;
  animatingOut?: boolean;
}

export default function BusinessFeasibility({
  onClose,
  animatingOut,
}: BusinessFeasibilityProps) {
  const [results, setResults] = useState<BusinessFeasibilityResult | null>(
    null,
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useAnalysisHistory();
  const { t } = useTranslation();

  // Initialize form with default values
  const form = useForm<BusinessFeasibilityInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      investmentCosts: [
        { id: uuidv4(), name: "", quantity: 0, price: 0, amount: 0 },
      ],
      operationalCosts: [
        { id: uuidv4(), name: "", quantity: 0, price: 0, amount: 0 },
      ],
      productionCostPerUnit: 0,
      monthlySalesVolume: 0,
      markup: 0,
      projectLifespan: 1,
    },
  });

  // Setup field arrays for dynamic inputs
  const {
    fields: investmentFields,
    append: appendInvestment,
    remove: removeInvestment,
  } = useFieldArray({
    control: form.control,
    name: "investmentCosts",
  });

  const {
    fields: operationalFields,
    append: appendOperational,
    remove: removeOperational,
  } = useFieldArray({
    control: form.control,
    name: "operationalCosts",
  });

  // Calculate feasibility
  const onSubmit = (data: BusinessFeasibilityInput) => {
    setIsCalculating(true);
    try {
      if (
        !data.businessName ||
        data.monthlySalesVolume <= 0 ||
        data.markup < 0
      ) {
        throw new Error("Please fill in all required fields with valid values");
      }

      const processedData = {
        ...data,
        investmentCosts: data.investmentCosts
          .filter((cost) => cost.name && cost.amount > 0)
          .map((cost) => ({
            ...cost,
            amount: Number(cost.amount),
          })),
        operationalCosts: data.operationalCosts
          .filter((cost) => cost.name && cost.amount > 0)
          .map((cost) => ({
            ...cost,
            amount: Number(cost.amount),
          })),
        productionCostPerUnit: Number(data.productionCostPerUnit),
        monthlySalesVolume: Number(data.monthlySalesVolume),
        markup: Number(data.markup),
        projectLifespan: Number(data.projectLifespan) || 1,
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
        document
          .getElementById("results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description:
          "There was an error calculating the business feasibility. Please check your inputs.",
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

      const { data, error } = await saveAnalysisResult(
        user.id,
        "business_feasibility",
        analysisData,
      );
      if (error) throw error;

      toast({
        title: "Analysis Saved",
        description:
          "Your business feasibility analysis has been saved successfully.",
      });
      await refetch(); // Refresh analysis history after save
    } catch (error: any) {
      toast({
        title: "Error Saving Analysis",
        description:
          error.message ||
          "There was an error saving your analysis. Please try again.",
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
    <PanelContainer onClose={onClose} title={t('tools.businessFeasibility.title')} animatingOut={animatingOut}>
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Business Info */}
            <div className="mb-4">
              <h3 className="font-medium text-lg mb-2">{t('tools.businessFeasibility.infoTitle')}</h3>
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel>{t('tools.businessFeasibility.businessName')}</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p>{t('tools.businessFeasibility.businessNameTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input placeholder={t('tools.businessFeasibility.businessNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section: Investment Costs */}
            <div className="mb-4">
              <h3 className="font-medium text-lg mb-2">{t('tools.businessFeasibility.investmentCostsTitle')}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('tools.businessFeasibility.investmentCosts')}
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.investmentCostsTooltip')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('tools.businessFeasibility.investmentCostsDesc')}
                </p>

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
                              placeholder={t('form.numberPlaceholder')}
                              type="number"
                              step="1"
                              min="0"
                              onWheel={(e) => e.currentTarget.blur()}
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
                                const price =
                                  form.getValues(
                                    `investmentCosts.${index}.price`,
                                  ) || 0;
                                form.setValue(
                                  `investmentCosts.${index}.amount`,
                                  Number(value) * Number(price),
                                );
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
                              placeholder={t('form.numberPlaceholder')}
                              type="number"
                              step="1"
                              min="0"
                              onWheel={(e) => e.currentTarget.blur()}
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
                                const quantity =
                                  form.getValues(
                                    `investmentCosts.${index}.quantity`,
                                  ) || 0;
                                form.setValue(
                                  `investmentCosts.${index}.amount`,
                                  Number(value) * Number(quantity),
                                );
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
                  onClick={() =>
                    appendInvestment({ id: uuidv4(), name: "", quantity: 0, price: 0, amount: 0 })
                  }
                  className="mt-2"
                >
                  {t('tools.businessFeasibility.addInvestmentCost')}
                </Button>
              </div>
            </div>

            {/* Section: Operational Costs */}
            <div className="mb-4">
              <h3 className="font-medium text-lg mb-2">{t('tools.businessFeasibility.operationalCostsTitle')}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('tools.businessFeasibility.operationalCosts')}
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.operationalCostsTooltip')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('tools.businessFeasibility.operationalCostsDesc')}
                </p>

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
                              placeholder={t('form.numberPlaceholder')}
                              type="number"
                              step="1"
                              min="0"
                              onWheel={(e) => e.currentTarget.blur()}
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
                                const price =
                                  form.getValues(
                                    `operationalCosts.${index}.price`,
                                  ) || 0;
                                form.setValue(
                                  `operationalCosts.${index}.amount`,
                                  Number(value) * Number(price),
                                );
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
                              placeholder={t('form.numberPlaceholder')}
                              type="number"
                              step="1"
                              min="0"
                              onWheel={(e) => e.currentTarget.blur()}
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
                                const quantity =
                                  form.getValues(
                                    `operationalCosts.${index}.quantity`,
                                  ) || 0;
                                form.setValue(
                                  `operationalCosts.${index}.amount`,
                                  Number(value) * Number(quantity),
                                );
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
                  onClick={() =>
                    appendOperational({ id: uuidv4(), name: "", quantity: 0, price: 0, amount: 0 })
                  }
                  className="mt-2"
                >
                  {t('tools.businessFeasibility.addOperationalCost')}
                </Button>
              </div>
            </div>

            {/* Section: Production & Sales Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productionCostPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel>{t('tools.businessFeasibility.productionCostPerUnit')}</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p>
                              {t('tools.businessFeasibility.productionCostPerUnitTooltip')}
                            </p>
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
                          if (e.key === "." || e.key === ",") {
                            e.preventDefault();
                          }
                        }}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
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
                      <FormLabel>{t('tools.businessFeasibility.monthlySalesVolume')}</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p>{t('tools.businessFeasibility.unitsSoldTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="0"
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
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
                      <FormLabel>{t('tools.businessFeasibility.markup')}</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-500" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px]">
                            <p>
                              {t('tools.businessFeasibility.markupTooltip')}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="0"
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Analysis Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                {t('form.reset')}
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <span className="animate-spin mr-2"></span>
                    {t('tools.businessFeasibility.calculating')}
                  </>
                ) : (
                  <>
                    <CalculatorIcon className="mr-2 h-4 w-4" />
                    {t('tools.businessFeasibility.calculate')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Results Section */}
        {results && (
          <div id="results" className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-heading font-medium text-primary mb-3">
              {t('tools.businessFeasibility.analysisResults')}
            </h3>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 p-4">
                <TooltipProvider>
                  {/* Unit Cost (HPP) */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('tools.businessFeasibility.unitCost')}
                          </div>
                          <div className="font-medium text-primary">
                            Rp {results.unitCost.toLocaleString()}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.unitCostTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.unitCostFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Selling Price */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('tools.businessFeasibility.sellingPrice')}
                          </div>
                          <div className="font-medium text-primary">
                            Rp {results.sellingPrice.toLocaleString()}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.sellingPriceTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.sellingPriceFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Break Even Point (Units) */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('tools.businessFeasibility.breakEvenUnits')}
                          </div>
                          <div className="font-medium text-primary">
                            {Math.ceil(results.breakEvenUnits).toLocaleString()} {t('tools.businessFeasibility.units')}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.breakEvenUnitsTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.breakEvenUnitsFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Break Even Point (Revenue) */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('tools.businessFeasibility.breakEvenAmount')}
                          </div>
                          <div className="font-medium text-primary">
                            Rp {results.breakEvenAmount.toLocaleString()}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.breakEvenAmountTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.breakEvenAmountFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Monthly Net Profit */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('tools.businessFeasibility.monthlyNetProfit')}
                          </div>
                          <div className="font-medium text-primary">
                            Rp {results.monthlyNetProfit.toLocaleString()}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.monthlyNetProfitTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.monthlyNetProfitFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Profit Margin */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('tools.businessFeasibility.profitMargin')}
                          </div>
                          <div className="font-medium text-primary">
                            {results.profitMargin.toFixed(1)}%
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.profitMarginTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.profitMarginFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Payback Period */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('tools.businessFeasibility.paybackPeriod')}
                          </div>
                          <div className="font-medium text-primary">
                            {results.paybackPeriod.toFixed(1)} {t('tools.businessFeasibility.years')}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.paybackPeriodTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.paybackPeriodFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* ROI */}
                  <div className="bg-cream rounded-lg p-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <div className="text-xs text-gray-500">{t('tools.businessFeasibility.roi')}</div>
                          <div className="font-medium text-primary">
                            {results.roi.toFixed(1)}%
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[300px]">
                        <p>
                          {t('tools.businessFeasibility.roiTooltip')}
                        </p>
                        <p className="mt-2 text-xs">
                          {t('tools.businessFeasibility.roiFormula')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>

              {/* Summary */}
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">
                  {t('tools.businessFeasibility.summaryTitle')}
                </h4>
                <div
                  className="text-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: results.summary }}
                ></div>
              </div>

              {/* Buttons */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={exportAsPDF}
                  className="text-gray-700"
                >
                  <FileDown className="mr-2 h-4 w-4" /> {t('tools.businessFeasibility.exportPDF')}
                </Button>
                <Button
                  onClick={saveAnalysis}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2"></span>
                      {t('tools.businessFeasibility.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t('tools.businessFeasibility.saveAnalysis')}
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
