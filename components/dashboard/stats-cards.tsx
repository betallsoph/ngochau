'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Home, FileWarning, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  totalRevenue: number;
  emptyRooms: number;
  unpaidInvoices: number;
  expiringContracts: number;
}

export function StatsCards({
  totalRevenue,
  emptyRooms,
  unpaidInvoices,
  expiringContracts
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      description: 'Tháng 1/2025',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100 group-hover:bg-green-200',
      href: '/dashboard/invoices'
    },
    {
      title: 'Phòng trống',
      value: emptyRooms.toString(),
      icon: Home,
      description: 'Có thể cho thuê',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100 group-hover:bg-blue-200',
      href: '/dashboard/rooms'
    },
    {
      title: 'Chưa thanh toán',
      value: unpaidInvoices.toString(),
      icon: FileWarning,
      description: 'Hóa đơn cần thu',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100 group-hover:bg-orange-200',
      href: '/dashboard/invoices'
    },
    {
      title: 'Sắp hết hạn HĐ',
      value: expiringContracts.toString(),
      icon: Calendar,
      description: 'Trong 30 ngày',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100 group-hover:bg-purple-200',
      href: '/dashboard/tenants'
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.title} href={stat.href}>
          <Card className={cn(
            'group cursor-pointer transition-all duration-200',
            'hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5'
          )}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className={cn(
                  'p-2 rounded-lg transition-colors',
                  stat.iconBg
                )}>
                  <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <p className="text-sm font-medium text-foreground mt-1">
                  {stat.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
