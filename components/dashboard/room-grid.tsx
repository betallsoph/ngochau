'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, User, ArrowRight } from 'lucide-react';
import { Room, RoomStatus } from '@/lib/data';
import { cn } from '@/lib/utils';

interface RoomGridProps {
  rooms: Room[];
  limit?: number;
}

const statusConfig: Record<RoomStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  empty: {
    label: 'Trống',
    variant: 'secondary'
  },
  paid: {
    label: 'Đã đóng',
    variant: 'default'
  },
  debt: {
    label: 'Còn nợ',
    variant: 'destructive'
  }
};

function RoomCard({ room }: { room: Room }) {
  const status = statusConfig[room.status];

  return (
    <div className={cn(
      'group p-3 rounded-lg border bg-card hover:shadow-md transition-all duration-200 cursor-pointer',
      'hover:border-primary/50 hover:-translate-y-0.5',
      room.status === 'empty' && 'opacity-60 hover:opacity-100'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-md transition-colors',
            room.status === 'empty' && 'bg-gray-100 group-hover:bg-gray-200',
            room.status === 'paid' && 'bg-green-100 group-hover:bg-green-200',
            room.status === 'debt' && 'bg-red-100 group-hover:bg-red-200'
          )}>
            <Home className={cn(
              'h-3.5 w-3.5',
              room.status === 'empty' && 'text-gray-600',
              room.status === 'paid' && 'text-green-600',
              room.status === 'debt' && 'text-red-600'
            )} />
          </div>
          <span className="font-semibold">P.{room.roomNumber}</span>
        </div>
        <Badge variant={status.variant} className={cn(
          'text-xs px-2 py-0.5',
          room.status === 'paid' && 'bg-green-600 hover:bg-green-700',
          room.status === 'empty' && 'bg-gray-500 hover:bg-gray-600'
        )}>
          {status.label}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        {room.tenant ? (
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3" />
            <span className="truncate">{room.tenant.name}</span>
          </div>
        ) : (
          <span className="italic text-xs">Chưa có khách</span>
        )}
      </div>

      {room.debtAmount && (
        <div className="mt-1.5 text-xs font-medium text-red-600">
          Nợ: {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
          }).format(room.debtAmount)}
        </div>
      )}
    </div>
  );
}

export function RoomGrid({ rooms, limit = 12 }: RoomGridProps) {
  const displayedRooms = rooms.slice(0, limit);
  const totalRooms = rooms.length;

  const stats = {
    empty: rooms.filter(r => r.status === 'empty').length,
    paid: rooms.filter(r => r.status === 'paid').length,
    debt: rooms.filter(r => r.status === 'debt').length
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Quản lý phòng</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.paid} đã đóng, {stats.debt} còn nợ, {stats.empty} trống
          </p>
        </div>
        <Link href="/dashboard/rooms">
          <Button variant="outline" size="sm" className="gap-1.5">
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs mb-4 pb-3 border-b">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
            <span className="text-muted-foreground">Đã đóng ({stats.paid})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span className="text-muted-foreground">Còn nợ ({stats.debt})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
            <span className="text-muted-foreground">Trống ({stats.empty})</span>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {displayedRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {totalRooms > limit && (
          <div className="text-center mt-4 pt-3 border-t">
            <Link href="/dashboard/rooms">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                Xem thêm {totalRooms - limit} phòng
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
