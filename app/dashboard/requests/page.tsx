'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Droplet,
  Zap,
  Wifi,
  Home,
  User,
  Calendar,
  Phone,
  X,
  Check,
  MessageCircle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Request types
type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
type RequestCategory = 'maintenance' | 'plumbing' | 'electrical' | 'internet' | 'other';
type RequestPriority = 'important' | 'normal';

interface Request {
  id: string;
  tenantName: string;
  tenantPhone: string;
  roomNumber: string;
  buildingName: string;
  category: RequestCategory;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  updatedAt: string;
  response?: string;
}

// Status config
const statusConfig: Record<RequestStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: {
    label: 'Chờ xử lý',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  in_progress: {
    label: 'Đang xử lý',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: Wrench,
  },
  completed: {
    label: 'Hoàn thành',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Từ chối',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
};

// Category config
const categoryConfig: Record<RequestCategory, { label: string; icon: typeof Wrench }> = {
  maintenance: { label: 'Sửa chữa', icon: Wrench },
  plumbing: { label: 'Nước', icon: Droplet },
  electrical: { label: 'Điện', icon: Zap },
  internet: { label: 'Internet', icon: Wifi },
  other: { label: 'Khác', icon: MessageSquare },
};

// Priority config
const priorityConfig: Record<RequestPriority, { label: string; color: string; bgColor: string }> = {
  important: {
    label: 'Quan trọng',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  normal: {
    label: 'Thông thường',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 border-slate-200',
  },
};

// Generate mock requests
const generateRequests = (): Request[] => {
  return [
    {
      id: '1',
      tenantName: 'Nguyễn Văn An',
      tenantPhone: '0901234567',
      roomNumber: '301',
      buildingName: 'HAGL 3',
      category: 'plumbing',
      title: 'Bồn cầu bị tắc',
      description: 'Bồn cầu trong phòng tắm bị tắc, nước không thoát được. Đã thử dùng cây thông nhưng không được.',
      status: 'pending',
      priority: 'important',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      tenantName: 'Trần Thị Bình',
      tenantPhone: '0912345678',
      roomNumber: '205',
      buildingName: 'Phú Hoàng Anh',
      category: 'electrical',
      title: 'Đèn phòng ngủ không sáng',
      description: 'Đèn trần phòng ngủ bị hỏng, đã thử thay bóng nhưng vẫn không sáng. Có thể bị hỏng công tắc hoặc dây điện.',
      status: 'in_progress',
      priority: 'important',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      response: 'Đã ghi nhận. Thợ điện sẽ đến kiểm tra vào chiều nay.',
    },
    {
      id: '3',
      tenantName: 'Lê Văn Cường',
      tenantPhone: '0923456789',
      roomNumber: '402',
      buildingName: 'SSR',
      category: 'internet',
      title: 'Wifi yếu, hay bị ngắt',
      description: 'Wifi trong phòng rất yếu, thường xuyên bị ngắt kết nối. Đã thử restart router nhưng không cải thiện.',
      status: 'pending',
      priority: 'normal',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: '4',
      tenantName: 'Phạm Thị Dung',
      tenantPhone: '0934567890',
      roomNumber: '108',
      buildingName: 'HAGL 3',
      category: 'maintenance',
      title: 'Cửa sổ không đóng được',
      description: 'Cửa sổ phòng khách bị kẹt, không đóng được. Khi mưa nước tạt vào phòng.',
      status: 'completed',
      priority: 'important',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      response: 'Đã sửa xong cửa sổ. Bản lề bị hỏng đã được thay mới.',
    },
    {
      id: '5',
      tenantName: 'Hoàng Văn Em',
      tenantPhone: '0945678901',
      roomNumber: '512',
      buildingName: 'Sunrise',
      category: 'plumbing',
      title: 'Vòi nước bồn rửa bị rỉ',
      description: 'Vòi nước bồn rửa mặt bị rỉ nước, cần thay mới.',
      status: 'rejected',
      priority: 'normal',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      response: 'Vòi nước do khách tự lắp, không thuộc trách nhiệm bảo trì của tòa nhà. Vui lòng tự sửa chữa.',
    },
    {
      id: '6',
      tenantName: 'Nguyễn Thị Phương',
      tenantPhone: '0956789012',
      roomNumber: '210',
      buildingName: 'Phú Hoàng Anh',
      category: 'other',
      title: 'Yêu cầu thêm kệ tường',
      description: 'Muốn xin phép lắp thêm kệ treo tường trong phòng ngủ để để đồ.',
      status: 'pending',
      priority: 'normal',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ];
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>(generateRequests);
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | RequestCategory>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'complete' | 'reject' | null>(null);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;
      return matchStatus && matchCategory;
    });
  }, [requests, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }, [requests]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
    setResponseText(request.response || '');
    setSheetOpen(true);
  };

  const handleStartProgress = () => {
    if (!selectedRequest) return;
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { ...r, status: 'in_progress' as RequestStatus, updatedAt: new Date().toISOString() }
          : r
      )
    );
    setSelectedRequest(prev => prev ? { ...prev, status: 'in_progress' } : null);
    toast.success('Đã chuyển sang trạng thái đang xử lý');
  };

  const handleActionClick = (type: 'complete' | 'reject') => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedRequest || !actionType) return;

    const newStatus = actionType === 'complete' ? 'completed' : 'rejected';
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? {
              ...r,
              status: newStatus as RequestStatus,
              response: responseText,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    setSelectedRequest(prev =>
      prev ? { ...prev, status: newStatus as RequestStatus, response: responseText } : null
    );
    toast.success(actionType === 'complete' ? 'Đã hoàn thành yêu cầu' : 'Đã từ chối yêu cầu');
    setActionDialogOpen(false);
  };

  const handleSaveResponse = () => {
    if (!selectedRequest) return;
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { ...r, response: responseText, updatedAt: new Date().toISOString() }
          : r
      )
    );
    toast.success('Đã lưu phản hồi');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Yêu cầu của khách</h1>
        <p className="text-muted-foreground">
          {stats.pending > 0 ? (
            <span className="text-amber-600 font-medium">{stats.pending} yêu cầu chờ xử lý</span>
          ) : (
            'Không có yêu cầu chờ xử lý'
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(statusConfig) as RequestStatus[]).map((status) => {
          const config = statusConfig[status];
          const StatusIcon = config.icon;
          const count = stats[status];
          return (
            <Card
              key={status}
              className={cn(
                'cursor-pointer transition-colors border',
                statusFilter === status
                  ? `border-2 ${config.bgColor}`
                  : 'hover:border-slate-300'
              )}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn('h-4 w-4', config.color)} />
                  <span className="text-xs sm:text-sm text-muted-foreground">{config.label}</span>
                </div>
                <p className={cn('text-lg sm:text-2xl font-bold', config.color)}>{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as 'all' | RequestCategory)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(statusFilter !== 'all' || categoryFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-2">Không có yêu cầu</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc để xem thêm yêu cầu'
                  : 'Chưa có yêu cầu nào từ khách thuê'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const categoryInfo = categoryConfig[request.category];

            return (
              <Card
                key={request.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleRequestClick(request)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{request.title}</h3>
                        {request.priority === 'important' && (
                          <span className="text-xs text-red-600">• Quan trọng</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>P.{request.roomNumber} - {request.buildingName}</span>
                        <span>•</span>
                        <span>{request.tenantName}</span>
                        <span>•</span>
                        <span>{formatTime(request.createdAt)}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="shrink-0">
                      {request.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRequests(prev =>
                              prev.map(r =>
                                r.id === request.id
                                  ? { ...r, status: 'in_progress' as RequestStatus, updatedAt: new Date().toISOString() }
                                  : r
                              )
                            );
                            toast.success('Đã chuyển sang đang xử lý');
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Xử lý
                        </Button>
                      )}
                      {request.status === 'in_progress' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                            setResponseText(request.response || '');
                            handleActionClick('complete');
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Xong
                        </Button>
                      )}
                      {(request.status === 'completed' || request.status === 'rejected') && (
                        <span className="text-xs text-muted-foreground">
                          {request.status === 'completed' ? 'Đã xong' : 'Từ chối'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredRequests.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredRequests.length} yêu cầu
          </p>
        </div>
      )}

      {/* Request Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col" hideCloseButton>
          {selectedRequest && (() => {
            const statusInfo = statusConfig[selectedRequest.status];
            const categoryInfo = categoryConfig[selectedRequest.category];
            const StatusIcon = statusInfo.icon;
            const CategoryIcon = categoryInfo.icon;

            return (
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
                      <SheetTitle className="flex-1 min-w-0 text-right">
                        <span className="text-lg truncate">{selectedRequest.title}</span>
                      </SheetTitle>
                    </div>
                  </SheetHeader>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                  {/* Status & Priority */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedRequest.priority === 'important' && (
                      <span className="text-red-600 font-medium">Quan trọng</span>
                    )}
                    {selectedRequest.priority === 'important' && <span>•</span>}
                    <span>{statusInfo.label}</span>
                    <span>•</span>
                    <span>Cập nhật {formatTime(selectedRequest.updatedAt)}</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phòng</span>
                      <span>P.{selectedRequest.roomNumber} - {selectedRequest.buildingName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Khách thuê</span>
                      <span>{selectedRequest.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Điện thoại</span>
                      <a href={`tel:${selectedRequest.tenantPhone}`} className="text-blue-600">
                        {selectedRequest.tenantPhone}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày gửi</span>
                      <span>
                        {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-1">Nội dung</p>
                    <p className="text-sm">{selectedRequest.description}</p>
                  </div>

                  {/* Response */}
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-1">Phản hồi</p>
                    {selectedRequest.status === 'completed' || selectedRequest.status === 'rejected' ? (
                      <p className="text-sm">{selectedRequest.response || 'Không có phản hồi'}</p>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Nhập phản hồi cho khách thuê..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={3}
                        />
                        {selectedRequest.status === 'in_progress' && responseText !== (selectedRequest.response || '') && (
                          <Button variant="outline" size="sm" onClick={handleSaveResponse}>
                            Lưu phản hồi
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedRequest.status !== 'completed' && selectedRequest.status !== 'rejected' && (
                    <div className="flex gap-3 pt-4">
                      {selectedRequest.status === 'pending' && (
                        <Button className="flex-1" onClick={handleStartProgress}>
                          <Wrench className="h-4 w-4 mr-2" />
                          Bắt đầu xử lý
                        </Button>
                      )}
                      {selectedRequest.status === 'in_progress' && (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleActionClick('reject')}
                          >
                            Từ chối
                          </Button>
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleActionClick('complete')}
                          >
                            Hoàn thành
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'complete' ? 'Hoàn thành yêu cầu?' : 'Từ chối yêu cầu?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'complete'
                ? 'Xác nhận đã hoàn thành xử lý yêu cầu này. Khách thuê sẽ nhận được thông báo.'
                : 'Xác nhận từ chối yêu cầu này. Khách thuê sẽ nhận được thông báo với lý do từ chối.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={actionType === 'complete' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'complete' ? 'Hoàn thành' : 'Từ chối'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
