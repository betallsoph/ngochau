// Data exports
// Import from here to use mock data or real API based on config

export * from './types';
export * from './config';
export {
  buildings,
  mockRooms,
  mockInvoices,
  dashboardStats,
  calculateStats,
  calculateBuildingStats,
  getBuildingById,
  getRoomById,
  generateRooms,
  generateInvoices,
  defaultPricingTemplate
} from './mock-data';
