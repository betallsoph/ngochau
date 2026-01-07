'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  Receipt,
  Settings,
  ChevronLeft,
  Bell,
  User,
  LogOut,
  Shield,
  HelpCircle,
  Check,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Tòa nhà',
    href: '/dashboard/buildings',
    icon: Building2,
  },
  {
    title: 'Phòng',
    href: '/dashboard/rooms',
    icon: Home,
  },
  {
    title: 'Khách thuê',
    href: '/dashboard/tenants',
    icon: Users,
  },
  {
    title: 'Hóa đơn',
    href: '/dashboard/invoices',
    icon: Receipt,
  },
  {
    title: 'Cài đặt',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

// Mock notifications
const mockNotifications = [
  {
    id: '1',
    title: 'Hóa đơn quá hạn',
    description: 'Phòng 101 - HAGL1 quá hạn 3 ngày',
    time: '5 phút trước',
    read: false,
    type: 'warning'
  },
  {
    id: '2',
    title: 'Thanh toán thành công',
    description: 'Phòng 205 - HAGL2 đã thanh toán 5,500,000đ',
    time: '1 giờ trước',
    read: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Khách mới',
    description: 'Nguyễn Văn A đã được thêm vào Phòng 302',
    time: '2 giờ trước',
    read: true,
    type: 'info'
  },
];

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const pathname = usePathname();

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    toast.info('Đang đăng xuất...', {
      description: 'Hẹn gặp lại bạn!'
    });
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleNotificationClick = (notif: typeof mockNotifications[0]) => {
    setNotifications(prev => prev.map(n =>
      n.id === notif.id ? { ...n, read: true } : n
    ));

    // Navigate based on notification type
    if (notif.type === 'warning') {
      router.push('/dashboard/invoices?status=overdue');
    } else if (notif.type === 'success') {
      router.push('/dashboard/invoices');
    } else {
      router.push('/dashboard/tenants');
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 256,
      }}
      className={cn(
        'h-screen bg-slate-50 border-r border-slate-200 flex flex-col',
        className
      )}
    >
        {/* Header - Profile & Notifications */}
        <div className="border-b border-slate-200 p-3">
          <div className="flex items-center gap-2">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  'flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors flex-1 text-left',
                  isCollapsed && 'justify-center p-2'
                )}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src="/avatar.jpg" alt="Admin" />
                    <AvatarFallback className="bg-slate-800 text-white text-sm">
                      NH
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    'flex-1 min-w-0',
                    isCollapsed && 'hidden'
                  )}>
                    <p className="text-sm font-medium truncate">Ngọc Hậu</p>
                    <p className="text-xs text-muted-foreground truncate">Chủ trọ</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <User className="h-4 w-4 mr-2" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings?tab=security')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Bảo mật
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Trợ giúp
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'relative shrink-0',
                    isCollapsed && 'hidden'
                  )}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                  <DropdownMenuLabel className="p-0">Thông báo</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs"
                      onClick={handleMarkAllRead}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Đánh dấu đã đọc
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Không có thông báo mới
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem
                        key={notif.id}
                        className={cn(
                          'flex flex-col items-start p-3 cursor-pointer',
                          !notif.read && 'bg-blue-50'
                        )}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-1.5 shrink-0',
                            notif.type === 'warning' && 'bg-amber-500',
                            notif.type === 'success' && 'bg-emerald-500',
                            notif.type === 'info' && 'bg-blue-500'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {notif.time}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-blue-600">
                  Xem tất cả thông báo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-11 transition-all duration-200',
                      isCollapsed && 'justify-center px-2',
                      isActive(item.href)
                        ? 'bg-slate-800 text-white hover:bg-slate-700 hover:text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto'
                      }}
                      className={cn(
                        'overflow-hidden whitespace-nowrap',
                        isCollapsed && 'hidden'
                      )}
                    >
                      {item.title}
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer - Collapse button */}
        <div className="border-t border-slate-200 p-2">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 h-10 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
              isCollapsed && 'justify-center px-2'
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
            </motion.div>
            <motion.span
              initial={false}
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : 'auto'
              }}
              className="overflow-hidden whitespace-nowrap"
            >
              Thu gọn
            </motion.span>
          </Button>
        </div>
    </motion.aside>
  );
}
