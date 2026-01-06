'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  Receipt,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Bell,
  ChevronDown
} from 'lucide-react';

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

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-slate-50 border-r border-slate-200 flex flex-col',
          'transition-transform duration-300 ease-in-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, can collapse
          'lg:translate-x-0 lg:relative lg:z-0',
          isCollapsed ? 'lg:w-16' : 'w-64',
          className
        )}
      >
        {/* Header - Profile & Notifications */}
        <div className="border-b border-slate-200 p-3">
          {/* Profile */}
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors',
            isCollapsed && 'lg:justify-center lg:p-2'
          )}>
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src="/avatar.jpg" alt="Admin" />
              <AvatarFallback className="bg-slate-800 text-white text-sm">
                AD
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              'flex-1 min-w-0',
              isCollapsed && 'lg:hidden'
            )}>
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">Quản lý</p>
            </div>
            <Button variant="ghost" size="icon" className={cn(
              'relative shrink-0',
              isCollapsed && 'lg:hidden'
            )}>
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-11 transition-all duration-200',
                    isCollapsed && 'lg:justify-center lg:px-2',
                    isActive(item.href)
                      ? 'bg-slate-800 text-white hover:bg-slate-700 hover:text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn(
                    'transition-opacity duration-200',
                    isCollapsed && 'lg:hidden lg:opacity-0'
                  )}>
                    {item.title}
                  </span>
                </Button>
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
              isCollapsed && 'lg:justify-center lg:px-2',
              'hidden lg:flex'
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 shrink-0 transition-transform duration-200',
                isCollapsed && 'rotate-180'
              )}
            />
            <span className={cn(
              'transition-opacity duration-200',
              isCollapsed && 'lg:hidden lg:opacity-0'
            )}>
              Thu gọn
            </span>
          </Button>
        </div>
      </aside>
    </>
  );
}
