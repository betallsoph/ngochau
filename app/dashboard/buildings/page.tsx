'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Plus } from 'lucide-react';
import { buildings, mockRooms, calculateBuildingStats } from '@/lib/data';

export default function BuildingsPage() {
  const [open, setOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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
            <Card key={building.id} className="border-2 border-slate-200 hover:border-slate-400 transition-colors">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{building.name}</h3>
                      <p className="text-sm text-muted-foreground">{building.address}</p>
                    </div>
                  </div>
                  <Link href={`/dashboard/rooms?building=${building.id}`}>
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
                  <span className="text-sm text-muted-foreground">Doanh thu tháng</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(stats.revenue)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
