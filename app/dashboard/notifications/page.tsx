'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  AlertTriangle,
  Clock,
  Info,
  Check,
  CheckCheck,
  Trash2,
  FileText,
  CreditCard,
  Home,
  User,
  Calendar,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Notification types
type NotificationPriority = 'important' | 'priority' | 'normal';
type NotificationType = 'invoice' | 'contract' | 'payment' | 'maintenance' | 'system' | 'tenant';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  link?: string;
  metadata?: {
    roomNumber?: string;
    buildingName?: string;
    tenantName?: string;
    amount?: number;
  };
}

// Priority config
const priorityConfig: Record<NotificationPriority, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof AlertTriangle }> = {
  important: {
    label: 'Quan trọng',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
  },
  priority: {
    label: 'Ưu tiên',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  normal: {
    label: 'Thông thường',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Info,
  },
};

// Type config
const typeConfig: Record<NotificationType, { label: string; icon: typeof FileText }> = {
  invoice: { label: 'Hóa đơn', icon: FileText },
  contract: { label: 'Hợp đồng', icon: Calendar },
  payment: { label: 'Thanh toán', icon: CreditCard },
  maintenance: { label: 'Bảo trì', icon: Settings },
  system: { label: 'Hệ thống', icon: Bell },
  tenant: { label: 'Khách thuê', icon: User },
};

// Generate mock notifications
const generateNotifications = (): Notification[] => {
  const notifications: Notification[] = [
    // Important notifications
    {
      id: '1',
      title: 'Hóa đơn quá hạn thanh toán',
      message: 'Phòng 301 - HAGL 3 đã quá hạn thanh toán 15 ngày. Tổng nợ: 8,500,000đ',
      priority: 'important',
      type: 'invoice',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      link: '/dashboard/invoices?status=overdue',
      metadata: { roomNumber: '301', buildingName: 'HAGL 3', amount: 8500000 },
    },
    {
      id: '2',
      title: 'Hợp đồng sắp hết hạn',
      message: 'Hợp đồng của Nguyễn Văn An (P.205 - Phú Hoàng Anh) sẽ hết hạn trong 3 ngày',
      priority: 'important',
      type: 'contract',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false,
      link: '/dashboard/tenants',
      metadata: { roomNumber: '205', buildingName: 'Phú Hoàng Anh', tenantName: 'Nguyễn Văn An' },
    },
    {
      id: '3',
      title: 'Cảnh báo tiêu thụ điện bất thường',
      message: 'Phòng 512 - SSR tiêu thụ điện tháng này cao gấp 3 lần bình thường (450 kWh)',
      priority: 'important',
      type: 'maintenance',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: true,
      metadata: { roomNumber: '512', buildingName: 'SSR' },
    },
    // Priority notifications
    {
      id: '4',
      title: 'Thanh toán thành công',
      message: 'Trần Thị Bình đã thanh toán hóa đơn tháng 12/2025 - P.108 HAGL 3',
      priority: 'priority',
      type: 'payment',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      isRead: false,
      link: '/dashboard/invoices',
      metadata: { roomNumber: '108', buildingName: 'HAGL 3', tenantName: 'Trần Thị Bình', amount: 6200000 },
    },
    {
      id: '5',
      title: 'Yêu cầu gia hạn hợp đồng',
      message: 'Lê Văn Cường (P.402 - Sunrise) đã gửi yêu cầu gia hạn hợp đồng thêm 12 tháng',
      priority: 'priority',
      type: 'contract',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      isRead: false,
      link: '/dashboard/tenants',
      metadata: { roomNumber: '402', buildingName: 'Sunrise', tenantName: 'Lê Văn Cường' },
    },
    {
      id: '6',
      title: 'Khách thuê mới đăng ký',
      message: 'Phạm Thị Dung đã đăng ký thuê phòng 210 - Phú Hoàng Anh',
      priority: 'priority',
      type: 'tenant',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
      link: '/dashboard/tenants',
      metadata: { roomNumber: '210', buildingName: 'Phú Hoàng Anh', tenantName: 'Phạm Thị Dung' },
    },
    {
      id: '7',
      title: 'Chỉ số điện nước đã được cập nhật',
      message: 'Đã cập nhật chỉ số điện nước tháng 12/2025 cho tòa HAGL 3 (60 phòng)',
      priority: 'priority',
      type: 'invoice',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      isRead: true,
      link: '/dashboard/invoices/bulk',
      metadata: { buildingName: 'HAGL 3' },
    },
    // Normal notifications
    {
      id: '8',
      title: 'Hóa đơn tháng 12 đã được tạo',
      message: 'Đã tạo 176 hóa đơn cho tháng 12/2025. Tổng giá trị: 1,234,500,000đ',
      priority: 'normal',
      type: 'invoice',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      isRead: true,
      link: '/dashboard/invoices',
      metadata: { amount: 1234500000 },
    },
    {
      id: '9',
      title: 'Nhắc nhở đóng tiền đã gửi',
      message: 'Đã gửi tin nhắn nhắc nhở đóng tiền cho 45 khách thuê qua Zalo',
      priority: 'normal',
      type: 'payment',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      isRead: true,
    },
    {
      id: '10',
      title: 'Bảo trì định kỳ',
      message: 'Lịch bảo trì hệ thống điện tòa SSR vào ngày 15/01/2026',
      priority: 'normal',
      type: 'maintenance',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      isRead: true,
      metadata: { buildingName: 'SSR' },
    },
    {
      id: '11',
      title: 'Cập nhật hệ thống',
      message: 'Hệ thống đã được cập nhật phiên bản mới với nhiều tính năng cải tiến',
      priority: 'normal',
      type: 'system',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      isRead: true,
    },
    {
      id: '12',
      title: 'Báo cáo doanh thu tháng 11',
      message: 'Báo cáo doanh thu tháng 11/2025 đã sẵn sàng. Tổng doanh thu: 1,180,000,000đ',
      priority: 'normal',
      type: 'invoice',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
      isRead: true,
      metadata: { amount: 1180000000 },
    },
  ];

  return notifications;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(generateNotifications);
  const [priorityFilter, setPriorityFilter] = useState<'all' | NotificationPriority>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | NotificationType>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchPriority = priorityFilter === 'all' || n.priority === priorityFilter;
      const matchType = typeFilter === 'all' || n.type === typeFilter;
      const matchRead = readFilter === 'all' ||
        (readFilter === 'unread' && !n.isRead) ||
        (readFilter === 'read' && n.isRead);
      return matchPriority && matchType && matchRead;
    });
  }, [notifications, priorityFilter, typeFilter, readFilter]);

  const stats = useMemo(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    const important = notifications.filter(n => n.priority === 'important').length;
    const priority = notifications.filter(n => n.priority === 'priority').length;
    const normal = notifications.filter(n => n.priority === 'normal').length;
    return { unread, important, priority, normal };
  }, [notifications]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Đã xóa thông báo');
  };

  const handleDeleteAllRead = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
    toast.success('Đã xóa tất cả thông báo đã đọc');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">
            {stats.unread > 0 ? (
              <span className="text-red-600 font-medium">{stats.unread} thông báo chưa đọc</span>
            ) : (
              'Tất cả thông báo đã được đọc'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Đánh dấu đã đọc
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAllRead}
            disabled={notifications.filter(n => n.isRead).length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa đã đọc
          </Button>
        </div>
      </div>

      {/* Priority Stats - Clickable cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className={cn(
            "cursor-pointer transition-colors",
            priorityFilter === 'important'
              ? "border-2 border-red-400 bg-red-50"
              : "border-red-200 hover:border-red-400"
          )}
          onClick={() => setPriorityFilter(priorityFilter === 'important' ? 'all' : 'important')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Quan trọng</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.important}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-colors",
            priorityFilter === 'priority'
              ? "border-2 border-amber-400 bg-amber-50"
              : "border-amber-200 hover:border-amber-400"
          )}
          onClick={() => setPriorityFilter(priorityFilter === 'priority' ? 'all' : 'priority')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Ưu tiên</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-amber-600">{stats.priority}</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer transition-colors",
            priorityFilter === 'normal'
              ? "border-2 border-blue-400 bg-blue-50"
              : "border-blue-200 hover:border-blue-400"
          )}
          onClick={() => setPriorityFilter(priorityFilter === 'normal' ? 'all' : 'normal')}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-xs sm:text-sm text-muted-foreground">Thông thường</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.normal}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | NotificationType)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Loại thông báo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {Object.entries(typeConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4" />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={(v) => setReadFilter(v as 'all' | 'unread' | 'read')}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="unread">Chưa đọc</SelectItem>
            <SelectItem value="read">Đã đọc</SelectItem>
          </SelectContent>
        </Select>
        {(priorityFilter !== 'all' || typeFilter !== 'all' || readFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPriorityFilter('all');
              setTypeFilter('all');
              setReadFilter('all');
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-2">Không có thông báo</p>
              <p className="text-sm text-muted-foreground">
                {priorityFilter !== 'all' || typeFilter !== 'all' || readFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc để xem thêm thông báo'
                  : 'Bạn sẽ nhận được thông báo khi có cập nhật mới'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const priorityInfo = priorityConfig[notification.priority];
            const typeInfo = typeConfig[notification.type];
            const PriorityIcon = priorityInfo.icon;
            const TypeIcon = typeInfo.icon;

            return (
              <Card
                key={notification.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  !notification.isRead && "border-l-4",
                  !notification.isRead && notification.priority === 'important' && "border-l-red-500 bg-red-50/30",
                  !notification.isRead && notification.priority === 'priority' && "border-l-amber-500 bg-amber-50/30",
                  !notification.isRead && notification.priority === 'normal' && "border-l-blue-500 bg-blue-50/30",
                  notification.isRead && "opacity-75"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "p-2 rounded-lg shrink-0 h-fit",
                      priorityInfo.bgColor
                    )}>
                      <TypeIcon className={cn("h-5 w-5", priorityInfo.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn(
                            "font-medium",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              priorityInfo.bgColor,
                              priorityInfo.color,
                              priorityInfo.borderColor
                            )}
                          >
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {priorityInfo.label}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>

                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {notification.metadata.roomNumber && (
                            <Badge variant="secondary" className="text-xs">
                              <Home className="h-3 w-3 mr-1" />
                              P.{notification.metadata.roomNumber}
                            </Badge>
                          )}
                          {notification.metadata.buildingName && (
                            <Badge variant="secondary" className="text-xs">
                              {notification.metadata.buildingName}
                            </Badge>
                          )}
                          {notification.metadata.tenantName && (
                            <Badge variant="secondary" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {notification.metadata.tenantName}
                            </Badge>
                          )}
                          {notification.metadata.amount && (
                            <Badge variant="secondary" className="text-xs">
                              <CreditCard className="h-3 w-3 mr-1" />
                              {formatCurrency(notification.metadata.amount)}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Đánh dấu đã đọc
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => handleDelete(notification.id, e)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredNotifications.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredNotifications.length} thông báo
          </p>
        </div>
      )}
    </div>
  );
}
