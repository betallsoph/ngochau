// Mock data for multi-building room management system
import type {
  Building,
  Room,
  Tenant,
  Invoice,
  MeterReading,
  RoomStatus,
  RoomType,
  DashboardStats,
  BuildingStats,
  RoomPricing
} from './types';

// Default pricing template (used when room doesn't have custom pricing)
export const defaultPricingTemplate = {
  electricityRate: 3500, // đ/kWh
  waterRate: 15000, // đ/m³
  wifiFee: 100000, // đ/tháng
  trashFee: 30000, // đ/tháng
  parkingFee: 100000, // đ/tháng
};

// Vietnamese names for mock data
const vietnameseFirstNames = [
  'An', 'Bình', 'Cường', 'Dung', 'Em', 'Phương', 'Giang', 'Hà',
  'Hùng', 'Kim', 'Long', 'Mai', 'Nam', 'Oanh', 'Phúc', 'Quỳnh',
  'Sơn', 'Thanh', 'Tùng', 'Uyên', 'Vinh', 'Xuyến', 'Yên', 'Lan',
  'Minh', 'Ngọc', 'Quang', 'Thảo', 'Tuấn', 'Vân', 'Xuân', 'Hương',
  'Đức', 'Linh', 'Hải', 'Trang', 'Khoa', 'Nhung', 'Hiếu', 'Thủy'
];

const vietnameseLastNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi',
  'Đỗ', 'Ngô', 'Dương', 'Lý', 'Vũ', 'Phan', 'Trịnh', 'Đinh',
  'Hồ', 'Tô', 'Lương', 'Mai', 'Chu', 'Cao', 'Tạ', 'La'
];

const vietnameseMiddleNames = [
  'Văn', 'Thị', 'Hữu', 'Ngọc', 'Minh', 'Thanh', 'Hoàng', 'Kim',
  'Quốc', 'Anh', 'Đức', 'Xuân', 'Thu', 'Hồng', 'Bảo', 'Phương'
];

// Generate random Vietnamese name
const generateVietnameseName = (): string => {
  const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
  const middleName = vietnameseMiddleNames[Math.floor(Math.random() * vietnameseMiddleNames.length)];
  const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
  return `${lastName} ${middleName} ${firstName}`;
};

// Generate random phone number
const generatePhone = (): string => {
  const prefixes = ['090', '091', '093', '094', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039', '070', '076', '077', '078', '079', '081', '082', '083', '084', '085'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
};

// Generate random CCCD number
const generateIdNumber = (): string => {
  const provinceCode = Math.floor(Math.random() * 96).toString().padStart(3, '0');
  const genderYear = Math.floor(Math.random() * 2) + (Math.random() > 0.5 ? 0 : 1);
  const yearCode = genderYear.toString();
  const randomPart = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return provinceCode + yearCode + randomPart;
};

// Generate random date in the past (1-36 months ago)
const generateMoveInDate = (): string => {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * 36) + 1;
  now.setMonth(now.getMonth() - monthsAgo);
  now.setDate(Math.floor(Math.random() * 28) + 1);
  return now.toISOString().split('T')[0];
};

// Buildings data
export const buildings: Building[] = [
  {
    id: 'hagl3',
    name: 'Hoàng Anh Gia Lai 3',
    shortName: 'HAGL 3',
    address: '121 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM',
    totalRooms: 60,
    floors: 6,
    electricityRate: 3500,
    waterRate: 15000
  },
  {
    id: 'pha',
    name: 'Phú Hoàng Anh',
    shortName: 'Phú Hoàng Anh',
    address: '1 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM',
    totalRooms: 50,
    floors: 5,
    electricityRate: 3500,
    waterRate: 15000
  },
  {
    id: 'ssr',
    name: 'Saigon South Residences',
    shortName: 'SSR',
    address: '63 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM',
    totalRooms: 45,
    floors: 5,
    electricityRate: 3800,
    waterRate: 18000
  },
  {
    id: 'sunrise',
    name: 'Sunrise Riverside',
    shortName: 'Sunrise',
    address: '60 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM',
    totalRooms: 45,
    floors: 5,
    electricityRate: 3800,
    waterRate: 18000
  },
  {
    id: 'mp6',
    name: 'Mizuki Park 6',
    shortName: 'MP6',
    address: 'Nguyễn Văn Linh, Bình Chánh, TP.HCM',
    totalRooms: 8,
    floors: 3,
    electricityRate: 3500,
    waterRate: 15000
  }
];

