// Path: utils\index.ts
/**
 * Export de todas as funções utilitárias para facilitar importações
 */

// Formatters
export {
    formatDate,
    formatDateTime,
    formatDuration,
    formatInitials,
    formatNumber,
    formatPercent,
    truncateText
  } from './formatters';
  
  // Chart Adapters
  export {
    CHART_COLORS,
    adaptDashboardSummary,
    adaptDashboardToPieChart,
    adaptLotsToStackedBarChart,
    adaptPitToMonthlyBarChart,
    adaptSubphaseSituationToStackedBarChart
  } from './chartAdapters';
  
  // Storage
  export {
    STORAGE_KEYS,
    getStorageItem,
    setStorageItem,
    removeStorageItem,
    saveUser,
    getUser,
    clearUser,
    saveUserPreferences,
    getUserPreferences
  } from './storage';
  
  // Validation
  export {
    isNumber,
    isValidCPF,
    isValidDate,
    isValidUrl,
    loginSchema,
    errorReportSchema
  } from './validation';
  
  // Types
  export type { StoredUser, UserPreferences } from './storage';
  export type { LoginFormValues, ErrorReportFormValues } from './validation';