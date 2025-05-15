import { ForecastInput, ForecastResult } from '@/types/analysis';

/**
 * Simple Moving Average (SMA) forecasting
 * Formula: SMA = (D1 + D2 + ... + Dn) / n
 */
export const calculateSMA = (
  historicalData: number[],
  periods: number
): number => {
  if (periods > historicalData.length) {
    throw new Error('Period length exceeds available historical data');
  }

  const lastNPeriods = historicalData.slice(-periods);
  const sum = lastNPeriods.reduce((acc, value) => acc + value, 0);
  return sum / periods;
};

/**
 * Generate SMA forecast for next period
 */
export const generateSMAForecast = (
  historicalData: number[],
  periodLength: number
): number[] => {
  const forecast = calculateSMA(historicalData, periodLength);
  return [forecast];
};

/**
 * Exponential Smoothing forecasting
 * Formula: Ft = α * Dt-1 + (1 - α) * Ft-1
 */
export const calculateExponentialSmoothing = (
  historicalData: number[],
  alpha: number,
  periodLength: number
): number[] => {
  if (alpha < 0 || alpha > 1) {
    throw new Error('Alpha must be between 0 and 1');
  }

  if (periodLength > historicalData.length) {
    throw new Error('Period length exceeds available historical data');
  }

  // Initialize with SMA for the first periodLength points
  const results: number[] = [];
  for (let i = 0; i < periodLength - 1; i++) {
    results.push(historicalData[i]);
  }

  // Calculate first EMA using SMA
  const firstSMA = calculateSMA(historicalData.slice(0, periodLength), periodLength);
  results.push(firstSMA);

  // Calculate subsequent EMAs
  for (let i = periodLength; i < historicalData.length; i++) {
    const forecast = alpha * historicalData[i-1] + (1 - alpha) * results[i-1];
    results.push(forecast);
  }

  return results;
};

/**
 * Generate Exponential Smoothing forecast for future periods
 */
export const generateExponentialForecast = (
  historicalData: number[],
  alpha: number,
  periodLength: number
): number[] => {
  const smoothedValues = calculateExponentialSmoothing(historicalData, alpha, periodLength);
  const lastActual = historicalData[historicalData.length - 1];
  const lastSmoothed = smoothedValues[smoothedValues.length - 1];

  // Generate next forecast
  const nextForecast = alpha * lastActual + (1 - alpha) * lastSmoothed;
  return [nextForecast];
};

/**
 * Calculate Mean Absolute Percentage Error (MAPE)
 */
export const calculateMAPE = (
  actual: number[],
  forecast: number[]
): number => {
  if (actual.length !== forecast.length) {
    throw new Error('Actual and forecast arrays must have the same length');
  }

  let sum = 0;
  let count = 0;

  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== 0) {
      sum += Math.abs((actual[i] - forecast[i]) / actual[i]);
      count++;
    }
  }

  return (sum / count) * 100;
};

/**
 * Calculate Mean Absolute Error (MAE)
 */
export const calculateMAE = (
  actual: number[],
  forecast: number[]
): number => {
  if (actual.length !== forecast.length) {
    throw new Error('Actual and forecast arrays must have the same length');
  }

  let sum = 0;

  for (let i = 0; i < actual.length; i++) {
    sum += Math.abs(actual[i] - forecast[i]);
  }

  return sum / actual.length;
};

/**
 * Generate period labels
 */
export const generatePeriodLabels = (
  count: number,
  prefix: string = 'Period',
  startAt: number = 1
): string[] => {
  const labels: string[] = [];

  for (let i = 0; i < count; i++) {
    labels.push(`${prefix} ${i + startAt}`);
  }

  return labels;
};

/**
 * Main function to generate forecast results
 */
export const generateForecast = (input: ForecastInput): ForecastResult => {
  const { 
    productName,
    historicalDemand,
    method,
    smoothingFactor = 0.3,
    periodLength = 3
  } = input;

  // Extract historical data
  const historicalData = historicalDemand.map(item => item.demand);
  const historicalPeriods = historicalDemand.map(item => item.period);

  // Generate forecasts
  let forecastedValues: number[] = [];

  if (method === 'sma') {
    forecastedValues = generateSMAForecast(
      historicalData,
      periodLength
    );
  } else if (method === 'exponential') {
    forecastedValues = generateExponentialForecast(
      historicalData,
      smoothingFactor,
      periodLength
    );
  }

  // Generate period labels for forecasts
  const lastHistoricalPeriodNumber = parseInt(
    historicalPeriods[historicalPeriods.length - 1].replace(/\D/g, '')
  );

  const forecastPeriodLabels = generatePeriodLabels(
    1, // Only one period
    'Period',
    lastHistoricalPeriodNumber + 1
  );

  // Create the forecasted periods array
  const forecasted = forecastPeriodLabels.map((period, index) => ({
    period,
    forecast: forecastedValues[index]
  }));

  // Calculate accuracy metrics for historical data
  let historicalForecasts: number[] = [];

  if (method === 'sma' && historicalData.length >= periodLength) {
    historicalForecasts = [];
    // First periodLength-1 values can't be calculated with SMA
    for (let i = 0; i < periodLength - 1; i++) {
      historicalForecasts.push(NaN);
    }

    // Calculate the rest
    for (let i = periodLength - 1; i < historicalData.length; i++) {
      const slice = historicalData.slice(i - periodLength + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / periodLength;
      historicalForecasts.push(avg);
    }
  } else if (method === 'exponential') {
    historicalForecasts = calculateExponentialSmoothing(historicalData, smoothingFactor);
  }

  // Filter out NaN values for MAPE calculation
  const actualFiltered: number[] = [];
  const forecastFiltered: number[] = [];

  for (let i = 0; i < historicalData.length; i++) {
    if (!isNaN(historicalForecasts[i])) {
      actualFiltered.push(historicalData[i]);
      forecastFiltered.push(historicalForecasts[i]);
    }
  }

  // Calculate accuracy metrics
  const mape = calculateMAPE(actualFiltered, forecastFiltered);
  const mae = calculateMAE(actualFiltered, forecastFiltered);

  return {
    productName,
    forecasted,
    accuracy: {
      mape,
      mae
    },
    chart: {
      historical: historicalDemand.map(item => ({
        period: item.period,
        value: item.demand
      })),
      forecast: forecasted.map(item => ({
        period: item.period,
        value: item.forecast
      }))
    }
  };
};