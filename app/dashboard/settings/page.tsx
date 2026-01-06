'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  DollarSign,
  Users,
  Link2,
  Shield,
  Mail,
  Phone,
  Camera,
  Key,
  Save,
  Zap,
  Droplet,
  Wifi,
  Trash2,
  Car,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Plus,
  UserMinus,
  Eye,
  EyeOff,
  Cloud,
  Banknote,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for owner profile
const ownerProfile = {
  name: 'Nguyễn Văn Hậu',
  email: 'ngochau@gmail.com',
  phone: '0901234567',
  avatar: null,
  createdAt: '2024-01-15'
};

// Mock pricing config
const defaultPricing = {
  electricityRate: 3500,
  waterRate: 15000,
  trashFee: 30000,
  wifiFee: 100000,
  parkingFee: 100000
};

// Mock staff data
const mockStaff = {
  hasStaff: true,
  staff: {
    id: '1',
    email: 'nhanvien@nhatro.com',
    name: 'Trần Thị B',
    createdAt: '2024-06-01',
    lastLogin: '2025-01-05'
  }
};

// Mock bank info
const bankConfig = {
  bankName: 'Vietcombank',
  bankCode: 'VCB',
  accountNumber: '1234567890',
  accountName: 'NGUYEN VAN HAU',
  branch: 'Chi nhánh TP.HCM'
};

