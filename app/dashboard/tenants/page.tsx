'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Search, Plus } from 'lucide-react';
import { mockRooms, buildings, getBuildingById, type Room } from '@/lib/data';

// Generate tenants from rooms with tenant info
const tenants = mockRooms
  .filter(room => room.tenant)
  .map((room, index) => ({
    id: index + 1,
    name: room.tenant!.name,
    buildingId: room.buildingId,
    roomNumber: room.roomNumber,
    phone: room.tenant!.phone,
    startDate: room.tenant!.moveInDate,
    endDate: new Date(new Date(room.tenant!.moveInDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: room.status,
    deposit: room.tenant!.deposit
  }));

// Get empty rooms for tenant assignment
const emptyRooms = mockRooms.filter(room => room.status === 'empty');

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'debt'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');

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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách thuê</TableHead>
                <TableHead className="hidden sm:table-cell">Tòa nhà</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead className="hidden md:table-cell">SĐT</TableHead>
                <TableHead className="hidden lg:table-cell">Ngày vào</TableHead>
                <TableHead className="hidden lg:table-cell">Hết hạn HĐ</TableHead>
                <TableHead className="text-right hidden md:table-cell">Tiền cọc</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.slice(0, 30).map((tenant) => {
                const building = getBuildingById(tenant.buildingId);
                const isDebt = tenant.status === 'debt';
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{tenant.phone}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {building?.shortName}
                    </TableCell>
                    <TableCell className="font-medium">P.{tenant.roomNumber}</TableCell>
                    <TableCell className="hidden md:table-cell">{tenant.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(tenant.startDate)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(tenant.endDate)}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{formatCurrency(tenant.deposit)}</TableCell>
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
            <p className="p-8 text-center text-muted-foreground">Không tìm thấy khách thuê nào</p>
          )}
          {filteredTenants.length > 30 && (
            <p className="p-4 text-center text-sm text-muted-foreground border-t">
              Hiển thị 30/{filteredTenants.length} khách thuê
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
