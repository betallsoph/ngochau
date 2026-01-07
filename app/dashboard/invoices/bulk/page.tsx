'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Zap,
  Droplet,
  Lock,
  Send,
  Check,
  Loader2,
  ArrowLeft,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Search,
  User,
  Phone,
  Calendar,
  DollarSign,
  Wifi,
  Trash2,
  Car,
  History,
  X,
} from 'lucide-react';
import { mockRooms, mockInvoices, buildings, getBuildingById, defaultPricingTemplate, type Room } from '@/lib/data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types for draft invoice entry
interface DraftInvoiceEntry {
  roomId: number;
  buildingId: string;
  roomNumber: string;
  tenantName: string;
  tenantPhone: string;
  monthlyRent: number;
  // Meter readings
  electricityPrev: number;
  electricityNew: number | null;
  electricityUsage: number;
  electricityAmount: number;
  // Water - can be flat rate or metered
  waterType: 'flat' | 'metered';
  waterPrev: number;
  waterNew: number | null;
  waterUsage: number;
  waterAmount: number;
  waterFlatRate: number;
  // Other fees
  wifiFee: number;
  trashFee: number;
  parkingFee: number;
  // Pricing info
  electricityRate: number;
  waterRate: number;
  isCustomPricing: boolean;
  // Calculated
  totalAmount: number;
  // Status
  status: 'pending' | 'ready' | 'sent';
}

// Get rooms with tenants
const occupiedRooms = mockRooms.filter(room => room.tenant && room.status !== 'empty');