// Bank list
const bankList = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VTB', name: 'Vietinbank' },
  { code: 'STB', name: 'Sacombank' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [hasStaff, setHasStaff] = useState(mockStaff.hasStaff);
  const [createStaffOpen, setCreateStaffOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [isChangingStaffPassword, setIsChangingStaffPassword] = useState(false);

  // Form states
  const [profile, setProfile] = useState(ownerProfile);
  const [pricing, setPricing] = useState(defaultPricing);
  const [bank, setBank] = useState(bankConfig);

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Staff form states
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Event handlers
  const handleSaveProfile = async () => {
    if (!profile.name || !profile.phone || !profile.email) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsSavingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã cập nhật thông tin cá nhân');
    setIsSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Vui lòng điền đầy đủ mật khẩu');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordForm.new.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsChangingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã đổi mật khẩu thành công');
    setChangePasswordOpen(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setIsChangingPassword(false);
  };

  const handleSavePricing = async () => {
    setIsSavingPricing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã lưu bảng giá mẫu', {
      description: 'Giá này sẽ áp dụng cho phòng mới'
    });
    setIsSavingPricing(false);
  };

  const handleSaveBank = async () => {
    if (!bank.accountNumber || !bank.accountName) {
      toast.error('Vui lòng điền số tài khoản và tên chủ TK');
      return;
    }

    setIsSavingBank(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã lưu thông tin ngân hàng');
    setIsSavingBank(false);
  };

  const handleCreateStaff = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (staffForm.password !== staffForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsCreatingStaff(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã tạo tài khoản nhân viên', {
      description: `Đã gửi thông tin đăng nhập đến ${staffForm.email}`
    });
    setHasStaff(true);
    setCreateStaffOpen(false);
    setStaffForm({ name: '', email: '', password: '', confirmPassword: '' });
    setIsCreatingStaff(false);
  };

  const handleDeleteStaff = async () => {
    setIsDeletingStaff(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã xóa tài khoản nhân viên');
    setHasStaff(false);
    setIsDeletingStaff(false);
  };

  const handleChangeStaffPassword = async () => {
    setIsChangingStaffPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Đã đổi mật khẩu nhân viên');
    setIsChangingStaffPassword(false);
  };

  const handleUploadAvatar = () => {
    toast.info('Đang mở trình chọn file...', {
      description: 'Chọn ảnh đại diện mới'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản và cấu hình hệ thống</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 py-2.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2 py-2.5">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Giá dịch vụ</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2 py-2.5">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Nhân viên</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2 py-2.5">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Tích hợp</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Hồ sơ cá nhân */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Hồ sơ cá nhân
              </CardTitle>
              <CardDescription>
                Thông tin tài khoản chủ trọ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-slate-100">
                      {profile.name.split(' ').pop()?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={handleUploadAvatar}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">Chủ trọ</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tham gia từ {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Họ và tên</Label>
                  <Input
                    id="ownerName"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="ownerPhone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ownerEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                  {isSavingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Cập nhật thông tin
                </Button>
                <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Key className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Đổi mật khẩu</DialogTitle>
                      <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                        {isChangingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Đổi mật khẩu
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Xác thực 2 lớp (2FA)</p>
                  <p className="text-sm text-muted-foreground">Bảo vệ tài khoản bằng mã xác thực</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Thông báo đăng nhập mới</p>
                  <p className="text-sm text-muted-foreground">Nhận email khi có đăng nhập từ thiết bị mới</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Bảng giá mẫu (Template) */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Bảng giá mẫu (Template)
              </CardTitle>
              <CardDescription>
                Giá này sẽ tự động áp dụng khi tạo phòng mới nếu không có cấu hình riêng. Mỗi phòng có thể tùy chỉnh giá riêng trong phần chi tiết phòng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Electricity & Water */}
              <div>
                <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                  Điện & Nước
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="electricityRate" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Giá điện (đ/kWh)
                    </Label>
                    <Input
                      id="electricityRate"
                      type="number"
                      value={pricing.electricityRate}
                      onChange={(e) => setPricing({ ...pricing, electricityRate: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Giá điện EVN hiện tại: ~3,500đ/kWh
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waterRate" className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      Giá nước (đ/m³)
                    </Label>
                    <Input
                      id="waterRate"
                      type="number"
                      value={pricing.waterRate}
                      onChange={(e) => setPricing({ ...pricing, waterRate: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Giá nước sinh hoạt: ~12,000 - 20,000đ/m³
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Other Fees */}
              <div>
                <h4 className="font-medium mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                  Phí dịch vụ hàng tháng
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="wifiFee" className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-slate-500" />
                      Phí Wifi (đ/tháng)
                    </Label>
                    <Input
                      id="wifiFee"
                      type="number"
                      value={pricing.wifiFee}
                      onChange={(e) => setPricing({ ...pricing, wifiFee: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trashFee" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-slate-500" />
                      Phí rác (đ/tháng)
                    </Label>
                    <Input
                      id="trashFee"
                      type="number"
                      value={pricing.trashFee}
                      onChange={(e) => setPricing({ ...pricing, trashFee: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parkingFee" className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-slate-500" />
                      Phí gửi xe (đ/tháng)
                    </Label>
                    <Input
                      id="parkingFee"
                      type="number"
                      value={pricing.parkingFee}
                      onChange={(e) => setPricing({ ...pricing, parkingFee: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Preview */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Xem trước tổng phí dịch vụ</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Ước tính hóa đơn cho phòng sử dụng 100 kWh điện, 5 m³ nước:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tiền điện (100 kWh)</span>
                    <span>{formatCurrency(pricing.electricityRate * 100)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiền nước (5 m³)</span>
                    <span>{formatCurrency(pricing.waterRate * 5)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wifi + Rác + Gửi xe</span>
                    <span>{formatCurrency(pricing.wifiFee + pricing.trashFee + pricing.parkingFee)}đ</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Tổng phí dịch vụ</span>
                    <span className="text-blue-600">
                      {formatCurrency(
                        pricing.electricityRate * 100 +
                        pricing.waterRate * 5 +
                        pricing.wifiFee +
                        pricing.trashFee +
                        pricing.parkingFee
                      )}đ
                    </span>
                  </div>
                </div>
              </div>

              <Button size="lg" onClick={handleSavePricing} disabled={isSavingPricing}>
                {isSavingPricing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Lưu cấu hình
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Quản lý nhân viên */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quản lý nhân viên
              </CardTitle>
              <CardDescription>
                Tạo tài khoản cho nhân viên để hỗ trợ quản lý nhà trọ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staff Limit Notice */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Gói hiện tại: Cơ bản</p>
                  <p className="text-sm text-blue-700">
                    Gói của bạn cho phép tối đa <strong>1 tài khoản nhân viên</strong> với quyền truy cập tương đương chủ trọ.
                  </p>
                </div>
              </div>

              {hasStaff ? (
                /* Staff exists */
                <div className="border rounded-lg">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {mockStaff.staff.name.split(' ').pop()?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{mockStaff.staff.name}</p>
                        <p className="text-sm text-muted-foreground">{mockStaff.staff.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Đăng nhập gần nhất: {new Date(mockStaff.staff.lastLogin).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700">Đang hoạt động</Badge>
                  </div>
                  <Separator />
                  <div className="p-4 flex gap-3 bg-slate-50">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Key className="h-4 w-4 mr-2" />
                          Đổi mật khẩu
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Đổi mật khẩu nhân viên</DialogTitle>
                          <DialogDescription>
                            Tạo mật khẩu mới cho tài khoản {mockStaff.staff.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="staffNewPassword">Mật khẩu mới</Label>
                            <Input id="staffNewPassword" type="password" placeholder="••••••••" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="staffConfirmPassword">Xác nhận mật khẩu</Label>
                            <Input id="staffConfirmPassword" type="password" placeholder="••••••••" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleChangeStaffPassword} disabled={isChangingStaffPassword}>
                            {isChangingStaffPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Cập nhật mật khẩu
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Xóa quyền truy cập
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa tài khoản nhân viên?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này sẽ xóa vĩnh viễn tài khoản <strong>{mockStaff.staff.email}</strong>.
                            Nhân viên sẽ không còn truy cập được hệ thống.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteStaff}
                            disabled={isDeletingStaff}
                          >
                            {isDeletingStaff && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Xóa tài khoản
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                /* No staff */
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Chưa có tài khoản nhân viên nào</p>
                  <Dialog open={createStaffOpen} onOpenChange={setCreateStaffOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo tài khoản nhân viên
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tạo tài khoản nhân viên</DialogTitle>
                        <DialogDescription>
                          Tạo tài khoản cho nhân viên để hỗ trợ quản lý nhà trọ
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="staffName">Họ và tên</Label>
                          <Input
                            id="staffName"
                            placeholder="Nhập tên nhân viên"
                            value={staffForm.name}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="staffEmail">Email đăng nhập</Label>
                          <Input
                            id="staffEmail"
                            type="email"
                            placeholder="nhanvien@email.com"
                            value={staffForm.email}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="staffPassword">Mật khẩu</Label>
                          <Input
                            id="staffPassword"
                            type="password"
                            placeholder="••••••••"
                            value={staffForm.password}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="staffConfirmPwd">Xác nhận mật khẩu</Label>
                          <Input
                            id="staffConfirmPwd"
                            type="password"
                            placeholder="••••••••"
                            value={staffForm.confirmPassword}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateStaffOpen(false)}>
                          Hủy
                        </Button>
                        <Button onClick={handleCreateStaff} disabled={isCreatingStaff}>
                          {isCreatingStaff && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Tạo tài khoản
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Cấu hình tích hợp */}
        <TabsContent value="integration" className="space-y-6">
          {/* Bank Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Tài khoản ngân hàng nhận tiền
              </CardTitle>
              <CardDescription>
                Thông tin này sẽ hiển thị trên hóa đơn và mã QR thanh toán
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Ngân hàng</Label>
                  <Select value={bank.bankCode} onValueChange={(v) => {
                    const selected = bankList.find(b => b.code === v);
                    setBank({ ...bank, bankCode: v, bankName: selected?.name || '' });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngân hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankList.map((b) => (
                        <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Số tài khoản</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="accountNumber"
                      value={bank.accountNumber}
                      onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                  <Input
                    id="accountName"
                    value={bank.accountName}
                    onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
                    placeholder="IN HOA, KHÔNG DẤU"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Chi nhánh</Label>
                  <Input
                    id="branch"
                    value={bank.branch}
                    onChange={(e) => setBank({ ...bank, branch: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveBank} disabled={isSavingBank}>
                {isSavingBank && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Lưu thông tin ngân hàng
              </Button>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Trạng thái kết nối
              </CardTitle>
              <CardDescription>
                Các dịch vụ bên thứ 3 đang kết nối với hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cloudflare R2 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Cloud className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Cloudflare R2</p>
                    <p className="text-sm text-muted-foreground">Lưu trữ hình ảnh CCCD, hợp đồng</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đã kết nối
                </Badge>
              </div>

              {/* Casso/SePay */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Casso / SePay</p>
                    <p className="text-sm text-muted-foreground">Xác nhận thanh toán tự động</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-100">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Chưa thiết lập
                </Badge>
              </div>

              {/* Zalo */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4z" fill="#0068FF"/>
                      <path d="M32.5 16H16c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16.5c1.1 0 2-.9 2-2V18c0-1.1-.9-2-2-2z" fill="#fff"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Zalo OA</p>
                    <p className="text-sm text-muted-foreground">Gửi hóa đơn qua Zalo</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-slate-100">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Chưa thiết lập
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* API Keys Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Cần hỗ trợ thiết lập?</p>
                  <p className="text-sm text-amber-700">
                    Liên hệ đội ngũ kỹ thuật để được hỗ trợ cấu hình các tích hợp nâng cao.
                    Hotline: <strong>0901234567</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
