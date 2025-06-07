// Business Feasibility Analysis Types
export interface InvestmentCost {
  id: string;
  name: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface OperationalCost {
  id: string;
  name: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface BusinessFeasibilityInput {
  businessName: string;
  investmentCosts: InvestmentCost[];
  operationalCosts: OperationalCost[];
  productionCostPerUnit: number;
  monthlySalesVolume: number;
  markup: number;
  projectLifespan: number;
}

export interface BusinessFeasibilityResult {
  unitCost: number;
  sellingPrice: number;
  breakEvenUnits: number;
  breakEvenAmount: number;
  monthlyNetProfit: number;
  profitMargin: number;
  paybackPeriod: number;
  roi: number;
  feasible: boolean;
  summary: string;
}

// Demand Forecasting Types
export interface HistoricalDemand {
  id: string;
  period: string;
  demand: number;
}

export interface ForecastInput {
  productName: string;
  historicalDemand: HistoricalDemand[];
  method: 'sma' | 'exponential';
  smoothingFactor?: number; // Alpha for exponential smoothing
  periodLength: number; // Number of periods for SMA calculation (e.g., 3 for SMA3)
}

export interface ForecastResult {
  productName: string;
  forecasted: {
    period: string;
    forecast: number;
  }[];
  accuracy: {
    mape?: number; // Mean Absolute Percentage Error
    mae?: number; // Mean Absolute Error
  };
  chart: {
    historical: { period: string; value: number }[];
    forecast: { period: string; value: number }[];
  };
}

// Optimization Analysis Types
export interface OptimizationVariable {
  id: string;
  name: string;
  lowerBound: number;
  upperBound: number;
  cost?: number;
  profit?: number;
}

export interface OptimizationConstraint {
  id: string;
  name: string;
  variables: {
    variableId: string;
    coefficient: number;
  }[];
  rhs: number; // Right-hand side
  sign: '<=' | '>=' | '=';
}

export interface OptimizationGoal {
  id: string;
  name: string;
  target: number;
  priority: number;
  variables: {
    variableId: string;
    coefficient: number;
  }[];
  direction: 'min' | 'max';
}

export interface OptimizationInput {
  name: string;
  type: 'profit_max' | 'cost_min' | 'goal_programming';
  variables: OptimizationVariable[];
  constraints: OptimizationConstraint[];
  goals?: OptimizationGoal[]; // Only for goal programming
  objective?: 'maximize' | 'minimize'; // For profit_max and cost_min
}

export interface OptimizationResult {
  name: string;
  type: 'profit_max' | 'cost_min' | 'goal_programming';
  feasible: boolean;
  objectiveValue?: number;
  variables: {
    id: string;
    name: string;
    value: number;
  }[];
  constraints: {
    id: string;
    name: string;
    slack: number;
    satisfied: boolean;
  }[];
  goals?: {
    id: string;
    name: string;
    achievement: number;
    deviation: number;
  }[];
  summary: string;
  chart: any; // Chart data for visualization
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  type: string;
  data: any;
  created_at: string;
  updated_at: string;
}
