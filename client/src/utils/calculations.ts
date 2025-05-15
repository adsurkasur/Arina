
import { 
  BusinessFeasibilityInput, 
  BusinessFeasibilityResult,
  InvestmentCost,
  OperationalCost
} from '@/types/analysis';

// Format currency in Indonesian Rupiah
const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

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
  if (monthlySalesVolume <= 0) return 0;
  const allocatedOperationalCost = monthlyOperationalCosts / monthlySalesVolume;
  return productionCostPerUnit + allocatedOperationalCost;
};

// Calculate selling price based on markup
export const calculateSellingPrice = (unitCost: number, markup: number): number => {
  return unitCost * (1 + markup / 100);
};

// Calculate Break Even Point in units
export const calculateBEPUnits = (
  totalInvestment: number,
  sellingPrice: number,
  unitCost: number,
  monthlyOperationalCosts: number
): number => {
  const contribution = sellingPrice - unitCost;
  if (contribution <= 0) return 0;
  return monthlyOperationalCosts > 0 ? 
    monthlyOperationalCosts / contribution : 
    totalInvestment / contribution;
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
  return revenue > 0 ? (netProfit / revenue) * 100 : 0;
};

// Calculate Payback Period (in months)
export const calculatePaybackPeriod = (
  totalInvestment: number,
  monthlyNetProfit: number
): number => {
  return monthlyNetProfit > 0 ? totalInvestment / monthlyNetProfit : 0;
};

// Format Payback Period as text
export const formatPaybackPeriod = (months: number): string => {
  if (months <= 0) return 'Tidak valid';
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.floor(months % 12);
  const weeks = Math.floor((months * 30 / 7) % 4);
  const days = Math.floor(months * 30 % 7);

  return `${years} tahun ${remainingMonths} bulan ${weeks} minggu ${days} hari`;
};

// Calculate Return on Investment (ROI)
export const calculateROI = (
  monthlyNetProfit: number,
  totalInvestment: number
): number => {
  return totalInvestment > 0 ? (monthlyNetProfit * 12 / totalInvestment) * 100 : 0;
};

// Determine if the business is feasible
export const isFeasible = (
  roi: number, 
  paybackPeriod: number, 
  projectLifespan: number
): boolean => {
  return roi > 15 && (paybackPeriod / 12) < projectLifespan;
};

// Generate a summary of the analysis
export const generateFeasibilitySummary = (
  input: BusinessFeasibilityInput,
  result: Omit<BusinessFeasibilityResult, 'summary'>
): string => {
  const { businessName } = input;
  const { 
    roi, 
    paybackPeriod, 
    monthlyNetProfit, 
    profitMargin, 
    breakEvenUnits, 
    sellingPrice,
    feasible 
  } = result;

  let summary = `Berdasarkan analisis, usaha ${businessName} `;
  
  if (feasible) {
    summary += `<span class="text-green-600 font-medium">layak</span> dengan ROI sebesar ${roi.toFixed(1)}% dan periode BEP ${formatPaybackPeriod(paybackPeriod)}. `;
    summary += `Profit bulanan sebesar ${formatRupiah(monthlyNetProfit)} menunjukkan margin profit yang sehat sebesar ${profitMargin.toFixed(1)}%.`;
  } else {
    summary += `<span class="text-red-600 font-medium">tidak layak</span> dengan parameter saat ini. `;
    summary += `Proyek memiliki ROI rendah sebesar ${roi.toFixed(1)}% dan/atau periode BEP yang terlalu lama yaitu ${formatPaybackPeriod(paybackPeriod)}.`;
  }

  summary += `\n\nTitik impas (BEP) sebesar ${Math.ceil(breakEvenUnits).toLocaleString()} unit dengan harga jual ${formatRupiah(sellingPrice)} per unit.`;

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
    totalInvestment,
    sellingPrice,
    unitCost,
    monthlyOperationalCosts
  );
  
  const breakEvenAmount = calculateBEPAmount(breakEvenUnits, sellingPrice);
  
  const monthlyNetProfit = calculateMonthlyNetProfit(
    input.monthlySalesVolume,
    sellingPrice,
    unitCost,
    monthlyOperationalCosts
  );
  
  const revenue = input.monthlySalesVolume * sellingPrice;
  const profitMargin = calculateProfitMargin(monthlyNetProfit, revenue);
  
  const paybackPeriod = calculatePaybackPeriod(totalInvestment, monthlyNetProfit);
  const roi = calculateROI(monthlyNetProfit, totalInvestment);
  
  const feasible = isFeasible(roi, paybackPeriod, input.projectLifespan);
  
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
