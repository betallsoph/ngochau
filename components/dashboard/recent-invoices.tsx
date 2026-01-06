'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Invoice } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentInvoicesProps {
  invoices: Invoice[];
  limit?: number;
}

const statusConfig = {
  paid: {
    label: 'Đã TT',
    variant: 'default' as const,
    className: 'bg-green-600 hover:bg-green-700'
  },
  pending: {
    label: 'Chờ TT',
    variant: 'secondary' as const,
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  },
  overdue: {
    label: 'Quá hạn',
    variant: 'destructive' as const,
    className: ''
  }
};

export function RecentInvoices({ invoices, limit = 5 }: RecentInvoicesProps) {
  const displayedInvoices = invoices.slice(0, limit);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Hóa đơn gần đây</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.filter(i => i.status !== 'paid').length} hóa đơn chưa thanh toán
          </p>
        </div>
        <Link href="/dashboard/invoices">
          <Button variant="outline" size="sm" className="gap-1.5">
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Mã HĐ</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead className="hidden sm:table-cell">Khách thuê</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="hidden md:table-cell text-center">Hạn TT</TableHead>
                <TableHead className="text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedInvoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                return (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                    <TableCell className="font-medium">P.{invoice.roomNumber}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {invoice.tenantName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center text-muted-foreground">
                      {formatDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={status.variant}
                        className={cn('text-xs', status.className)}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