// Generate tenant
const generateTenant = (): Tenant => {
  return {
    id: 'T' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    name: generateVietnameseName(),
    phone: generatePhone(),
    idNumber: generateIdNumber(),
    moveInDate: generateMoveInDate(),
    deposit: (Math.floor(Math.random() * 3) + 1) * 5000000,
    notes: Math.random() > 0.8 ? 'Khách quen, đóng tiền đúng hạn' : undefined
  };
};

// Generate meter readings for last 6 months
const generateMeterReadings = (): MeterReading[] => {
  const readings: MeterReading[] = [];
  const now = new Date();
  let electricityBase = Math.floor(Math.random() * 1000) + 100;
  let waterBase = Math.floor(Math.random() * 50) + 10;

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}`;

    const electricityUsage = Math.floor(Math.random() * 150) + 80; // 80-230 kWh/month
    const waterUsage = Math.floor(Math.random() * 8) + 3; // 3-11 m³/month

    readings.push({
      month: monthStr,
      electricityPrev: electricityBase,
      electricityCurr: electricityBase + electricityUsage,
      waterPrev: waterBase,
      waterCurr: waterBase + waterUsage,
      recordedAt: new Date(month.getFullYear(), month.getMonth() + 1, 5).toISOString().split('T')[0]
    });

    electricityBase += electricityUsage;
    waterBase += waterUsage;
  }

  return readings;
};

// Generate rooms for all buildings (200 total)
export const generateRooms = (): Room[] => {
  const rooms: Room[] = [];
  let globalId = 1;

  buildings.forEach((building) => {
    const roomsPerFloor = Math.ceil(building.totalRooms / building.floors);

    for (let i = 1; i <= building.totalRooms; i++) {
      const floor = Math.ceil(i / roomsPerFloor);
      const roomOnFloor = ((i - 1) % roomsPerFloor) + 1;

      // Special room code format for MP6: MP-tầng-phòng
      let roomNumber: string;
      let roomCode: string | undefined;

      if (building.id === 'mp6') {
        roomNumber = `${floor}${roomOnFloor.toString().padStart(2, '0')}`;
        roomCode = `MP-${floor}-${roomOnFloor.toString().padStart(2, '0')}`;
      } else {
        roomNumber = `${floor}${roomOnFloor.toString().padStart(2, '0')}`;
      }

      // Random status distribution: 12% empty, 63% paid, 25% debt
      const random = Math.random();
      let status: RoomStatus;
      let tenant: Tenant | undefined;
      let debtAmount: number | undefined;

      if (random < 0.12) {
        status = 'empty';
      } else if (random < 0.75) {
        status = 'paid';
        tenant = generateTenant();
      } else {
        status = 'debt';
        tenant = generateTenant();
        debtAmount = Math.floor(Math.random() * 4 + 1) * 1000000; // 1-5 triệu
      }

      // Rent varies by building and floor
      const baseRent = building.id === 'ssr' || building.id === 'sunrise' ? 8000000 : 5000000;
      const floorBonus = (floor - 1) * 500000;
      const monthlyRent = baseRent + floorBonus + Math.floor(Math.random() * 3) * 1000000;

      // Area varies by building
      const baseArea = building.id === 'ssr' || building.id === 'sunrise' ? 65 : 50;
      const area = baseArea + Math.floor(Math.random() * 20);

      // Random room type: 60% standard, 25% master, 15% balcony
      const typeRandom = Math.random();
      let roomType: RoomType;
      if (typeRandom < 0.60) {
        roomType = 'standard';
      } else if (typeRandom < 0.85) {
        roomType = 'master';
      } else {
        roomType = 'balcony';
      }

      rooms.push({
        id: globalId++,
        buildingId: building.id,
        roomNumber,
        roomCode,
        roomType,
        floor,
        status,
        monthlyRent,
        area,
        debtAmount,
        tenant,
        meterReadings: tenant ? generateMeterReadings() : []
      });
    }
  });

  return rooms;
};

// Generate invoices
export const generateInvoices = (rooms: Room[]): Invoice[] => {
  const invoices: Invoice[] = [];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;

  // Generate invoices for occupied rooms
  rooms.filter(r => r.tenant).forEach((room, index) => {
    const building = buildings.find(b => b.id === room.buildingId)!;
    const lastReading = room.meterReadings[room.meterReadings.length - 1];

    if (!lastReading || !room.tenant) return;

    const electricityUsage = lastReading.electricityCurr - lastReading.electricityPrev;
    const waterUsage = lastReading.waterCurr - lastReading.waterPrev;
    const electricityAmount = electricityUsage * building.electricityRate;
    const waterAmount = waterUsage * building.waterRate;
    const otherFees = 100000 + 30000; // wifi + rác
    const totalAmount = room.monthlyRent + electricityAmount + waterAmount + otherFees;

    // Random status based on room status
    let status: 'paid' | 'pending' | 'overdue';
    let paidDate: string | undefined;

    if (room.status === 'paid') {
      status = 'paid';
      const payDate = new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random() * 10) + 1);
      paidDate = payDate.toISOString().split('T')[0];
    } else if (room.status === 'debt') {
      status = Math.random() > 0.5 ? 'overdue' : 'pending';
    } else {
      return; // Empty rooms don't have invoices
    }

    const dueDate = new Date(now.getFullYear(), now.getMonth(), 10);

    invoices.push({
      id: `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${(index + 1).toString().padStart(4, '0')}`,
      buildingId: room.buildingId,
      roomId: room.id,
      roomNumber: room.roomNumber,
      tenantName: room.tenant.name,
      tenantPhone: room.tenant.phone,
      month: lastMonthStr,
      rentAmount: room.monthlyRent,
      electricityUsage,
      electricityAmount,
      waterUsage,
      waterAmount,
      otherFees,
      totalAmount,
      dueDate: dueDate.toISOString().split('T')[0],
      paidDate,
      status,
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    });
  });

  return invoices.sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    if (a.status === 'pending' && b.status === 'paid') return -1;
    if (a.status === 'paid' && b.status === 'pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// Calculate dashboard stats
export const calculateStats = (rooms: Room[], invoices: Invoice[]): DashboardStats => {
  const occupiedRooms = rooms.filter(r => r.status !== 'empty');
  const totalRevenue = occupiedRooms.reduce((sum, room) => sum + room.monthlyRent, 0);
  const emptyRooms = rooms.filter(r => r.status === 'empty').length;
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid').length;
  const expiringContracts = Math.floor(occupiedRooms.length * 0.08); // ~8% expiring

  return {
    totalRevenue,
    emptyRooms,
    unpaidInvoices,
    expiringContracts,
    totalRooms: rooms.length,
    occupiedRooms: occupiedRooms.length
  };
};

// Calculate stats per building
export const calculateBuildingStats = (rooms: Room[], buildingId: string): BuildingStats => {
  const buildingRooms = rooms.filter(r => r.buildingId === buildingId);
  return {
    total: buildingRooms.length,
    empty: buildingRooms.filter(r => r.status === 'empty').length,
    paid: buildingRooms.filter(r => r.status === 'paid').length,
    debt: buildingRooms.filter(r => r.status === 'debt').length,
    revenue: buildingRooms.filter(r => r.status !== 'empty').reduce((sum, r) => sum + r.monthlyRent, 0)
  };
};

// Helper to get building by ID
export const getBuildingById = (id: string): Building | undefined => {
  return buildings.find(b => b.id === id);
};

// Helper to get room by ID
export const getRoomById = (rooms: Room[], id: number): Room | undefined => {
  return rooms.find(r => r.id === id);
};

// Static data (generated once)
export const mockRooms = generateRooms();
export const mockInvoices = generateInvoices(mockRooms);
export const dashboardStats = calculateStats(mockRooms, mockInvoices);
