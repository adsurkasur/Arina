import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to merge classes with tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme colors
export const theme = {
  colors: {
    primary: {
      DEFAULT: '#1F3A13',
      light: '#2A4D1A',
      lighter: '#4B7B3F',
    },
    accent: {
      DEFAULT: '#4B7B3F', 
      dark: '#3A6230',
      light: '#5C8F4F',
    },
    cream: {
      DEFAULT: '#F9F9EF',
      dark: '#E9E9DF',
    },
    chart: [
      '#1F3A13', // primary
      '#4B7B3F', // accent
      '#6B9D5B', // accent light
      '#8ABF7A', // light green
      '#A9DD99', // pale green
    ],
  },
  fontFamily: {
    heading: '"Plus Jakarta Sans", sans-serif',
    body: 'Inter, sans-serif',
    mono: '"IBM Plex Mono", monospace',
  },
};

// Icon mappings
export const icons = {
  business: "line-chart-line",
  forecast: "bar-chart-grouped-line",
  optimization: "pie-chart-line",
  chat: "chat-3-line",
  add: "add-line",
  settings: "settings-3-line",
  logout: "logout-box-line",
  question: "question-line",
  notification: "notification-3-line",
  delete: "delete-bin-line",
  edit: "edit-line",
  save: "save-line",
  download: "file-download-line",
  send: "send-plane-fill",
  close: "close-line",
  menu: "menu-line",
  plant: "plant-line",
  user: "user-line",
  google: "google-fill",
  calculation: "calculator-line",
  target: "target-line",
  money: "money-dollar-circle-line",
  profit: "funds-line",
  pdf: "file-pdf-line",
};
