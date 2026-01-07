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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  TrendingUp,
  CheckCircle,
  Plus,
  Eye,
  Send,
  MoreHorizontal,
  Check,
  Printer,
  Share2,
  Building2,
  Zap,
  Droplet,
  Wifi,
  QrCode,
  Copy,
  Loader2,
  Receipt
} from 'lucide-react';
import { mockInvoices, mockRooms, buildings, getBuildingById, getRoomById, defaultPricingTemplate, type Invoice } from '@/lib/data';
import { toast } from 'sonner';

type InvoiceStatus = 'paid' | 'pending' | 'overdue';

// Get rooms with tenants for invoice creation
const occupiedRooms = mockRooms.filter(room => room.tenant);

// Bank info for payment
const bankInfo = {
  bankName: 'Vietcombank',
  bankCode: 'VCB',
  accountNumber: '1234567890',
  accountName: 'NGUYEN VAN A',
  branch: 'Chi nhánh TP.HCM'
};

// Helper function to get pricing for a room
// Priority: Room custom pricing > Default template
const getRoomPricing = (roomId: number) => {
  const room = getRoomById(mockRooms, roomId);
  if (room?.customPricing?.useCustomPricing) {
    return {
      electricityRate: room.customPricing.electricityRate ?? defaultPricingTemplate.electricityRate,
      waterRate: room.customPricing.waterRate ?? defaultPricingTemplate.waterRate,
      wifiFee: room.customPricing.wifiFee ?? defaultPricingTemplate.wifiFee,
      trashFee: room.customPricing.trashFee ?? defaultPricingTemplate.trashFee,
      parkingFee: room.customPricing.parkingFee ?? defaultPricingTemplate.parkingFee,
      isCustom: true
    };
  }
  return {
    ...defaultPricingTemplate,
    isCustom: false
  };
};

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Loading states
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [isSendingZalo, setIsSendingZalo] = useState(false);

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(invoice => {
      const matchSearch = invoice.id.toLowerCase().includes(search.toLowerCase()) ||
        invoice.roomNumber.includes(search) ||
        invoice.tenantName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const matchBuilding = buildingFilter === 'all' || invoice.buildingId === buildingFilter;
      const invoiceMonth = invoice.month.split('-')[1];
      const invoiceYear = invoice.month.split('-')[0];
      const matchMonth = monthFilter === 'all' || invoiceMonth === monthFilter.padStart(2, '0');
      const matchYear = yearFilter === 'all' || invoiceYear === yearFilter;
      return matchSearch && matchStatus && matchBuilding && matchMonth && matchYear;
    });
  }, [search, statusFilter, buildingFilter, monthFilter, yearFilter]);

  const stats = useMemo(() => {
    const invoices = buildingFilter === 'all' ? mockInvoices : mockInvoices.filter(i => i.buildingId === buildingFilter);
    return {
      total: invoices.length,
      paid: invoices.filter(i => i.status === 'paid').length,
      pending: invoices.filter(i => i.status === 'pending').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, i) => sum + i.totalAmount, 0),
      paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0)
    };
  }, [buildingFilter]);

  const availableRooms = useMemo(() => {
    if (!selectedBuilding) return occupiedRooms;
    return occupiedRooms.filter(r => r.buildingId === selectedBuilding);
  }, [selectedBuilding]);

  const selectedRoomData = useMemo(() => {
    if (!selectedRoom) return null;
    return occupiedRooms.find(r => r.id.toString() === selectedRoom);
  }, [selectedRoom]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đã thu</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Chờ thu</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Quá hạn</Badge>;
    }
  };

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailSheetOpen(true);
  };

  const generateVietQRUrl = (invoice: Invoice) => {
    const content = `${invoice.id} ${invoice.roomNumber}`;
    return `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-compact2.png?amount=${invoice.totalAmount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào clipboard');
  };

  // Event handlers
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBuilding || !selectedRoom) {
      toast.error('Vui lòng chọn tòa nhà và phòng');
      return;
    }

    setIsCreatingInvoice(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã tạo hóa đơn thành công', {
      description: `Phòng ${selectedRoomData?.roomNumber} - ${selectedRoomData?.tenant?.name}`,
    });

    setDialogOpen(false);
    setSelectedBuilding('');
    setSelectedRoom('');
    setIsCreatingInvoice(false);
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    setIsMarkingPaid(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã xác nhận thanh toán', {
      description: `Hóa đơn ${invoice.id} - ${formatCurrency(invoice.totalAmount)}`,
    });

    setIsMarkingPaid(false);
    setDetailSheetOpen(false);
  };

  const handleSendZalo = async (invoice: Invoice) => {
    setIsSendingZalo(true);

    toast.info('Đang khởi tạo liên kết Zalo...', {
      description: `Gửi hóa đơn ${invoice.id} cho ${invoice.tenantName}`,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In real app, this would open Zalo with pre-filled message
    const zaloMessage = `Xin chào ${invoice.tenantName},\n\nHóa đơn tiền phòng tháng ${invoice.month.split('-')[1]}/${invoice.month.split('-')[0]}:\n- Tổng tiền: ${formatCurrency(invoice.totalAmount)}\n- Hạn thanh toán: ${formatDate(invoice.dueDate)}\n\nVui lòng thanh toán đúng hạn. Xin cảm ơn!`;

    // Open Zalo (this is a simulation)
    toast.success('Đã mở Zalo', {
      description: 'Tin nhắn đã được chuẩn bị sẵn',
    });

    setIsSendingZalo(false);
  };

  const handlePrint = () => {
    toast.info('Đang chuẩn bị in...', {
      description: 'Mở hộp thoại in trong giây lát',
    });
    // In real app, this would trigger print dialog
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleShare = async () => {
    if (selectedInvoice) {
      const shareText = `Hóa đơn ${selectedInvoice.id} - P.${selectedInvoice.roomNumber} - ${formatCurrency(selectedInvoice.totalAmount)}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Hóa đơn tiền phòng',
            text: shareText,
          });
          toast.success('Đã chia sẻ thành công');
        } catch {
          copyToClipboard(shareText);
        }
      } else {
        copyToClipboard(shareText);
        toast.info('Đã sao chép link để chia sẻ');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hóa đơn</h1>
          <p className="text-muted-foreground">
            {stats.total} hóa đơn: <span className="text-emerald-600">{stats.paid} đã thu</span>, <span className="text-amber-600">{stats.pending} chờ thu</span>, <span className="text-red-600">{stats.overdue} quá hạn</span>
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo hóa đơn
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo hóa đơn mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4">
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
                  <Label htmlFor="room">Phòng</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>P.{r.roomNumber} - {r.tenant?.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedRoomData && (
                <div className="p-3 bg-slate-50 rounded-lg text-sm">
                  <p><span className="text-muted-foreground">Khách thuê:</span> {selectedRoomData.tenant?.name}</p>
                  <p><span className="text-muted-foreground">Giá thuê:</span> {formatCurrency(selectedRoomData.monthlyRent)}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Tháng</Label>
                  <Select defaultValue={new Date().getMonth().toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>Tháng {i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Năm</Label>
                  <Select defaultValue={new Date().getFullYear().toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn năm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Số tiền (đ)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000000"
                    defaultValue={selectedRoomData?.monthlyRent}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Hạn thu</Label>
                  <Input id="dueDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Input id="note" placeholder="VD: Tiền phòng + điện nước tháng 1" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreatingInvoice}>
                  {isCreatingInvoice && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Tạo hóa đơn
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Simple Stats with unified border color */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Tổng phải thu</p>
                <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Đã thu</p>
                <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(stats.paidAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm mã HĐ, phòng, tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tòa nhà" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tòa nhà</SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.shortName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="paid">Đã thu</SelectItem>
              <SelectItem value="pending">Chờ thu</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tháng</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>Tháng {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã HĐ</TableHead>
                <TableHead>Tòa nhà</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead className="hidden lg:table-cell">Khách thuê</TableHead>
                <TableHead className="hidden lg:table-cell">Kỳ HĐ</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="hidden lg:table-cell">Hạn thu</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const building = getBuildingById(invoice.buildingId);
                return (
                  <TableRow key={invoice.id} className="group">
                    <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {building?.shortName}
                    </TableCell>
                    <TableCell className="font-medium">P.{invoice.roomNumber}</TableCell>
                    <TableCell className="hidden lg:table-cell">{invoice.tenantName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {invoice.month.split('-')[1]}/{invoice.month.split('-')[0]}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetail(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {invoice.status !== 'paid' && (
                              <>
                                <DropdownMenuItem onClick={() => handleSendZalo(invoice)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Gửi Zalo nhắc nhở
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-emerald-600"
                                  onClick={() => handleMarkAsPaid(invoice)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Xác nhận đã thu
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={handlePrint}>
                              <Printer className="h-4 w-4 mr-2" />
                              In hóa đơn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredInvoices.length === 0 && (
            <div className="p-12 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-2">Không tìm thấy hóa đơn</p>
              <p className="text-sm text-muted-foreground mb-4">
                {search || statusFilter !== 'all' || buildingFilter !== 'all' || monthFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Tạo hóa đơn mới từ trang Quản lý phòng'}
              </p>
              {!search && statusFilter === 'all' && buildingFilter === 'all' && monthFilter === 'all' && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo hóa đơn đầu tiên
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredInvoices.map((invoice) => {
          const building = getBuildingById(invoice.buildingId);
          return (
            <Card
              key={invoice.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleViewDetail(invoice)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">P.{invoice.roomNumber}</span>
                      <span className="text-xs text-muted-foreground">{building?.shortName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{invoice.tenantName}</p>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(invoice.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-bold">{formatCurrency(invoice.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Hạn: {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  {invoice.status !== 'paid' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendZalo(invoice);
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsPaid(invoice);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredInvoices.length === 0 && (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium mb-2">Không tìm thấy hóa đơn</p>
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter !== 'all' || buildingFilter !== 'all' || monthFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Tạo hóa đơn mới từ trang Quản lý phòng'}
            </p>
            {!search && statusFilter === 'all' && buildingFilter === 'all' && monthFilter === 'all' && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo hóa đơn đầu tiên
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Invoice Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
          {selectedInvoice && (
            <div className="flex flex-col min-h-full">
              {/* Header Actions */}
              <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
                <SheetTitle className="text-lg">Chi tiết hóa đơn</SheetTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-1" />
                    In
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-1" />
                    Chia sẻ
                  </Button>
                </div>
              </div>

              {/* Invoice Content */}
              <div className="flex-1 p-4 space-y-6">
                {/* Invoice Header */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-slate-600" />
                  </div>
                  <h2 className="font-bold text-xl">NHÀ TRỌ NGỌC HẬU</h2>
                  <p className="text-sm text-muted-foreground">
                    {getBuildingById(selectedInvoice.buildingId)?.address}
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-lg uppercase tracking-wide">HÓA ĐƠN TIỀN PHÒNG</h3>
                  <p className="text-sm text-muted-foreground">
                    Kỳ: Tháng {selectedInvoice.month.split('-')[1]}/{selectedInvoice.month.split('-')[0]}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số hóa đơn:</span>
                    <span className="font-mono font-medium">{selectedInvoice.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ngày xuất:</span>
                    <span>{formatDate(selectedInvoice.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hạn thanh toán:</span>
                    <span className="text-red-600 font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                </div>

                <Separator />

                {/* Tenant Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Thông tin khách thuê</h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Họ tên:</span>
                      <span className="font-medium">{selectedInvoice.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số phòng:</span>
                      <span className="font-medium">P.{selectedInvoice.roomNumber} - {getBuildingById(selectedInvoice.buildingId)?.shortName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SĐT:</span>
                      <span>{selectedInvoice.tenantPhone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Service Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Chi tiết dịch vụ</h4>

                  {/* Rent */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <span>Tiền nhà</span>
                    </div>
                    <span className="font-medium">{formatCurrency(selectedInvoice.rentAmount)}</span>
                  </div>

                  {/* Electricity */}
                  {(() => {
                    const pricing = getRoomPricing(selectedInvoice.roomId);
                    return (
                      <div className="py-2 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>Tiền điện</span>
                            {pricing.isCustom && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">Giá riêng</Badge>
                            )}
                          </div>
                          <span className="font-medium">{formatCurrency(selectedInvoice.electricityAmount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {selectedInvoice.electricityUsage} kWh × {formatCurrency(pricing.electricityRate).replace('đ', '')}đ/kWh
                        </p>
                      </div>
                    );
                  })()}

                  {/* Water */}
                  {(() => {
                    const pricing = getRoomPricing(selectedInvoice.roomId);
                    return (
                      <div className="py-2 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-blue-500" />
                            <span>Tiền nước</span>
                            {pricing.isCustom && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">Giá riêng</Badge>
                            )}
                          </div>
                          <span className="font-medium">{formatCurrency(selectedInvoice.waterAmount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {selectedInvoice.waterUsage} m³ × {formatCurrency(pricing.waterRate).replace('đ', '')}đ/m³
                        </p>
                      </div>
                    );
                  })()}

                  {/* Other fees */}
                  {(() => {
                    const pricing = getRoomPricing(selectedInvoice.roomId);
                    return (
                      <div className="py-2 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-slate-500" />
                            <span>Phí khác (Wifi, Rác)</span>
                            {pricing.isCustom && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0">Giá riêng</Badge>
                            )}
                          </div>
                          <span className="font-medium">{formatCurrency(selectedInvoice.otherFees)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          Wifi: {formatCurrency(pricing.wifiFee)} + Rác: {formatCurrency(pricing.trashFee)}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Total */}
                  <div className="bg-slate-900 text-white rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">TỔNG CỘNG</span>
                      <span className="text-2xl font-bold">{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment QR */}
                {selectedInvoice.status !== 'paid' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-center">Thanh toán qua chuyển khoản</h4>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-3 rounded-lg border-2 border-slate-200 shadow-sm">
                        <img
                          src={generateVietQRUrl(selectedInvoice)}
                          alt="VietQR"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>

                    {/* Bank Info */}
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700 font-medium">
                        <QrCode className="h-4 w-4" />
                        Thông tin chuyển khoản
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Ngân hàng:</span>
                          <span className="font-medium">{bankInfo.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Số tài khoản:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{bankInfo.accountNumber}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(bankInfo.accountNumber)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Chủ TK:</span>
                          <span className="font-medium">{bankInfo.accountName}</span>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Nội dung CK:</span>
                          <div className="flex items-center gap-2 bg-white rounded p-2 border">
                            <code className="flex-1 text-xs font-mono">{selectedInvoice.id} {selectedInvoice.roomNumber}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => copyToClipboard(`${selectedInvoice.id} ${selectedInvoice.roomNumber}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => handleSendZalo(selectedInvoice)}
                        disabled={isSendingZalo}
                      >
                        {isSendingZalo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Send className="h-4 w-4 mr-2" />
                        Gửi Zalo
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleMarkAsPaid(selectedInvoice)}
                        disabled={isMarkingPaid}
                      >
                        {isMarkingPaid && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Check className="h-4 w-4 mr-2" />
                        Xác nhận đã thu
                      </Button>
                    </div>
                  </div>
                )}

                {/* Paid Status */}
                {selectedInvoice.status === 'paid' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center space-y-2">
                    <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
                    <p className="font-semibold text-emerald-700">Đã thanh toán</p>
                    {selectedInvoice.paidDate && (
                      <p className="text-sm text-emerald-600">
                        Ngày: {formatDate(selectedInvoice.paidDate)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 text-center text-xs text-muted-foreground">
                <p>Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ</p>
                <p>Liên hệ hỗ trợ: 0901234567</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
