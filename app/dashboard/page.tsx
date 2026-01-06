'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Home, Receipt, Calendar } from 'lucide-react';
import { mockRooms, mockInvoices, dashboardStats, buildings, calculateBuildingStats, getBuildingById } from '@/lib/data';

export default function DashboardPage() {
  const [today, setToday] = useState<string>('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get unpaid invoices
  const unpaidInvoices = mockInvoices.filter(i => i.status !== 'paid').slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">{today && `Hôm nay, ${today}`}</p>
      </div>

      {/* Stats - Simple 4 boxes with unified border color */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doanh thu tháng</p>
                <p className="text-xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phòng trống</p>
                <p className="text-xl font-bold">{dashboardStats.emptyRooms} <span className="text-sm font-normal text-muted-foreground">/ {mockRooms.length}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chưa thu tiền</p>
                <p className="text-xl font-bold">{dashboardStats.unpaidInvoices} <span className="text-sm font-normal text-muted-foreground">hóa đơn</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sắp hết hạn HĐ</p>
                <p className="text-xl font-bold">{dashboardStats.expiringContracts} <span className="text-sm font-normal text-muted-foreground">khách</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buildings summary - Simple table style */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Các tòa nhà</h2>
          <Link href="/dashboard/buildings">
            <Button variant="outline" size="sm">Xem chi tiết</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tòa nhà</TableHead>
                  <TableHead className="text-center">Tổng phòng</TableHead>
                  <TableHead className="text-center">Đang thuê</TableHead>
                  <TableHead className="text-center">Còn nợ</TableHead>
                  <TableHead className="text-center">Trống</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.map((building) => {
                  const stats = calculateBuildingStats(mockRooms, building.id);
                  return (
                    <TableRow key={building.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/rooms?building=${building.id}`} className="hover:underline">
                          {building.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{stats.total}</TableCell>
                      <TableCell className="text-center">{stats.paid}</TableCell>
                      <TableCell className="text-center font-medium text-red-600">{stats.debt > 0 ? stats.debt : '-'}</TableCell>
                      <TableCell className="text-center">{stats.empty > 0 ? stats.empty : '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Hóa đơn chưa thu</h2>
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {unpaidInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phòng</TableHead>
                    <TableHead>Khách thuê</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="hidden sm:table-cell">Hạn thu</TableHead>
                    <TableHead>Tình trạng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInvoices.map((invoice) => {
                    const building = getBuildingById(invoice.buildingId);
                    const isOverdue = invoice.status === 'overdue';
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="font-medium">P.{invoice.roomNumber}</div>
                          <div className="text-sm text-muted-foreground">{building?.shortName}</div>
                        </TableCell>
                        <TableCell>{invoice.tenantName}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {isOverdue ? 'Quá hạn' : 'Chờ thu'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="p-6 text-center text-muted-foreground">Không có hóa đơn chưa thu</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
