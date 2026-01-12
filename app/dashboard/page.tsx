'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { DollarSign, Home, Receipt, Calendar, Send, Check, Loader2, Bell, MessageSquare, Clock, Play, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { mockRooms, mockInvoices, dashboardStats, buildings, calculateBuildingStats, getBuildingById, type Invoice } from '@/lib/data';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [today, setToday] = useState<string>('');
  const [processingInvoiceId, setProcessingInvoiceId] = useState<string | null>(null);

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

  // Mock notifications for dashboard
  const recentNotifications = [
    {
      id: '1',
      title: 'Hóa đơn quá hạn',
      description: 'P.101 - HAGL1 quá hạn 3 ngày',
      time: '5 phút trước',
      type: 'warning' as const,
      isRead: false,
    },
    {
      id: '2',
      title: 'Thanh toán thành công',
      description: 'P.205 - HAGL2 đã thanh toán 5,500,000đ',
      time: '1 giờ trước',
      type: 'success' as const,
      isRead: false,
    },
    {
      id: '3',
      title: 'Khách mới',
      description: 'Nguyễn Văn A đã được thêm vào P.302',
      time: '2 giờ trước',
      type: 'info' as const,
      isRead: true,
    },
  ];

  // Mock requests for dashboard
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: '1',
      room: 'P.101',
      building: 'HAGL1',
      tenant: 'Nguyễn Văn A',
      title: 'Máy lạnh không hoạt động',
      category: 'electrical',
      time: '2 giờ trước',
      status: 'pending' as const,
      priority: 'important' as const,
    },
    {
      id: '2',
      room: 'P.205',
      building: 'HAGL2',
      tenant: 'Trần Thị B',
      title: 'Bồn cầu bị nghẹt',
      category: 'plumbing',
      time: '5 giờ trước',
      status: 'in_progress' as const,
      priority: 'important' as const,
    },
    {
      id: '3',
      room: 'P.302',
      building: 'HAGL1',
      tenant: 'Lê Văn C',
      title: 'Wifi yếu',
      category: 'internet',
      time: '1 ngày trước',
      status: 'pending' as const,
      priority: 'normal' as const,
    },
  ]);

  const getNotificationTypeColor = (type: 'warning' | 'success' | 'info') => {
    switch (type) {
      case 'warning': return 'bg-amber-500';
      case 'success': return 'bg-emerald-500';
      case 'info': return 'bg-blue-500';
    }
  };

  const getRequestPriorityBadge = (priority: 'important' | 'normal') => {
    switch (priority) {
      case 'important':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Quan trọng</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Thông thường</Badge>;
    }
  };

  const handleRequestStatusChange = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingRequests(prev => prev.map(req => {
      if (req.id === id) {
        if (req.status === 'pending') {
          toast.success('Đã chuyển sang đang xử lý');
          return { ...req, status: 'in_progress' as const };
        } else if (req.status === 'in_progress') {
          toast.success('Đã hoàn thành yêu cầu');
          return { ...req, status: 'completed' as const };
        }
      }
      return req;
    }));
  };

  // Quick actions
  const handleQuickPay = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessingInvoiceId(invoice.id);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã xác nhận thanh toán', {
      description: `P.${invoice.roomNumber} - ${formatCurrency(invoice.totalAmount)}`,
    });

    setProcessingInvoiceId(null);
  };

  const handleQuickSendZalo = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();

    toast.info('Đang khởi tạo liên kết Zalo...', {
      description: `Gửi nhắc nhở cho ${invoice.tenantName}`,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã mở Zalo', {
      description: 'Tin nhắn đã được chuẩn bị sẵn',
    });
  };

  const handleInvoiceRowClick = (invoice: Invoice) => {
    router.push(`/dashboard/invoices?search=${invoice.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">{today && `Hôm nay, ${today}`}</p>
      </div>

      {/* 1. Tình trạng */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tình trạng</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Doanh thu tháng</p>
                <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(dashboardStats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Home className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Phòng trống</p>
                <p className="text-base sm:text-xl font-bold">{dashboardStats.emptyRooms} <span className="text-xs sm:text-sm font-normal text-muted-foreground">/ {mockRooms.length}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Chưa thu tiền</p>
                <p className="text-base sm:text-xl font-bold">{dashboardStats.unpaidInvoices} <span className="text-xs sm:text-sm font-normal text-muted-foreground">hóa đơn</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Sắp hết hạn HĐ</p>
                <p className="text-base sm:text-xl font-bold">{dashboardStats.expiringContracts} <span className="text-xs sm:text-sm font-normal text-muted-foreground">khách</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* 2. Yêu cầu của khách */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Yêu cầu của khách</h2>
            <Badge variant="outline" className="h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200">
              {pendingRequests.filter(r => r.status !== 'completed').length} yêu cầu
            </Badge>
          </div>
          <Link href="/dashboard/requests">
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {pendingRequests.filter(r => r.status !== 'completed').length > 0 ? (
              <div className="divide-y">
                {pendingRequests.filter(r => r.status !== 'completed').map((request) => (
                  <div
                    key={request.id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{request.room}</span>
                          <span className="text-xs text-muted-foreground">• {request.building}</span>
                          {getRequestPriorityBadge(request.priority)}
                        </div>
                        <p className="text-sm truncate">{request.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{request.tenant} • {request.time}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={(e) => handleRequestStatusChange(request.id, e)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Xử lý
                          </Button>
                        ) : request.status === 'in_progress' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={(e) => handleRequestStatusChange(request.id, e)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Hoàn thành
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-center text-muted-foreground">Không có yêu cầu nào</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Hóa đơn chưa thu */}
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
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidInvoices.map((invoice) => {
                    const building = getBuildingById(invoice.buildingId);
                    const isOverdue = invoice.status === 'overdue';
                    const isProcessing = processingInvoiceId === invoice.id;
                    return (
                      <TableRow
                        key={invoice.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleInvoiceRowClick(invoice)}
                      >
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
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleQuickSendZalo(invoice, e)}
                              title="Gửi Zalo"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={(e) => handleQuickPay(invoice, e)}
                              disabled={isProcessing}
                              title="Xác nhận đã thu"
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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

      {/* 4. Doanh thu theo tòa nhà */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Doanh thu theo tòa nhà</h2>
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
                  <TableHead className="text-right">Doanh thu tháng</TableHead>
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
                      <TableCell className="text-right font-medium text-emerald-600">
                        {formatCurrency(stats.revenue)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
