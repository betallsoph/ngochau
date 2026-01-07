'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Search,
  Plus,
  Users,
  UserPlus,
  User,
  Phone,
  Calendar,
  CreditCard,
  Home,
  Building2,
  FileText,
  Car,
  Clock,
  Banknote,
  X,
  Mail,
  MapPin,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { mockRooms, buildings, getBuildingById } from '@/lib/data';

// Extended tenant type with more details
interface Tenant {
  id: number;
  name: string;
  buildingId: string;
  roomNumber: string;
  phone: string;
  email?: string;
  idNumber: string;
  idIssuedDate?: string;
  idIssuedPlace?: string;
  permanentAddress?: string;
  startDate: string;
  endDate: string;
  status: 'paid' | 'debt' | 'empty';
  deposit: number;
  monthlyRent: number;
  vehicles?: {
    type: 'motorbike' | 'car' | 'bicycle';
    licensePlate: string;
    brand?: string;
    color?: string;
  }[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
}

// Vietnamese vehicle types
const vehicleTypeLabels: Record<string, string> = {
  motorbike: 'Xe máy',
  car: 'Ô tô',
  bicycle: 'Xe đạp',
};

// Generate tenants from rooms with tenant info
const tenants: Tenant[] = mockRooms
  .filter(room => room.tenant)
  .map((room, index) => {
    const tenant = room.tenant!;
    const hasVehicle = Math.random() > 0.3;
    const hasEmergencyContact = Math.random() > 0.4;

    return {
      id: index + 1,
      name: tenant.name,
      buildingId: room.buildingId,
      roomNumber: room.roomNumber,
      phone: tenant.phone,
      email: Math.random() > 0.5 ? `${tenant.name.split(' ').pop()?.toLowerCase()}${Math.floor(Math.random() * 100)}@gmail.com` : undefined,
      idNumber: tenant.idNumber,
      idIssuedDate: new Date(new Date(tenant.moveInDate).getTime() - 365 * 24 * 60 * 60 * 1000 * Math.floor(Math.random() * 5 + 1)).toISOString().split('T')[0],
      idIssuedPlace: ['CA TP.HCM', 'CA Hà Nội', 'CA Đà Nẵng', 'CA Bình Dương', 'CA Đồng Nai'][Math.floor(Math.random() * 5)],
      permanentAddress: [
        '123 Nguyễn Văn Linh, Q.7, TP.HCM',
        '45 Lê Lợi, Q.1, TP.HCM',
        '78 Trần Hưng Đạo, Hà Nội',
        '156 Phan Đình Phùng, Đà Nẵng',
        '234 Lý Thường Kiệt, Bình Dương',
      ][Math.floor(Math.random() * 5)],
      startDate: tenant.moveInDate,
      endDate: new Date(new Date(tenant.moveInDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: room.status as 'paid' | 'debt' | 'empty',
      deposit: tenant.deposit,
      monthlyRent: room.monthlyRent,
      vehicles: hasVehicle ? [{
        type: ['motorbike', 'car', 'bicycle'][Math.floor(Math.random() * 3)] as 'motorbike' | 'car' | 'bicycle',
        licensePlate: `${Math.floor(Math.random() * 99) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 90) + 10}`,
        brand: ['Honda', 'Yamaha', 'SYM', 'Piaggio', 'VinFast'][Math.floor(Math.random() * 5)],
        color: ['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Bạc'][Math.floor(Math.random() * 5)],
      }] : undefined,
      emergencyContact: hasEmergencyContact ? {
        name: ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung'][Math.floor(Math.random() * 4)],
        phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        relationship: ['Bố', 'Mẹ', 'Anh/Chị', 'Vợ/Chồng'][Math.floor(Math.random() * 4)],
      } : undefined,
      notes: tenant.notes,
    };
  });

// Get empty rooms for tenant assignment
const emptyRooms = mockRooms.filter(room => room.status === 'empty');

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'debt'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  // Detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = useMemo(() => {
    return tenants.filter(tenant => {
      const matchSearch = tenant.name.toLowerCase().includes(search.toLowerCase()) ||
        tenant.roomNumber.includes(search) ||
        tenant.phone.includes(search);
      const matchBuilding = buildingFilter === 'all' || tenant.buildingId === buildingFilter;
      const matchStatus = statusFilter === 'all' || tenant.status === statusFilter;
      return matchSearch && matchBuilding && matchStatus;
    });
  }, [search, buildingFilter, statusFilter]);

