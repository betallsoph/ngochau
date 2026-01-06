// Re-export from new location for backward compatibility
// This file can be removed once all imports are updated

export type { RoomStatus, Building, Room, Invoice, DashboardStats, BuildingStats, Tenant, MeterReading } from './data';
export {
  buildings,
  mockRooms,
  mockInvoices,
  dashboardStats,
  calculateStats,
  calculateBuildingStats,
  getBuildingById,
  getRoomById
} from './data';
