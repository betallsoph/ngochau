'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { Building2, Plus, X, MapPin, Home, Edit } from 'lucide-react';
import { buildings, mockRooms, calculateBuildingStats, type Building, type RoomType } from '@/lib/data';

export default function BuildingsPage() {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setSheetOpen(true);
  };

  const getSelectedBuildingStats = () => {
    if (!selectedBuilding) return null;
    return calculateBuildingStats(mockRooms, selectedBuilding.id);
  };

  const getSelectedBuildingRooms = () => {
    if (!selectedBuilding) return [];
    return mockRooms.filter(room => room.buildingId === selectedBuilding.id);
  };

  const getRoomTypeLabel = (type: RoomType): string => {
    const labels: Record<RoomType, string> = {
      standard: 'Phòng thường',
      master: 'Phòng master',
      balcony: 'Phòng ban công',
    };
    return labels[type];
  };

  const getRoomTypeStats = () => {
    if (!selectedBuilding) return null;
    const rooms = getSelectedBuildingRooms();

    const occupiedByType: Record<RoomType, number> = { standard: 0, master: 0, balcony: 0 };
    const emptyByType: Record<RoomType, number> = { standard: 0, master: 0, balcony: 0 };

    rooms.forEach(room => {
      if (room.status === 'empty') {
        emptyByType[room.roomType]++;
      } else {
        occupiedByType[room.roomType]++;
      }
    });

    return { occupiedByType, emptyByType };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tòa nhà</h1>
          <p className="text-muted-foreground">{buildings.length} tòa nhà, {mockRooms.length} phòng</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tòa nhà
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm tòa nhà mới</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên tòa nhà</Label>
                <Input id="name" placeholder="VD: Hoàng Anh Gia Lai 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Tên viết tắt</Label>
                <Input id="shortName" placeholder="VD: HAGL 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" placeholder="Nhập địa chỉ tòa nhà" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRooms">Số phòng</Label>
                <Input id="totalRooms" type="number" placeholder="0" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" onClick={(e) => { e.preventDefault(); setOpen(false); }}>
                  Thêm tòa nhà
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {buildings.map((building) => {
          const stats = calculateBuildingStats(mockRooms, building.id);

          return (
            <Card
              key={building.id}
              className="border-2 border-slate-200 hover:border-slate-400 transition-colors cursor-pointer"
              onClick={() => handleBuildingClick(building)}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-slate-600 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">{building.name}</h3>
                      <p className="text-sm text-muted-foreground">{building.address}</p>
                    </div>
                  </div>
                  <Link href={`/dashboard/rooms?building=${building.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm">Xem phòng</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center py-4 border-y bg-slate-50/50 -mx-5 px-5">
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Tổng</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
                    <p className="text-xs text-muted-foreground">Đã đóng</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.debt}</p>
                    <p className="text-xs text-muted-foreground">Còn nợ</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-500">{stats.empty}</p>
                    <p className="text-xs text-muted-foreground">Trống</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-muted-foreground">Tỷ lệ lấp đầy</span>
                  <span className="font-semibold">
                    {Math.round(((stats.total - stats.empty) / stats.total) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Building Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col" hideCloseButton>
          {selectedBuilding && (
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
                        <span className="text-lg">{selectedBuilding.name}</span>
                        <p className="text-sm font-normal text-muted-foreground truncate">
                          {selectedBuilding.shortName}
                        </p>
                      </div>
                      <Building2 className="h-6 w-6 text-slate-600 shrink-0" />
                    </SheetTitle>
                  </div>
                </SheetHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                {/* Thông tin cơ bản */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Địa chỉ
                    </span>
                    <span className="font-medium text-right max-w-[60%]">{selectedBuilding.address}</span>
                  </div>
                </div>

                {/* Thống kê */}
                <div className="pt-4">
                  <h4 className="text-sm text-muted-foreground mb-3">Thống kê phòng</h4>
                  {(() => {
                    const stats = getSelectedBuildingStats();
                    if (!stats) return null;
                    const occupied = stats.total - stats.empty;
                    return (
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xl font-bold">{stats.total}</p>
                          <p className="text-xs text-muted-foreground leading-tight">Tổng số phòng<br />đang có</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xl font-bold">{occupied}</p>
                          <p className="text-xs text-muted-foreground leading-tight">Đã có<br />người thuê</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xl font-bold">{stats.empty}</p>
                          <p className="text-xs text-muted-foreground leading-tight">Đang<br />trống</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Chi tiết theo loại phòng */}
                <div className="pt-4">
                  <h4 className="text-sm text-muted-foreground mb-3">Chi tiết</h4>
                  {(() => {
                    const typeStats = getRoomTypeStats();
                    if (!typeStats) return null;
                    const { occupiedByType, emptyByType } = typeStats;
                    const roomTypes: RoomType[] = ['standard', 'master', 'balcony'];

                    return (
                      <div className="space-y-4">
                        {/* Phòng đã có người thuê */}
                        <div>
                          <p className="text-sm font-medium mb-2">Phòng đã có người thuê</p>
                          <div className="space-y-2">
                            {roomTypes.map((type) => (
                              <div key={`occupied-${type}`} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{getRoomTypeLabel(type)}</span>
                                <span className="font-medium">{occupiedByType[type]} phòng</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        {/* Phòng trống */}
                        <div>
                          <p className="text-sm font-medium mb-2">Phòng trống</p>
                          <div className="space-y-2">
                            {roomTypes.map((type) => (
                              <div key={`empty-${type}`} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{getRoomTypeLabel(type)}</span>
                                <span className="font-medium">{emptyByType[type]} phòng</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  <Link href={`/dashboard/rooms?building=${selectedBuilding.id}`} className="flex-1">
                    <Button className="w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Quản lý phòng
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
