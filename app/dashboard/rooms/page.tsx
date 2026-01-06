'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
import { Search, Plus, User, Zap, Droplet, Camera, FileText, Upload, Calculator, Phone, Calendar, CreditCard, Home } from 'lucide-react';
import { mockRooms, buildings, getBuildingById, type Room, type RoomStatus } from '@/lib/data';

type FilterStatus = 'all' | 'empty' | 'occupied' | 'debt';

function RoomsContent() {
  const searchParams = useSearchParams();
  const initialBuilding = searchParams.get('building') || 'all';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>(initialBuilding);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoomBuilding, setNewRoomBuilding] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setSheetOpen(true);
  };

  const getLastMeterReading = (room: Room) => {
    if (!room.meterReadings || room.meterReadings.length === 0) return null;
    return room.meterReadings[room.meterReadings.length - 1];
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
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="building">Tòa nhà</Label>
                <Select value={newRoomBuilding} onValueChange={setNewRoomBuilding}>
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
                  <Label htmlFor="roomNumber">Số phòng</Label>
                  <Input id="roomNumber" placeholder="VD: 101" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Tầng</Label>
                  <Input id="floor" type="number" placeholder="1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Giá thuê (đ/tháng)</Label>
                <Input id="monthlyRent" type="number" placeholder="5000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Diện tích (m²)</Label>
                <Input id="area" type="number" placeholder="25" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" onClick={(e) => { e.preventDefault(); setDialogOpen(false); }}>
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
          <TabsList>
            <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
            <TabsTrigger value="empty">Phòng trống ({stats.empty})</TabsTrigger>
            <TabsTrigger value="occupied">Đã cho thuê ({stats.paid})</TabsTrigger>
            <TabsTrigger value="debt">Đang nợ ({stats.debt})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phòng</TableHead>
                <TableHead>Tòa nhà</TableHead>
                <TableHead>Khách thuê</TableHead>
                <TableHead className="text-right">Giá thuê</TableHead>
                <TableHead className="text-center">Điện (kWh)</TableHead>
                <TableHead className="text-center">Nước (m³)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Nợ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => {
                const building = getBuildingById(room.buildingId);
                const lastReading = getLastMeterReading(room);
                return (
                  <TableRow
                    key={room.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRoomClick(room)}
                  >
                    <TableCell className="font-medium">P.{room.roomNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {building?.shortName}
                    </TableCell>
                    <TableCell>
                      {room.tenant?.name || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(room.monthlyRent)}
                    </TableCell>
                    <TableCell className="text-center">
                      {lastReading ? (
                        <span className="text-sm">
                          {lastReading.electricityCurr - lastReading.electricityPrev}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {lastReading ? (
                        <span className="text-sm">
                          {lastReading.waterCurr - lastReading.waterPrev}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(room.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {room.debtAmount ? (
                        <span className="text-red-600 font-medium">{formatCurrency(room.debtAmount)}</span>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredRooms.length === 0 && (
            <p className="p-8 text-center text-muted-foreground">Không tìm thấy phòng nào</p>
          )}
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredRooms.map((room) => {
          const building = getBuildingById(room.buildingId);
          const lastReading = getLastMeterReading(room);
          return (
            <Card
              key={room.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleRoomClick(room)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">P.{room.roomNumber}</span>
                      <span className="text-sm text-muted-foreground">{building?.shortName}</span>
                    </div>
                    <p className="text-sm mt-1">
                      {room.tenant?.name || <span className="text-muted-foreground">Chưa có khách</span>}
                    </p>
                  </div>
                  {getStatusBadge(room.status)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Giá thuê</span>
                    <p className="font-medium">{formatCurrency(room.monthlyRent)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Điện
                    </span>
                    <p className="font-medium">
                      {lastReading ? `${lastReading.electricityCurr - lastReading.electricityPrev} kWh` : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Droplet className="h-3 w-3" /> Nước
                    </span>
                    <p className="font-medium">
                      {lastReading ? `${lastReading.waterCurr - lastReading.waterPrev} m³` : '—'}
                    </p>
                  </div>
                </div>
                {room.debtAmount && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-red-600 font-medium">Nợ: {formatCurrency(room.debtAmount)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filteredRooms.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">Không tìm thấy phòng nào</p>
        )}
      </div>

      {/* Room Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
          {selectedRoom && (
            <>
              {/* Fixed Header */}
              <div className="px-6 py-5 border-b bg-slate-50/80">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-lg">Phòng {selectedRoom.roomNumber}</span>
                        <p className="text-sm font-normal text-muted-foreground">
                          {getBuildingById(selectedRoom.buildingId)?.name}
                        </p>
                      </div>
                    </SheetTitle>
                    {getStatusBadge(selectedRoom.status)}
                  </div>
                </SheetHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 h-12 p-1 bg-slate-100">
                    <TabsTrigger
                      value="info"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <User className="h-4 w-4" />
                      <span>Thông tin</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Hồ sơ ảnh</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="meter"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md flex items-center justify-center gap-2 text-sm"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Điện nước</span>
                    </TabsTrigger>
                  </TabsList>

                {/* Tab 1: Thông tin chung */}
                <TabsContent value="info" className="mt-4 space-y-4">
                  {selectedRoom.tenant ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tenantName">Tên khách thuê</Label>
                        <Input id="tenantName" defaultValue={selectedRoom.tenant.name} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input id="phone" defaultValue={selectedRoom.tenant.phone} className="pl-9" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="idNumber">Số CCCD</Label>
                          <Input id="idNumber" defaultValue={selectedRoom.tenant.idNumber} />
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
                              defaultValue={selectedRoom.tenant.moveInDate}
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
                              defaultValue={selectedRoom.tenant.deposit}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Input id="notes" defaultValue={selectedRoom.tenant.notes || ''} placeholder="Ghi chú về khách thuê..." />
                      </div>
                      <div className="pt-4 flex gap-3">
                        <Button className="flex-1">Lưu thay đổi</Button>
                        <Button variant="outline">Trả phòng</Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">Phòng đang trống</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm khách thuê
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 2: Hồ sơ ảnh */}
                <TabsContent value="documents" className="mt-4 space-y-4">
                  {selectedRoom.tenant ? (
                    <div className="space-y-4">
                        {/* CCCD Mặt trước */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            CCCD - Mặt trước
                          </Label>
                          <Card className="overflow-hidden">
                            <AspectRatio ratio={16/10}>
                              <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Chưa có ảnh</span>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload ảnh
                                </Button>
                              </div>
                            </AspectRatio>
                          </Card>
                        </div>

                        {/* CCCD Mặt sau */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            CCCD - Mặt sau
                          </Label>
                          <Card className="overflow-hidden">
                            <AspectRatio ratio={16/10}>
                              <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Chưa có ảnh</span>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload ảnh
                                </Button>
                              </div>
                            </AspectRatio>
                          </Card>
                        </div>

                        {/* Cà vẹt xe */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Cà vẹt xe
                          </Label>
                          <Card className="overflow-hidden">
                            <AspectRatio ratio={16/10}>
                              <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Chưa có ảnh</span>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload ảnh
                                </Button>
                              </div>
                            </AspectRatio>
                          </Card>
                        </div>

                        {/* Hợp đồng */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Hợp đồng thuê phòng
                          </Label>
                          <Card className="overflow-hidden">
                            <AspectRatio ratio={16/10}>
                              <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Chưa có ảnh</span>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload ảnh
                                </Button>
                              </div>
                            </AspectRatio>
                          </Card>
                        </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Chưa có khách thuê</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Chốt số điện nước */}
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
                              placeholder={(() => {
                                const last = getLastMeterReading(selectedRoom);
                                return last ? String(last.waterCurr + 5) : '0';
                              })()}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tính toán (preview) */}
                      <Card className="p-4 bg-slate-50">
                        <h4 className="font-medium mb-3">Dự tính hóa đơn</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tiền phòng</span>
                            <span>{formatCurrency(selectedRoom.monthlyRent)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tiền điện (ước tính 100 kWh × 3,500đ)</span>
                            <span>{formatCurrency(350000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tiền nước (ước tính 5 m³ × 15,000đ)</span>
                            <span>{formatCurrency(75000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí wifi + rác</span>
                            <span>{formatCurrency(130000)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t font-medium">
                            <span>Tổng cộng</span>
                            <span className="text-lg">{formatCurrency(selectedRoom.monthlyRent + 350000 + 75000 + 130000)}</span>
                          </div>
                        </div>
                      </Card>

                      <Button className="w-full" size="lg">
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
