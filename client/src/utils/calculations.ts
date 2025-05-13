import { 
  BusinessFeasibilityInput, 
  BusinessFeasibilityResult,
  InvestmentCost,
  OperationalCost
} from '@/types/analysis';

// Calculate total investment costs
export const calculateTotalInvestment = (costs: InvestmentCost[]): number => {
  return costs.reduce((sum, cost) => sum + cost.amount, 0);
};

// Calculate total monthly operational costs
export const calculateTotalOperational = (costs: OperationalCost[]): number => {
  return costs.reduce((sum, cost) => sum + cost.amount, 0);
};

// Calculate unit cost (HPP - Harga Pokok Produksi)
export const calculateUnitCost = (
  productionCostPerUnit: number, 
  monthlyOperationalCosts: number,
  monthlySalesVolume: number
): number => {
  const allocatedOperationalCost = monthlyOperationalCosts / monthlySalesVolume;
  return productionCostPerUnit + allocatedOperationalCost;
};

// Calculate selling price based on markup
export const calculateSellingPrice = (unitCost: number, markup: number): number => {
  return unitCost * (1 + markup / 100);
};

// Calculate Break Even Point in units
export const calculateBEPUnits = (
  fixedCosts: number,
  sellingPrice: number,
  variableCost: number
): number => {
  return fixedCosts / (sellingPrice - variableCost);
};

// Calculate Break Even Point in Rupiah
export const calculateBEPAmount = (bepUnits: number, sellingPrice: number): number => {
  return bepUnits * sellingPrice;
};

// Calculate monthly net profit
export const calculateMonthlyNetProfit = (
  monthlySalesVolume: number,
  sellingPrice: number,
  unitCost: number,
  monthlyOperationalCosts: number
): number => {
  const revenue = monthlySalesVolume * sellingPrice;
  const productionCosts = monthlySalesVolume * unitCost;
  return revenue - productionCosts - monthlyOperationalCosts;
};

// Calculate Profit Margin
export const calculateProfitMargin = (
  netProfit: number,
  revenue: number
): number => {
  return (netProfit / revenue) * 100;
};

// Calculate Payback Period (in years)
export const calculatePaybackPeriod = (
  totalInvestment: number,
  annualNetProfit: number
): number => {
  return totalInvestment / annualNetProfit;
};

// Calculate Return on Investment (ROI)
export const calculateROI = (
  annualNetProfit: number,
  totalInvestment: number
): number => {
  return (annualNetProfit / totalInvestment) * 100;
};

// Determine if the business is feasible
export const isFeasible = (
  roi: number, 
  paybackPeriod: number, 
  projectLifespan: number
): boolean => {
  return roi > 0 && paybackPeriod < projectLifespan;
};

// Generate a summary of the analysis
export const generateFeasibilitySummary = (
  input: BusinessFeasibilityInput,
  result: Omit<BusinessFeasibilityResult, 'summary'>
): string => {
  const { businessName, projectLifespan } = input;
  const { 
    roi, 
    paybackPeriod, 
    monthlyNetProfit, 
    profitMargin, 
    breakEvenUnits, 
    monthlySalesVolume,
    feasible 
  } = { ...result, monthlySalesVolume: input.monthlySalesVolume };

  let summary = `Based on the analysis, this ${businessName} venture appears to be `;
  
  if (feasible) {
    summary += `<span class="text-green-600 font-medium">feasible</span> with a positive ROI of ${roi.toFixed(1)}% and a payback period of ${paybackPeriod.toFixed(1)} years. `;
    summary += `The monthly profit of Rp ${monthlyNetProfit.toLocaleString()} represents a healthy ${profitMargin.toFixed(1)}% profit margin.`;
  } else {
    summary += `<span class="text-red-600 font-medium">not feasible</span> with the current parameters. `;
    summary += `The project has a low ROI of ${roi.toFixed(1)}% and/or a long payback period of ${paybackPeriod.toFixed(1)} years.`;
  }

  summary += `\n\nThe break-even point of ${Math.ceil(breakEvenUnits).toLocaleString()} units is `;
  
  if (breakEvenUnits > monthlySalesVolume) {
    summary += `above your projected monthly sales volume of ${monthlySalesVolume.toLocaleString()} units, indicating that you may not reach profitability with your current business plan.`;
  } else {
    summary += `below your projected monthly sales volume of ${monthlySalesVolume.toLocaleString()} units, indicating that you should reach profitability with your current business plan.`;
  }

  return summary;
};

// Main function to analyze business feasibility
export const analyzeBusiness = (input: BusinessFeasibilityInput): BusinessFeasibilityResult => {
  const totalInvestment = calculateTotalInvestment(input.investmentCosts);
  const monthlyOperationalCosts = calculateTotalOperational(input.operationalCosts);
  
  const unitCost = calculateUnitCost(
    input.productionCostPerUnit,
    monthlyOperationalCosts,
    input.monthlySalesVolume
  );
  
  const sellingPrice = calculateSellingPrice(unitCost, input.markup);
  
  const breakEvenUnits = calculateBEPUnits(
    monthlyOperationalCosts,
    sellingPrice,
    input.productionCostPerUnit
  );
  
  const breakEvenAmount = calculateBEPAmount(breakEvenUnits, sellingPrice);
  
  const monthlyNetProfit = calculateMonthlyNetProfit(
    input.monthlySalesVolume,
    sellingPrice,
    input.productionCostPerUnit,
    monthlyOperationalCosts
  );
  
  const annualNetProfit = monthlyNetProfit * 12;
  
  const revenue = input.monthlySalesVolume * sellingPrice;
  const profitMargin = calculateProfitMargin(monthlyNetProfit, revenue);
  
  const paybackPeriod = calculatePaybackPeriod(totalInvestment, annualNetProfit);
  const roi = calculateROI(annualNetProfit, totalInvestment);
  
  // Business is considered feasible if ROI > 15% and payback period < 5 years
  const feasible = roi > 15 && paybackPeriod < 5;
  
  const partialResult = {
    unitCost,
    sellingPrice,
    breakEvenUnits,
    breakEvenAmount,
    monthlyNetProfit,
    profitMargin,
    paybackPeriod,
    roi,
    feasible
  };
  
  const summary = generateFeasibilitySummary(input, partialResult);
  
  return {
    ...partialResult,
    summary
  };
};
