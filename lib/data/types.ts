// Type definitions for room management system

export type RoomStatus = 'empty' | 'paid' | 'debt';
export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface Building {
  id: string;
  name: string;
  shortName: string;
  address: string;
  totalRooms: number;
  floors: number;
  electricityRate: number; // đ/kWh
  waterRate: number; // đ/m³
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  idNumber: string; // CCCD
  idFrontImage?: string;
  idBackImage?: string;
  vehicleImage?: string;
  contractImage?: string;
  moveInDate: string;
  deposit: number;
  notes?: string;
}

export interface MeterReading {
  month: string; // YYYY-MM
  electricityPrev: number;
  electricityCurr: number;
  waterPrev: number;
  waterCurr: number;
  recordedAt: string;
}

// Custom pricing for a room (overrides default template)
export interface RoomPricing {
  useCustomPricing: boolean;
  electricityRate?: number; // đ/kWh
  waterRate?: number; // đ/m³
  wifiFee?: number; // đ/tháng
  trashFee?: number; // đ/tháng
  parkingFee?: number; // đ/tháng
}

export interface Room {
  id: number;
  buildingId: string;
  roomNumber: string;
  roomCode?: string; // Mã căn hộ
  floor?: number;
  status: RoomStatus;
  monthlyRent: number;
  area?: number; // m²
  debtAmount?: number;
  tenant?: Tenant;
  meterReadings: MeterReading[];
  customPricing?: RoomPricing; // Giá riêng cho phòng này
}

export interface Invoice {
  id: string;
  buildingId: string;
  roomId: number;
  roomNumber: string;
  tenantName: string;
  tenantPhone: string;
  month: string; // YYYY-MM
  rentAmount: number;
  electricityUsage: number;
  electricityAmount: number;
  waterUsage: number;
  waterAmount: number;
  otherFees: number;
  totalAmount: number;
  dueDate: string;
  paidDate?: string;
  status: InvoiceStatus;
  createdAt: string;
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  emptyRooms: number;
  unpaidInvoices: number;
  expiringContracts: number;
  totalRooms: number;
  occupiedRooms: number;
}

export interface BuildingStats {
  total: number;
  empty: number;
  paid: number;
  debt: number;
  revenue: number;
}
