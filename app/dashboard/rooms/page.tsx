'use client';

import { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Plus, User, Zap, Droplet, FileText, Calculator, Phone, Calendar, CreditCard, Home, DollarSign, Wifi, Trash2, Car, Save, Loader2, LogOut, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ImageIcon, Camera, X, Building2 } from 'lucide-react';
import { ImageUploader } from '@/components/ui/image-uploader';
import { mockRooms, buildings, getBuildingById, defaultPricingTemplate, type Room, type RoomStatus } from '@/lib/data';
import { toast } from 'sonner';

type FilterStatus = 'all' | 'empty' | 'occupied' | 'debt';

// Pagination config
const ITEMS_PER_PAGE = 20;

// Skeleton component for table rows
function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
    </TableRow>
  );
}

// Skeleton component for mobile cards
function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="pt-2 border-t">
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// Form state types
interface NewRoomForm {
  building: string;
  roomNumber: string;
  roomCode: string;
  floor: string;
  monthlyRent: string;
  area: string;
}

interface TenantForm {
  name: string;
  phone: string;
  idNumber: string;
  moveInDate: string;
  deposit: string;
  notes: string;
}

interface MeterForm {
  newElectricity: string;
  newWater: string;
}

function RoomsContent() {
  const searchParams = useSearchParams();
  const initialBuilding = searchParams.get('building') || 'all';

  // UI States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>(initialBuilding);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addTenantDialogOpen, setAddTenantDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Loading states
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isSavingTenant, setIsSavingTenant] = useState(false);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Form states
  const [newRoomForm, setNewRoomForm] = useState<NewRoomForm>({
    building: '',
    roomNumber: '',
    roomCode: '',
    floor: '',
    monthlyRent: '',
    area: '',
  });

  const [tenantForm, setTenantForm] = useState<TenantForm>({
    name: '',
    phone: '',
    idNumber: '',
    moveInDate: '',
    deposit: '',
    notes: '',
  });

  const [meterForm, setMeterForm] = useState<MeterForm>({
    newElectricity: '',
    newWater: '',
  });

  // Custom pricing state for selected room
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [customPricing, setCustomPricing] = useState({
    electricityRate: defaultPricingTemplate.electricityRate,
    waterRate: defaultPricingTemplate.waterRate,
    wifiFee: defaultPricingTemplate.wifiFee,
    trashFee: defaultPricingTemplate.trashFee,
    parkingFee: defaultPricingTemplate.parkingFee,
  });

  // Simulate loading on filter change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter, buildingFilter, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, buildingFilter]);

  // Filtered rooms with search and status filter
  const filteredRooms = useMemo(() => {
    return mockRooms.filter(room => {
      const matchSearch = room.roomNumber.includes(search) ||
        (room.tenant?.name?.toLowerCase().includes(search.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === 'empty') matchStatus = room.status === 'empty';
      else if (statusFilter === 'occupied') matchStatus = room.status === 'paid';
      else if (statusFilter === 'debt') matchStatus = room.status === 'debt';

      const matchBuilding = buildingFilter === 'all' || room.buildingId === buildingFilter;
      return matchSearch && matchStatus && matchBuilding;
    });
  }, [search, statusFilter, buildingFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Stats
  const stats = useMemo(() => {
    const rooms = buildingFilter === 'all' ? mockRooms : mockRooms.filter(r => r.buildingId === buildingFilter);
    return {
      total: rooms.length,
      empty: rooms.filter(r => r.status === 'empty').length,
      paid: rooms.filter(r => r.status === 'paid').length,
      debt: rooms.filter(r => r.status === 'debt').length
    };
  }, [buildingFilter]);

  const selectedBuilding = buildingFilter !== 'all' ? getBuildingById(buildingFilter) : null;

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'empty': return <Badge variant="secondary">Trống</Badge>;
      case 'paid': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đã đóng tiền</Badge>;
      case 'debt': return <Badge variant="destructive">Còn nợ</Badge>;
    }
  };

  const getLastMeterReading = (room: Room) => {
    if (!room.meterReadings || room.meterReadings.length === 0) return null;
    return room.meterReadings[room.meterReadings.length - 1];
  };

  // Get effective pricing for current room
  const getEffectivePricing = useCallback(() => {
    if (useCustomPricing) {
      return customPricing;
    }
    return defaultPricingTemplate;
  }, [useCustomPricing, customPricing]);

  // Calculate invoice preview
  const invoicePreview = useMemo(() => {
    if (!selectedRoom) return null;

    const lastReading = getLastMeterReading(selectedRoom);
    const pricing = getEffectivePricing();

    const prevElectricity = lastReading?.electricityCurr || 0;
    const prevWater = lastReading?.waterCurr || 0;
    const newElectricity = parseInt(meterForm.newElectricity) || prevElectricity;
    const newWater = parseInt(meterForm.newWater) || prevWater;

    const electricityUsage = Math.max(0, newElectricity - prevElectricity);
    const waterUsage = Math.max(0, newWater - prevWater);

    const electricityCost = electricityUsage * pricing.electricityRate;
    const waterCost = waterUsage * pricing.waterRate;
    const otherFees = pricing.wifiFee + pricing.trashFee;

    const total = selectedRoom.monthlyRent + electricityCost + waterCost + otherFees;

    return {
      rent: selectedRoom.monthlyRent,
      electricityUsage,
      electricityCost,
      electricityRate: pricing.electricityRate,
      waterUsage,
      waterCost,
      waterRate: pricing.waterRate,
      wifiFee: pricing.wifiFee,
      trashFee: pricing.trashFee,
      otherFees,
      total
    };
  }, [selectedRoom, meterForm, getEffectivePricing]);

  // Event handlers
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    // Load room's custom pricing if exists
    if (room.customPricing?.useCustomPricing) {
      setUseCustomPricing(true);
      setCustomPricing({
        electricityRate: room.customPricing.electricityRate ?? defaultPricingTemplate.electricityRate,
        waterRate: room.customPricing.waterRate ?? defaultPricingTemplate.waterRate,
        wifiFee: room.customPricing.wifiFee ?? defaultPricingTemplate.wifiFee,
        trashFee: room.customPricing.trashFee ?? defaultPricingTemplate.trashFee,
        parkingFee: room.customPricing.parkingFee ?? defaultPricingTemplate.parkingFee,
      });
    } else {
      setUseCustomPricing(false);
      setCustomPricing({ ...defaultPricingTemplate });
    }
    // Load tenant info if exists
    if (room.tenant) {
      setTenantForm({
        name: room.tenant.name,
        phone: room.tenant.phone,
        idNumber: room.tenant.idNumber,
        moveInDate: room.tenant.moveInDate,
        deposit: room.tenant.deposit.toString(),
        notes: room.tenant.notes || '',
      });
    } else {
      setTenantForm({
        name: '',
        phone: '',
        idNumber: '',
        moveInDate: '',
        deposit: '',
        notes: '',
      });
    }
    // Reset meter form
    setMeterForm({ newElectricity: '', newWater: '' });
    setSheetOpen(true);
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoomForm.building || !newRoomForm.roomNumber) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsAddingRoom(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã thêm phòng mới thành công', {
      description: `Phòng ${newRoomForm.roomNumber} - ${getBuildingById(newRoomForm.building)?.shortName}`,
    });

    setNewRoomForm({
      building: '',
      roomNumber: '',
      roomCode: '',
      floor: '',
      monthlyRent: '',
      area: '',
    });
    setDialogOpen(false);
    setIsAddingRoom(false);
  };

  const handleSaveTenant = async () => {
    if (!tenantForm.name || !tenantForm.phone) {
      toast.error('Vui lòng điền tên và số điện thoại');
      return;
    }

    setIsSavingTenant(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã cập nhật thông tin khách thuê');
    setIsSavingTenant(false);
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantForm.name || !tenantForm.phone || !tenantForm.idNumber) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSavingTenant(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã thêm khách thuê mới', {
      description: `${tenantForm.name} - Phòng ${selectedRoom?.roomNumber}`,
    });

    setAddTenantDialogOpen(false);
    setIsSavingTenant(false);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã trả phòng thành công', {
      description: `Phòng ${selectedRoom?.roomNumber} đã trống`,
    });

    setIsCheckingOut(false);
    setSheetOpen(false);
  };

  const handleSavePricing = async () => {
    setIsSavingPricing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã lưu cấu hình giá dịch vụ', {
      description: `Phòng ${selectedRoom?.roomNumber}`,
    });

    setIsSavingPricing(false);
  };

  const handleCreateInvoice = async () => {
    if (!meterForm.newElectricity || !meterForm.newWater) {
      toast.error('Vui lòng nhập số điện và số nước mới');
      return;
    }

    setIsCreatingInvoice(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Đã tạo hóa đơn thành công', {
      description: `Tổng tiền: ${formatCurrency(invoicePreview?.total || 0)}`,
    });

    setMeterForm({ newElectricity: '', newWater: '' });
    setIsCreatingInvoice(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {selectedBuilding ? selectedBuilding.name : 'Quản lý phòng'}
          </h1>
          <p className="text-muted-foreground">
            {stats.total} phòng: <span className="text-emerald-600">{stats.paid} đã đóng</span>, <span className="text-red-600">{stats.debt} còn nợ</span>, {stats.empty} trống
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phòng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm phòng mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="building">Tòa nhà</Label>
                <Select
                  value={newRoomForm.building}
                  onValueChange={(v) => setNewRoomForm(prev => ({ ...prev, building: v }))}
                >
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Tên phòng</Label>
                  <Input
                    id="roomNumber"
                    placeholder="VD: Phòng Hồng, A1..."
                    value={newRoomForm.roomNumber}
                    onChange={(e) => setNewRoomForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomCode">Mã căn hộ</Label>
                  <Input
                    id="roomCode"
                    placeholder="VD: 101, A01..."
                    value={newRoomForm.roomCode}
                    onChange={(e) => setNewRoomForm(prev => ({ ...prev, roomCode: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Tầng <span className="text-muted-foreground text-xs">(tùy chọn)</span></Label>
                  <Input
                    id="floor"
                    type="number"
                    placeholder="1"
                    value={newRoomForm.floor}
                    onChange={(e) => setNewRoomForm(prev => ({ ...prev, floor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Diện tích (m²) <span className="text-muted-foreground text-xs">(tùy chọn)</span></Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="25"
                    value={newRoomForm.area}
                    onChange={(e) => setNewRoomForm(prev => ({ ...prev, area: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Giá thuê (đ/tháng)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="5000000"
                  value={newRoomForm.monthlyRent}
                  onChange={(e) => setNewRoomForm(prev => ({ ...prev, monthlyRent: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isAddingRoom}>
                  {isAddingRoom && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Thêm phòng
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm phòng hoặc tên khách..."
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
        </div>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
          <TabsList className="w-full h-auto flex-wrap sm:flex-nowrap">
            <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
              Tất cả ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="empty" className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
              Trống ({stats.empty})
            </TabsTrigger>
            <TabsTrigger value="occupied" className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
              Đã thuê ({stats.paid})
            </TabsTrigger>
            <TabsTrigger value="debt" className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
              Nợ ({stats.debt})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tòa nhà</TableHead>
                <TableHead>Mã căn hộ</TableHead>
                <TableHead>Tên phòng</TableHead>
                <TableHead>Khách thuê</TableHead>
                <TableHead className="text-right">Giá thuê</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading state
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : (
                paginatedRooms.map((room) => {
                  const building = getBuildingById(room.buildingId);
                  return (
                    <TableRow
                      key={room.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRoomClick(room)}
                    >
                      <TableCell className="text-muted-foreground">
                        {building?.shortName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {room.roomCode || '—'}
                      </TableCell>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>
                        {room.tenant?.name || <span className="text-muted-foreground">Chưa có khách thuê</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(room.monthlyRent)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {!isLoading && filteredRooms.length === 0 && (
            <div className="p-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Không tìm thấy phòng nào</p>
              <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && filteredRooms.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} trong tổng số {filteredRooms.length} phòng
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          // Skeleton loading state for mobile
          Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : (
          paginatedRooms.map((room) => {
            const building = getBuildingById(room.buildingId);
            return (
              <Card
                key={room.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRoomClick(room)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{room.roomNumber}</span>
                        {room.roomCode && <span className="text-xs text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">{room.roomCode}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{building?.shortName}</p>
                    </div>
                    <span className="font-medium text-emerald-600">{formatCurrency(room.monthlyRent)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      {room.tenant?.name || <span className="text-muted-foreground">Chưa có khách thuê</span>}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        {!isLoading && filteredRooms.length === 0 && (
          <div className="p-12 text-center">
            <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Không tìm thấy phòng nào</p>
            <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {/* Mobile Pagination */}
        {!isLoading && filteredRooms.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Room Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col" hideCloseButton>
          {selectedRoom && (
            <>
              {/* Fixed Header */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-slate-50/80">
                <SheetHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setSheetOpen(false)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Đóng
                    </Button>
                    <SheetTitle className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-lg">{selectedRoom.roomNumber}</span>
                          {getStatusBadge(selectedRoom.status)}
                        </div>
                        <p className="text-sm font-normal text-muted-foreground truncate">
                          {getBuildingById(selectedRoom.buildingId)?.name}
                        </p>
                      </div>
                      <Building2 className="h-6 w-6 text-slate-600 shrink-0" />
                    </SheetTitle>
                  </div>
                </SheetHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 h-12 p-1 bg-slate-100">
                    <TabsTrigger
                      value="info"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Thông tin</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="pricing"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="hidden sm:inline">Giá dịch vụ</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="meter"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Điện nước</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="hidden sm:inline">Hồ sơ</span>
                    </TabsTrigger>
                  </TabsList>

                {/* Tab 1: Thông tin chung */}
                <TabsContent value="info" className="mt-4 space-y-4">
                  {selectedRoom.tenant ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tenantName">Tên khách thuê</Label>
                        <Input
                          id="tenantName"
                          value={tenantForm.name}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="phone"
                              value={tenantForm.phone}
                              onChange={(e) => setTenantForm(prev => ({ ...prev, phone: e.target.value }))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="idNumber">Số CCCD</Label>
                          <Input
                            id="idNumber"
                            value={tenantForm.idNumber}
                            onChange={(e) => setTenantForm(prev => ({ ...prev, idNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="moveInDate">Ngày vào ở</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="moveInDate"
                              type="date"
                              value={tenantForm.moveInDate}
                              onChange={(e) => setTenantForm(prev => ({ ...prev, moveInDate: e.target.value }))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deposit">Tiền cọc</Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="deposit"
                              type="number"
                              value={tenantForm.deposit}
                              onChange={(e) => setTenantForm(prev => ({ ...prev, deposit: e.target.value }))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Input
                          id="notes"
                          value={tenantForm.notes}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Ghi chú về khách thuê..."
                        />
                      </div>
                      <div className="pt-4 flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={handleSaveTenant}
                          disabled={isSavingTenant}
                        >
                          {isSavingTenant && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Lưu thay đổi
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">
                              <LogOut className="h-4 w-4 mr-2" />
                              Trả phòng
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận trả phòng?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Khách {selectedRoom.tenant?.name} sẽ trả phòng {selectedRoom.roomNumber}.
                                Thông tin khách thuê sẽ được lưu vào lịch sử.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                              >
                                {isCheckingOut && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Xác nhận
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Phòng đang trống</p>
                      <Dialog open={addTenantDialogOpen} onOpenChange={setAddTenantDialogOpen}>
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
                          <form onSubmit={handleAddTenant} className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="newTenantName">Tên khách thuê *</Label>
                              <Input
                                id="newTenantName"
                                value={tenantForm.name}
                                onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Nguyễn Văn A"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="newTenantPhone">Số điện thoại *</Label>
                                <Input
                                  id="newTenantPhone"
                                  value={tenantForm.phone}
                                  onChange={(e) => setTenantForm(prev => ({ ...prev, phone: e.target.value }))}
                                  placeholder="0901234567"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="newTenantId">Số CCCD *</Label>
                                <Input
                                  id="newTenantId"
                                  value={tenantForm.idNumber}
                                  onChange={(e) => setTenantForm(prev => ({ ...prev, idNumber: e.target.value }))}
                                  placeholder="012345678901"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="newMoveInDate">Ngày vào ở</Label>
                                <Input
                                  id="newMoveInDate"
                                  type="date"
                                  value={tenantForm.moveInDate}
                                  onChange={(e) => setTenantForm(prev => ({ ...prev, moveInDate: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="newDeposit">Tiền cọc</Label>
                                <Input
                                  id="newDeposit"
                                  type="number"
                                  value={tenantForm.deposit}
                                  onChange={(e) => setTenantForm(prev => ({ ...prev, deposit: e.target.value }))}
                                  placeholder="5000000"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                              <Button type="button" variant="outline" onClick={() => setAddTenantDialogOpen(false)}>
                                Hủy
                              </Button>
                              <Button type="submit" disabled={isSavingTenant}>
                                {isSavingTenant && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Thêm khách
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 2: Cấu hình giá dịch vụ */}
                <TabsContent value="pricing" className="mt-4 space-y-4">
                  {/* Switch để bật/tắt giá riêng */}
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
                    <div className="space-y-0.5">
                      <Label htmlFor="custom-pricing" className="text-base font-medium">
                        Tùy chỉnh giá riêng cho phòng này
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {useCustomPricing
                          ? 'Đang sử dụng giá riêng'
                          : 'Đang sử dụng giá mẫu từ Settings'}
                      </p>
                    </div>
                    <Switch
                      id="custom-pricing"
                      checked={useCustomPricing}
                      onCheckedChange={setUseCustomPricing}
                    />
                  </div>

                  {/* Bảng giá - readonly khi OFF, editable khi ON */}
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      {/* Điện */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Giá điện (đ/kWh)
                        </Label>
                        {useCustomPricing ? (
                          <Input
                            type="number"
                            value={customPricing.electricityRate}
                            onChange={(e) => setCustomPricing(prev => ({
                              ...prev,
                              electricityRate: Number(e.target.value)
                            }))}
                          />
                        ) : (
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-muted-foreground">
                            {formatCurrency(defaultPricingTemplate.electricityRate)}
                          </div>
                        )}
                      </div>

                      {/* Nước */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Droplet className="h-4 w-4 text-blue-500" />
                          Giá nước (đ/m³)
                        </Label>
                        {useCustomPricing ? (
                          <Input
                            type="number"
                            value={customPricing.waterRate}
                            onChange={(e) => setCustomPricing(prev => ({
                              ...prev,
                              waterRate: Number(e.target.value)
                            }))}
                          />
                        ) : (
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-muted-foreground">
                            {formatCurrency(defaultPricingTemplate.waterRate)}
                          </div>
                        )}
                      </div>

                      {/* Wifi */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-purple-500" />
                          Phí Wifi (đ/tháng)
                        </Label>
                        {useCustomPricing ? (
                          <Input
                            type="number"
                            value={customPricing.wifiFee}
                            onChange={(e) => setCustomPricing(prev => ({
                              ...prev,
                              wifiFee: Number(e.target.value)
                            }))}
                          />
                        ) : (
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-muted-foreground">
                            {formatCurrency(defaultPricingTemplate.wifiFee)}
                          </div>
                        )}
                      </div>

                      {/* Rác */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4 text-green-600" />
                          Phí rác (đ/tháng)
                        </Label>
                        {useCustomPricing ? (
                          <Input
                            type="number"
                            value={customPricing.trashFee}
                            onChange={(e) => setCustomPricing(prev => ({
                              ...prev,
                              trashFee: Number(e.target.value)
                            }))}
                          />
                        ) : (
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-muted-foreground">
                            {formatCurrency(defaultPricingTemplate.trashFee)}
                          </div>
                        )}
                      </div>

                      {/* Gửi xe */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-slate-600" />
                          Phí gửi xe (đ/tháng)
                        </Label>
                        {useCustomPricing ? (
                          <Input
                            type="number"
                            value={customPricing.parkingFee}
                            onChange={(e) => setCustomPricing(prev => ({
                              ...prev,
                              parkingFee: Number(e.target.value)
                            }))}
                          />
                        ) : (
                          <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-muted-foreground">
                            {formatCurrency(defaultPricingTemplate.parkingFee)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nút lưu khi bật custom pricing */}
                  {useCustomPricing && (
                    <Button
                      className="w-full"
                      onClick={handleSavePricing}
                      disabled={isSavingPricing}
                    >
                      {isSavingPricing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Lưu cấu hình giá
                    </Button>
                  )}
                </TabsContent>

                {/* Tab 3: Hồ sơ ảnh */}
                <TabsContent value="documents" className="mt-4 space-y-6">
                  {/* Hình ảnh phòng trước khi dọn vào - 6 ảnh */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Hình ảnh phòng trước khi dọn vào
                    </Label>
                    <p className="text-xs text-muted-foreground">Tối đa 6 ảnh</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hình ảnh các hư hại sẵn có - 2 ảnh */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Hình ảnh các hư hại sẵn có (nếu có)
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hình ảnh nội thất ban đầu - 4 ảnh */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Hình ảnh nội thất ban đầu
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hình ảnh khác - 3 ảnh + 1 nút thêm */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Hình ảnh khác
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="aspect-square bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      ))}
                      {/* Nút thêm ảnh */}
                      <div
                        className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <Plus className="h-8 w-8 text-slate-400" />
                        <span className="text-xs mt-1">Thêm ảnh</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Chốt số điện nước */}
                <TabsContent value="meter" className="mt-4 space-y-4">
                  {selectedRoom.tenant ? (
                    <>
                      {/* Số cũ (tháng trước) */}
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-3">Chỉ số tháng trước</h4>
                        {(() => {
                          const lastReading = getLastMeterReading(selectedRoom);
                          if (!lastReading) return <p className="text-muted-foreground text-sm">Chưa có dữ liệu</p>;
                          return (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span>Điện: <strong>{lastReading.electricityCurr}</strong> kWh</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplet className="h-4 w-4 text-blue-500" />
                                <span>Nước: <strong>{lastReading.waterCurr}</strong> m³</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Nhập số mới */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Nhập số mới</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newElectricity" className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              Số điện mới (kWh)
                            </Label>
                            <Input
                              id="newElectricity"
                              type="number"
                              value={meterForm.newElectricity}
                              onChange={(e) => setMeterForm(prev => ({ ...prev, newElectricity: e.target.value }))}
                              placeholder={(() => {
                                const last = getLastMeterReading(selectedRoom);
                                return last ? String(last.electricityCurr + 100) : '0';
                              })()}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newWater" className="flex items-center gap-2">
                              <Droplet className="h-4 w-4 text-blue-500" />
                              Số nước mới (m³)
                            </Label>
                            <Input
                              id="newWater"
                              type="number"
                              value={meterForm.newWater}
                              onChange={(e) => setMeterForm(prev => ({ ...prev, newWater: e.target.value }))}
                              placeholder={(() => {
                                const last = getLastMeterReading(selectedRoom);
                                return last ? String(last.waterCurr + 5) : '0';
                              })()}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tính toán realtime */}
                      <Card className="p-4 bg-slate-50">
                        <h4 className="font-medium mb-3">Dự tính hóa đơn</h4>
                        {invoicePreview && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Tiền phòng</span>
                              <span>{formatCurrency(invoicePreview.rent)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>
                                Tiền điện ({invoicePreview.electricityUsage} kWh × {formatCurrency(invoicePreview.electricityRate).replace('đ', '')}đ)
                              </span>
                              <span>{formatCurrency(invoicePreview.electricityCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>
                                Tiền nước ({invoicePreview.waterUsage} m³ × {formatCurrency(invoicePreview.waterRate).replace('đ', '')}đ)
                              </span>
                              <span>{formatCurrency(invoicePreview.waterCost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Phí wifi + rác</span>
                              <span>{formatCurrency(invoicePreview.otherFees)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t font-medium">
                              <span>Tổng cộng</span>
                              <span className="text-lg text-emerald-600">{formatCurrency(invoicePreview.total)}</span>
                            </div>
                          </div>
                        )}
                      </Card>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCreateInvoice}
                        disabled={isCreatingInvoice}
                      >
                        {isCreatingInvoice && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Calculator className="h-4 w-4 mr-2" />
                        Tính tiền & Xuất hóa đơn
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Chưa có khách thuê</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="p-4">Đang tải...</div>}>
      <RoomsContent />
    </Suspense>
  );
}
