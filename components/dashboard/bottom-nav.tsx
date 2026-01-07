'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Home,
  Receipt,
  MoreHorizontal,
  Building2,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// Main nav items (3 most used + More)
const mainNavItems = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Phòng',
    href: '/dashboard/rooms',
    icon: Home,
  },
  {
    title: 'Hóa đơn',
    href: '/dashboard/invoices',
    icon: Receipt,
  },
];

// Items in "More" menu
const moreMenuItems = [
  {
    title: 'Tòa nhà',
    href: '/dashboard/buildings',
    icon: Building2,
  },
  {
    title: 'Khách thuê',
    href: '/dashboard/tenants',
    icon: Users,
  },
  {
    title: 'Cài đặt',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

// Mock notifications count
const unreadCount = 2;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isMoreActive = moreMenuItems.some(item => isActive(item.href));

  const handleLogout = () => {
    setMoreSheetOpen(false);
    toast.info('Đang đăng xuất...', {
      description: 'Hẹn gặp lại bạn!'
    });
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleNavClick = (href: string) => {
    setMoreSheetOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Main nav items */}
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  active
                    ? 'text-slate-900'
                    : 'text-slate-500'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  active && 'bg-slate-100'
                )}>
                  <item.icon className={cn(
                    'h-5 w-5',
                    active && 'text-slate-900'
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  active && 'text-slate-900'
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  isMoreActive || moreSheetOpen
                    ? 'text-slate-900'
                    : 'text-slate-500'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-lg transition-colors relative',
                  (isMoreActive || moreSheetOpen) && 'bg-slate-100'
                )}>
                  <MoreHorizontal className={cn(
                    'h-5 w-5',
                    (isMoreActive || moreSheetOpen) && 'text-slate-900'
                  )} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  (isMoreActive || moreSheetOpen) && 'text-slate-900'
                )}>
                  Thêm
                </span>
              </button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              {/* Profile section */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/avatar.jpg" alt="Admin" />
                  <AvatarFallback className="bg-slate-800 text-white">
                    NH
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">Ngọc Hậu</p>
                  <p className="text-sm text-muted-foreground">Chủ trọ</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative shrink-0"
                  onClick={() => {
                    setMoreSheetOpen(false);
                    toast.info('Tính năng thông báo sẽ sớm được cập nhật');
                  }}
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
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                {moreMenuItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
                        active
                          ? 'bg-slate-900 text-white'
                          : 'hover:bg-slate-100'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1 font-medium">{item.title}</span>
                      <ChevronRight className={cn(
                        'h-4 w-4',
                        active ? 'text-white/70' : 'text-slate-400'
                      )} />
                    </button>
                  );
                })}
              </div>

              {/* Logout */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