  const stats = useMemo(() => {
    const list = buildingFilter === 'all' ? tenants : tenants.filter(t => t.buildingId === buildingFilter);
    return {
      total: list.length,
      paid: list.filter(t => t.status === 'paid').length,
      debt: list.filter(t => t.status === 'debt').length
    };
  }, [buildingFilter]);

  const availableRooms = useMemo(() => {
    if (!selectedBuilding) return emptyRooms;
    return emptyRooms.filter(r => r.buildingId === selectedBuilding);
  }, [selectedBuilding]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const handleRowClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDetailSheetOpen(true);
  };

  // Check if contract is expiring soon (within 30 days)
  const isContractExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  // Check if contract is expired
  const isContractExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Khách thuê</h1>
          <p className="text-muted-foreground">
            {stats.total} khách: <span className="text-emerald-600">{stats.paid} đã đóng tiền</span>, <span className="text-red-600">{stats.debt} còn nợ</span>
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm khách thuê
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm khách thuê mới</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Họ và tên</Label>
                <Input id="tenantName" placeholder="Nhập họ tên khách thuê" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" placeholder="0901234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">CMND/CCCD</Label>
                  <Input id="idNumber" placeholder="Nhập số CMND" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Tòa nhà</Label>
                  <Select value={selectedBuilding} onValueChange={(v) => { setSelectedBuilding(v); setSelectedRoom(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tòa nhà" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Phòng trống</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedBuilding}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedBuilding ? "Chọn phòng" : "Chọn tòa nhà trước"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>P.{r.roomNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày vào</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Tiền cọc (đ)</Label>
                  <Input id="deposit" type="number" placeholder="5000000" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" onClick={(e) => { e.preventDefault(); setDialogOpen(false); }}>
                  Thêm khách thuê
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm tên, số phòng, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Chọn tòa nhà" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tòa nhà</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'paid' | 'debt')}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="paid">Đã đóng tiền</SelectItem>
            <SelectItem value="debt">Còn nợ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table - Simplified */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách thuê</TableHead>
                <TableHead className="hidden sm:table-cell">Tòa nhà</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead className="hidden md:table-cell">SĐT</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.slice(0, 30).map((tenant) => {
                const building = getBuildingById(tenant.buildingId);
                const isDebt = tenant.status === 'debt';
                return (
                  <TableRow
                    key={tenant.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(tenant)}
                  >
                    <TableCell>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{tenant.phone}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {building?.shortName}
                    </TableCell>
                    <TableCell className="font-medium">P.{tenant.roomNumber}</TableCell>
                    <TableCell className="hidden md:table-cell">{tenant.phone}</TableCell>
                    <TableCell>
                      <span className={isDebt ? 'text-red-600 font-medium' : 'text-emerald-600'}>
                        {isDebt ? 'Còn nợ' : 'Đã đóng'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredTenants.length === 0 && (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-2">Không tìm thấy khách thuê</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search || buildingFilter !== 'all' || statusFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Bắt đầu bằng việc thêm khách thuê mới'}
              </p>
              {!search && buildingFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm khách thuê đầu tiên
                </Button>
              )}
            </div>
          )}
          {filteredTenants.length > 30 && (
            <p className="p-4 text-center text-sm text-muted-foreground border-t">
              Hiển thị 30/{filteredTenants.length} khách thuê
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tenant Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col" hideCloseButton>
          {selectedTenant && (
            <>
              {/* Fixed Header */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-slate-50/80">
                <SheetHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setDetailSheetOpen(false)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Đóng
                    </Button>
                    <SheetTitle className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                      <div className="min-w-0">
                        <span className="text-lg">Phòng {selectedTenant.roomNumber}</span>
                        <p className="text-sm font-normal text-muted-foreground truncate">
                          {getBuildingById(selectedTenant.buildingId)?.name}
                        </p>
                      </div>
                      <Building2 className="h-6 w-6 text-slate-600 shrink-0" />
                    </SheetTitle>
                  </div>
                </SheetHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Thông tin cá nhân
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="font-medium text-lg">{selectedTenant.name}</span>
                      <Badge
                        variant="outline"
                        className={selectedTenant.status === 'debt'
                          ? 'bg-red-50 text-red-600 border-red-200 ml-auto'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 ml-auto'}
                      >
                        {selectedTenant.status === 'debt' ? 'Còn nợ' : 'Đã đóng tiền'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                      <span>{selectedTenant.phone}</span>
                    </div>
                    {selectedTenant.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                        <span>{selectedTenant.email}</span>
                      </div>
                    )}
                    {selectedTenant.permanentAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{selectedTenant.permanentAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contract Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Thông tin hợp đồng
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Ngày vào ở
                      </span>
                      <span className="font-medium">{formatDate(selectedTenant.startDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Ngày hết hạn HĐ
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatDate(selectedTenant.endDate)}</span>
                        {isContractExpired(selectedTenant.endDate) && (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            Hết hạn
                          </Badge>
                        )}
                        {isContractExpiringSoon(selectedTenant.endDate) && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                            Sắp hết hạn
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Thời hạn hợp đồng
                      </span>
                      <span className="font-medium">
                        {(() => {
                          const start = new Date(selectedTenant.startDate);
                          const end = new Date(selectedTenant.endDate);
                          const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
                          return `${months} tháng`;
                        })()}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Tiền phòng/tháng
                      </span>
                      <span className="font-medium">{formatCurrency(selectedTenant.monthlyRent)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Tiền cọc
                      </span>
                      <span className="font-medium text-emerald-600">{formatCurrency(selectedTenant.deposit)}</span>
                    </div>
                  </div>
                </div>

                {/* ID Card Info - moved below Contract Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Căn cước công dân
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Số CCCD</span>
                      <span className="font-medium font-mono">{selectedTenant.idNumber}</span>
                    </div>
                    {selectedTenant.idIssuedDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ngày cấp</span>
                        <span>{formatDate(selectedTenant.idIssuedDate)}</span>
                      </div>
                    )}
                    {selectedTenant.idIssuedPlace && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Nơi cấp</span>
                        <span>{selectedTenant.idIssuedPlace}</span>
                      </div>
                    )}
                    <Separator />
                    {/* Placeholder for ID card images */}
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Hình ảnh CCCD</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="aspect-[3/2] bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-2 text-slate-400" />
                          <span className="text-xs">Mặt trước</span>
                        </div>
                        <div className="aspect-[3/2] bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-2 text-slate-400" />
                          <span className="text-xs">Mặt sau</span>
                        </div>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">Chưa có hình ảnh CCCD</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Registration Documents */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="h-4 w-4" />
                    Giấy đăng ký xe
                  </h4>
                  {selectedTenant.vehicles && selectedTenant.vehicles.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTenant.vehicles.map((vehicle, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{vehicleTypeLabels[vehicle.type]}</span>
                            <Badge variant="outline">{vehicle.licensePlate}</Badge>
                          </div>
                          {(vehicle.brand || vehicle.color) && (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              {vehicle.brand && <span>Hãng: {vehicle.brand}</span>}
                              {vehicle.color && <span>Màu: {vehicle.color}</span>}
                            </div>
                          )}
                          <Separator />
                          {/* Placeholder for vehicle registration image */}
                          <div className="space-y-2">
                            <div className="aspect-[3/2] bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-8 w-8 mb-2 text-slate-400" />
                              <span className="text-xs">Giấy đăng ký xe</span>
                            </div>
                            <p className="text-xs text-center text-muted-foreground">Chưa có Giấy đăng ký xe</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <p className="text-center text-muted-foreground">Chưa đăng ký phương tiện</p>
                      <div className="aspect-[3/2] bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8 mb-2 text-slate-400" />
                        <span className="text-xs">Giấy đăng ký xe</span>
                      </div>
                      <p className="text-xs text-center text-muted-foreground">Chưa có Giấy đăng ký xe</p>
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    Liên hệ khẩn cấp
                  </h4>
                  {selectedTenant.emergencyContact ? (
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{selectedTenant.emergencyContact.name}</span>
                        <Badge variant="outline">{selectedTenant.emergencyContact.relationship}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <span>{selectedTenant.emergencyContact.phone}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-4 text-center text-muted-foreground">
                      Chưa có thông tin liên hệ khẩn cấp
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedTenant.notes && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Ghi chú
                    </h4>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm">{selectedTenant.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-4 sm:px-6 py-4 border-t bg-white mt-auto">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Gọi điện
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Xem hóa đơn
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