// Helper function to get pricing for a room
const getRoomPricing = (room: Room) => {
  if (room.customPricing?.useCustomPricing) {
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

// Get last meter reading for a room
const getLastMeterReading = (room: Room) => {
  if (room.meterReadings && room.meterReadings.length > 0) {
    return room.meterReadings[room.meterReadings.length - 1];
  }
  return null;
};

export default function BulkInvoicePage() {
  const router = useRouter();
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Initialization states
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [draftInvoices, setDraftInvoices] = useState<DraftInvoiceEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Publishing states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);

  // Confirmation dialogs
  const [showInitConfirm, setShowInitConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showUsePrevConfirm, setShowUsePrevConfirm] = useState(false);

  // Detail sheet
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DraftInvoiceEntry | null>(null);

  // Selected month/year
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get invoice history for a room (last 3 months)
  const getInvoiceHistory = useCallback((roomId: number) => {
    return mockInvoices
      .filter(inv => inv.roomId === roomId)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 3);
  }, []);

  // Get room data for selected draft
  const selectedRoom = useMemo(() => {
    if (!selectedDraft) return null;
    return mockRooms.find(r => r.id === selectedDraft.roomId);
  }, [selectedDraft]);

  // Handle row click
  const handleRowClick = (draft: DraftInvoiceEntry) => {
    setSelectedDraft(draft);
    setDetailSheetOpen(true);
  };

  // Filter rooms based on building and search
  const filteredRooms = useMemo(() => {
    return occupiedRooms.filter(room => {
      const matchBuilding = buildingFilter === 'all' || room.buildingId === buildingFilter;
      const matchSearch = !search ||
        room.roomNumber.includes(search) ||
        room.tenant?.name.toLowerCase().includes(search.toLowerCase());
      return matchBuilding && matchSearch;
    });
  }, [buildingFilter, search]);

  // Filter draft invoices
  const filteredDrafts = useMemo(() => {
    if (!isInitialized) return [];
    return draftInvoices.filter(draft => {
      const matchBuilding = buildingFilter === 'all' || draft.buildingId === buildingFilter;
      const matchSearch = !search ||
        draft.roomNumber.includes(search) ||
        draft.tenantName.toLowerCase().includes(search.toLowerCase());
      return matchBuilding && matchSearch;
    });
  }, [draftInvoices, buildingFilter, search, isInitialized]);

  // Stats
  const stats = useMemo(() => {
    const drafts = draftInvoices;
    const pending = drafts.filter(d => d.status === 'pending').length;
    const ready = drafts.filter(d => d.status === 'ready').length;
    const sent = drafts.filter(d => d.status === 'sent').length;
    const totalAmount = drafts.filter(d => d.status === 'ready' || d.status === 'sent')
      .reduce((sum, d) => sum + d.totalAmount, 0);

    return { total: drafts.length, pending, ready, sent, totalAmount };
  }, [draftInvoices]);

  // Initialize draft invoices
  const handleInitialize = async () => {
    setShowInitConfirm(false);
    setIsInitializing(true);
    setInitProgress(0);

    const rooms = filteredRooms;
    const drafts: DraftInvoiceEntry[] = [];

    // Simulate progressive initialization
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const pricing = getRoomPricing(room);
      const lastReading = getLastMeterReading(room);

      // Simulate some rooms having flat water rate (20% chance)
      const isWaterFlat = Math.random() < 0.2;
      const waterFlatRate = isWaterFlat ? 100000 : 0; // 100k flat rate

      const electricityPrev = lastReading?.electricityCurr || 0;
      const waterPrev = lastReading?.waterCurr || 0;

      drafts.push({
        roomId: room.id,
        buildingId: room.buildingId,
        roomNumber: room.roomNumber,
        tenantName: room.tenant?.name || '',
        tenantPhone: room.tenant?.phone || '',
        monthlyRent: room.monthlyRent,
        electricityPrev,
        electricityNew: null,
        electricityUsage: 0,
        electricityAmount: 0,
        waterType: isWaterFlat ? 'flat' : 'metered',
        waterPrev,
        waterNew: isWaterFlat ? waterPrev : null, // Auto-fill if flat rate
        waterUsage: 0,
        waterAmount: isWaterFlat ? waterFlatRate : 0,
        waterFlatRate,
        wifiFee: pricing.wifiFee,
        trashFee: pricing.trashFee,
        parkingFee: pricing.parkingFee,
        electricityRate: pricing.electricityRate,
        waterRate: pricing.waterRate,
        isCustomPricing: pricing.isCustom,
        totalAmount: isWaterFlat
          ? room.monthlyRent + waterFlatRate + pricing.wifiFee + pricing.trashFee + pricing.parkingFee
          : 0,
        status: 'pending',
      });

      // Update progress with small delay for visual effect
      if (i % 10 === 0 || i === rooms.length - 1) {
        setInitProgress(Math.round(((i + 1) / rooms.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }

    setDraftInvoices(drafts);
    setIsInitialized(true);
    setIsInitializing(false);

    toast.success(`Đã khởi tạo ${drafts.length} hóa đơn nháp`, {
      description: `Tháng ${selectedMonth}/${selectedYear}`,
    });
  };

  // Calculate invoice amount for a draft
  const calculateDraftAmount = useCallback((draft: DraftInvoiceEntry): DraftInvoiceEntry => {
    const electricityUsage = draft.electricityNew !== null
      ? Math.max(0, draft.electricityNew - draft.electricityPrev)
      : 0;
    const electricityAmount = electricityUsage * draft.electricityRate;

    let waterUsage = 0;
    let waterAmount = 0;

    if (draft.waterType === 'flat') {
      waterAmount = draft.waterFlatRate;
    } else if (draft.waterNew !== null) {
      waterUsage = Math.max(0, draft.waterNew - draft.waterPrev);
      waterAmount = waterUsage * draft.waterRate;
    }

    const totalAmount = draft.monthlyRent + electricityAmount + waterAmount +
      draft.wifiFee + draft.trashFee + draft.parkingFee;

    // Determine status
    let status: 'pending' | 'ready' | 'sent' = draft.status;
    if (status !== 'sent') {
      const hasElectricity = draft.electricityNew !== null;
      const hasWater = draft.waterType === 'flat' || draft.waterNew !== null;
      status = hasElectricity && hasWater ? 'ready' : 'pending';
    }

    return {
      ...draft,
      electricityUsage,
      electricityAmount,
      waterUsage,
      waterAmount,
      totalAmount,
      status,
    };
  }, []);

  // Update electricity reading
  const handleElectricityChange = useCallback((roomId: number, value: string) => {
    setDraftInvoices(prev => prev.map(draft => {
      if (draft.roomId !== roomId) return draft;
      const electricityNew = value === '' ? null : parseInt(value);
      return calculateDraftAmount({ ...draft, electricityNew });
    }));
  }, [calculateDraftAmount]);

  // Update water reading
  const handleWaterChange = useCallback((roomId: number, value: string) => {
    setDraftInvoices(prev => prev.map(draft => {
      if (draft.roomId !== roomId || draft.waterType === 'flat') return draft;
      const waterNew = value === '' ? null : parseInt(value);
      return calculateDraftAmount({ ...draft, waterNew });
    }));
  }, [calculateDraftAmount]);

  // Track which single invoices are being sent
  const [sendingSingleIds, setSendingSingleIds] = useState<Set<number>>(new Set());

  // Use previous readings for all
  const handleUsePreviousAll = () => {
    setShowUsePrevConfirm(false);

    setDraftInvoices(prev => prev.map(draft => {
      if (draft.status === 'sent') return draft;

      return calculateDraftAmount({
        ...draft,
        electricityNew: draft.electricityPrev,
        waterNew: draft.waterType === 'flat' ? draft.waterPrev : draft.waterPrev,
      });
    }));

    toast.success('Đã điền số cũ cho tất cả phòng', {
      description: 'Sử dụng cho trường hợp khách đi vắng không sử dụng điện nước',
    });
  };

  // Send single invoice
  const handleSendSingle = async (roomId: number) => {
    const draft = draftInvoices.find(d => d.roomId === roomId);
    if (!draft || draft.status !== 'ready') return;

    // Add to sending set
    setSendingSingleIds(prev => new Set(prev).add(roomId));

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update status to sent
    setDraftInvoices(prev => prev.map(d =>
      d.roomId === roomId ? { ...d, status: 'sent' as const } : d
    ));

    // Remove from sending set
    setSendingSingleIds(prev => {
      const next = new Set(prev);
      next.delete(roomId);
      return next;
    });

    toast.success(`Đã gửi hóa đơn P.${draft.roomNumber}`, {
      description: `${draft.tenantName} - ${formatCurrency(draft.totalAmount)}`,
    });
  };

  // Publish and send all ready invoices
  const handlePublishAll = async () => {
    setShowPublishConfirm(false);
    setIsPublishing(true);
    setPublishProgress(0);
    setPublishedCount(0);

    const readyDrafts = draftInvoices.filter(d => d.status === 'ready');
    const totalToPublish = readyDrafts.length;

    if (totalToPublish === 0) {
      toast.error('Không có hóa đơn nào sẵn sàng gửi');
      setIsPublishing(false);
      return;
    }

    // Simulate sending invoices progressively
    for (let i = 0; i < totalToPublish; i++) {
      const draft = readyDrafts[i];

      // Update status to sent
      setDraftInvoices(prev => prev.map(d =>
        d.roomId === draft.roomId ? { ...d, status: 'sent' as const } : d
      ));

      setPublishedCount(i + 1);
      setPublishProgress(Math.round(((i + 1) / totalToPublish) * 100));

      // Show progress toasts at intervals
      if ((i + 1) % 50 === 0 || i === totalToPublish - 1) {
        toast.info(`Đã gửi ${i + 1}/${totalToPublish} hóa đơn...`);
      }

      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsPublishing(false);
    toast.success(`Đã phát hành và gửi ${totalToPublish} hóa đơn thành công!`, {
      description: 'Link thanh toán đã được gửi qua Zalo cho tất cả khách thuê',
    });
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Khởi tạo hóa đơn hàng loạt</h1>
            <p className="text-muted-foreground">
              Tháng {selectedMonth}/{selectedYear} - {filteredRooms.length} phòng đang thuê
            </p>
          </div>
        </div>
      </div>

      {/* Not initialized view */}
      {!isInitialized && !isInitializing && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Bắt đầu tạo hóa đơn tháng mới</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Hệ thống sẽ quét {filteredRooms.length} phòng đang thuê và tạo hóa đơn nháp với thông tin giá từ Settings.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Tháng {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" onClick={() => setShowInitConfirm(true)}>
              <RefreshCw className="h-5 w-5 mr-2" />
              Khởi tạo hóa đơn tháng {selectedMonth}/{selectedYear}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Initializing progress */}
      {isInitializing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold mb-2">Đang khởi tạo hóa đơn...</h3>
            <p className="text-muted-foreground mb-4">
              {Math.round(initProgress * filteredRooms.length / 100)}/{filteredRooms.length} phòng
            </p>
            <Progress value={initProgress} className="max-w-md mx-auto" />
          </CardContent>
        </Card>
      )}

      {/* Initialized - Smart Entry Table */}
      {isInitialized && !isInitializing && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-amber-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Chờ nhập số</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-amber-600">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Sẵn sàng</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.ready}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Đã gửi</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.sent}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Tổng tiền</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-blue-600 truncate">{formatCurrency(stats.totalAmount)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm phòng, tên khách..."
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
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUsePrevConfirm(true)}
                disabled={isPublishing || stats.pending === 0}
              >
                Dùng số cũ cho tất cả
              </Button>
              <Button
                size="sm"
                onClick={() => setShowPublishConfirm(true)}
                disabled={isPublishing || stats.ready === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Gửi tất cả ({stats.ready})
              </Button>
            </div>
          </div>

          {/* Publishing progress */}
          {isPublishing && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="font-medium">Đang gửi hóa đơn...</p>
                    <p className="text-sm text-muted-foreground">
                      {publishedCount}/{stats.ready} hóa đơn
                    </p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{publishProgress}%</span>
                </div>
                <Progress value={publishProgress} className="mt-3" />
              </CardContent>
            </Card>
          )}

          {/* Smart Entry Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Phòng</TableHead>
                      <TableHead className="hidden sm:table-cell">Tòa nhà</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span className="hidden sm:inline">Điện mới</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Điện SD</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Droplet className="h-4 w-4 text-blue-500" />
                          <span className="hidden sm:inline">Nước mới</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Nước SD</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead className="text-center w-[70px]">TT</TableHead>
                      <TableHead className="text-center w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrafts.map((draft) => {
                      const building = getBuildingById(draft.buildingId);
                      const isPending = draft.status === 'pending';
                      const isReady = draft.status === 'ready';
                      const isSent = draft.status === 'sent';

                      return (
                        <TableRow
                          key={draft.roomId}
                          className={cn(
                            'cursor-pointer hover:bg-muted/50 transition-colors',
                            isPending && 'bg-amber-50/50 hover:bg-amber-100/50',
                            isReady && 'bg-emerald-50/30 hover:bg-emerald-100/30',
                            isSent && 'bg-slate-50 opacity-60'
                          )}
                          onClick={() => handleRowClick(draft)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                              P.{draft.roomNumber}
                              {draft.isCustomPricing && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" title="Giá tùy chỉnh" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {building?.shortName}
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                className={cn(
                                  "w-20 sm:w-24 h-8 text-center text-sm",
                                  isSent && "bg-slate-100"
                                )}
                                placeholder={draft.electricityPrev.toString()}
                                defaultValue={draft.electricityNew ?? ''}
                                onChange={(e) => handleElectricityChange(draft.roomId, e.target.value)}
                                disabled={isSent}
                              />
                              {draft.isCustomPricing && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" title="Giá riêng" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            <span className={cn(
                              "text-sm font-medium",
                              draft.electricityUsage > 0 ? "text-yellow-600" : "text-muted-foreground"
                            )}>
                              {draft.electricityUsage > 0 ? `${draft.electricityUsage} kWh` : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            {draft.waterType === 'flat' ? (
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm text-muted-foreground">
                                  {formatCurrency(draft.waterFlatRate)}
                                </span>
                                <span title="Nước khoán"><Lock className="h-3.5 w-3.5 text-slate-400" /></span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  className={cn(
                                    "w-20 sm:w-24 h-8 text-center text-sm",
                                    isSent && "bg-slate-100"
                                  )}
                                  placeholder={draft.waterPrev.toString()}
                                  defaultValue={draft.waterNew ?? ''}
                                  onChange={(e) => handleWaterChange(draft.roomId, e.target.value)}
                                  disabled={isSent}
                                />
                                {draft.isCustomPricing && (
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" title="Giá riêng" />
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center hidden sm:table-cell">
                            {draft.waterType === 'flat' ? (
                              <Badge variant="outline" className="text-xs">Khoán</Badge>
                            ) : (
                              <span className={cn(
                                "text-sm font-medium",
                                draft.waterUsage > 0 ? "text-blue-600" : "text-muted-foreground"
                              )}>
                                {draft.waterUsage > 0 ? `${draft.waterUsage} m³` : '—'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-medium text-sm",
                              isPending && "text-muted-foreground",
                              isReady && "text-emerald-600",
                              isSent && "text-slate-500"
                            )}>
                              {draft.totalAmount > 0 ? formatCurrency(draft.totalAmount) : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {isPending && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                <Clock className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Chờ</span>
                              </Badge>
                            )}
                            {isReady && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                <Check className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">OK</span>
                              </Badge>
                            )}
                            {isSent && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                <Send className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Gửi</span>
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            {isReady && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleSendSingle(draft.roomId)}
                                disabled={sendingSingleIds.has(draft.roomId) || isPublishing}
                                title="Gửi hóa đơn"
                              >
                                {sendingSingleIds.has(draft.roomId) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {isSent && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {filteredDrafts.length === 0 && (
                <div className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Không tìm thấy hóa đơn nào</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Giá tùy chỉnh (không dùng giá mặc định)</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Nước khoán (giá cố định)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-50 border rounded" />
              <span>Chưa nhập đủ số</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-50 border rounded" />
              <span>Sẵn sàng gửi</span>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialogs */}
      <AlertDialog open={showInitConfirm} onOpenChange={setShowInitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khởi tạo hóa đơn hàng loạt?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ tạo hóa đơn nháp cho {filteredRooms.length} phòng đang thuê trong tháng {selectedMonth}/{selectedYear}.
              Giá dịch vụ sẽ được lấy từ cài đặt giá riêng của từng phòng hoặc giá mặc định.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleInitialize}>
              Bắt đầu khởi tạo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Phát hành và gửi hóa đơn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ phát hành {stats.ready} hóa đơn đã sẵn sàng và gửi link thanh toán qua Zalo cho tất cả khách thuê.
              Tổng số tiền: {formatCurrency(stats.totalAmount)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishAll} className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4 mr-2" />
              Gửi {stats.ready} hóa đơn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUsePrevConfirm} onOpenChange={setShowUsePrevConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dùng số cũ cho tất cả phòng?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả số điện và nước mới sẽ được điền bằng số cũ (không tiêu thụ).
              Thường dùng cho trường hợp khách đi vắng không sử dụng điện nước trong tháng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleUsePreviousAll}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col" hideCloseButton>
          {selectedDraft && selectedRoom && (
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
                        <span className="text-lg">Phòng {selectedDraft.roomNumber}</span>
                        <p className="text-sm font-normal text-muted-foreground truncate">
                          {getBuildingById(selectedDraft.buildingId)?.name}
                        </p>
                      </div>
                      <Building2 className="h-6 w-6 text-slate-600 shrink-0" />
                    </SheetTitle>
                  </div>
                </SheetHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
                {/* Tenant & Room Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Thông tin khách thuê
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="font-medium">{selectedDraft.tenantName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                      <span>{selectedDraft.tenantPhone}</span>
                    </div>
                    {selectedRoom.tenant?.moveInDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                        <span>Vào ở: {formatDate(selectedRoom.tenant.moveInDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Draft Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Hóa đơn tháng {selectedMonth}/{selectedYear}
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiền phòng</span>
                      <span className="font-medium">{formatCurrency(selectedDraft.monthlyRent)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-muted-foreground">
                          Điện ({selectedDraft.electricityUsage} kWh × {formatCurrency(selectedDraft.electricityRate)})
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(selectedDraft.electricityAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">
                          {selectedDraft.waterType === 'flat'
                            ? 'Nước (khoán)'
                            : `Nước (${selectedDraft.waterUsage} m³ × ${formatCurrency(selectedDraft.waterRate)})`
                          }
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(selectedDraft.waterAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-slate-500" />
                        <span className="text-muted-foreground">Wifi</span>
                      </div>
                      <span className="font-medium">{formatCurrency(selectedDraft.wifiFee)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-slate-500" />
                        <span className="text-muted-foreground">Rác</span>
                      </div>
                      <span className="font-medium">{formatCurrency(selectedDraft.trashFee)}</span>
                    </div>
                    {selectedDraft.parkingFee > 0 && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-slate-500" />
                          <span className="text-muted-foreground">Giữ xe</span>
                        </div>
                        <span className="font-medium">{formatCurrency(selectedDraft.parkingFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="font-bold text-lg text-emerald-600">
                        {formatCurrency(selectedDraft.totalAmount)}
                      </span>
                    </div>
                    {selectedDraft.isCustomPricing && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Phòng này có giá tùy chỉnh
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice History */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <History className="h-4 w-4" />
                    Lịch sử hóa đơn (3 tháng gần nhất)
                  </h4>
                  {(() => {
                    const history = getInvoiceHistory(selectedDraft.roomId);
                    if (history.length === 0) {
                      return (
                        <div className="bg-slate-50 rounded-lg p-4 text-center text-muted-foreground">
                          Không có lịch sử hóa đơn
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {history.map((invoice) => (
                          <div key={invoice.id} className="bg-slate-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Tháng {invoice.month}</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  invoice.status === 'paid' && 'bg-emerald-50 text-emerald-600 border-emerald-200',
                                  invoice.status === 'pending' && 'bg-amber-50 text-amber-600 border-amber-200',
                                  invoice.status === 'overdue' && 'bg-red-50 text-red-600 border-red-200'
                                )}
                              >
                                {invoice.status === 'paid' && 'Đã thanh toán'}
                                {invoice.status === 'pending' && 'Chưa thanh toán'}
                                {invoice.status === 'overdue' && 'Quá hạn'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Tiền phòng</div>
                              <div className="text-right">{formatCurrency(invoice.rentAmount)}</div>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Zap className="h-3 w-3 text-yellow-500" />
                                Điện ({invoice.electricityUsage} kWh)
                              </div>
                              <div className="text-right">{formatCurrency(invoice.electricityAmount)}</div>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Droplet className="h-3 w-3 text-blue-500" />
                                Nước ({invoice.waterUsage} m³)
                              </div>
                              <div className="text-right">{formatCurrency(invoice.waterAmount)}</div>
                              <div className="text-muted-foreground">Phí khác</div>
                              <div className="text-right">{formatCurrency(invoice.otherFees)}</div>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>Tổng</span>
                              <span className={cn(
                                invoice.status === 'paid' && 'text-emerald-600',
                                invoice.status === 'overdue' && 'text-red-600'
                              )}>
                                {formatCurrency(invoice.totalAmount)}
                              </span>
                            </div>
                            {invoice.paidDate && (
                              <div className="text-xs text-muted-foreground">
                                Thanh toán: {formatDate(invoice.paidDate)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
