'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý thông tin và cài đặt hệ thống</p>
      </div>

      {/* Business Info */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold mb-4">Thông tin nhà trọ</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên nhà trọ</label>
                <Input defaultValue="Nhà Trọ Ngọc Hậu" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input defaultValue="0901234567" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input defaultValue="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue="contact@nhatro.com" />
            </div>
            <Button>Lưu thay đổi</Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold mb-4">Giá dịch vụ</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá điện (đ/kWh)</label>
                <Input defaultValue="3500" type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Giá nước (đ/m³)</label>
                <Input defaultValue="15000" type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phí wifi (đ/tháng)</label>
                <Input defaultValue="100000" type="number" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phí rác (đ/tháng)</label>
                <Input defaultValue="30000" type="number" />
              </div>
            </div>
            <Button>Lưu thay đổi</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold mb-4">Thông báo</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Thông báo hóa đơn quá hạn</p>
                <p className="text-sm text-muted-foreground">Nhận thông báo khi có hóa đơn quá hạn</p>
              </div>
              <span className="text-sm">Bật</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Thông báo hợp đồng sắp hết hạn</p>
                <p className="text-sm text-muted-foreground">Thông báo trước 30 ngày khi hợp đồng sắp hết</p>
              </div>
              <span className="text-sm">Bật</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Báo cáo email hàng ngày</p>
                <p className="text-sm text-muted-foreground">Nhận báo cáo tổng hợp qua email mỗi ngày</p>
              </div>
              <span className="text-sm text-muted-foreground">Tắt</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold mb-4">Tài khoản</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên đăng nhập</label>
                <Input defaultValue="admin" disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue="admin@nhatro.com" disabled />
              </div>
            </div>
            <Button variant="outline">Đổi mật khẩu</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
