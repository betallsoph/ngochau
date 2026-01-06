'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Zap,
  Droplet,
  Wifi,
  QrCode,
  Copy,
  CheckCircle,
  Phone,
  MapPin,
  Calendar,
  Receipt,
  Download,
  Share2
} from 'lucide-react';
import { mockInvoices, getBuildingById, type Invoice } from '@/lib/data';

// Bank info for payment
const bankInfo = {
  bankName: 'Vietcombank',
  bankCode: 'VCB',
  accountNumber: '1234567890',
  accountName: 'NGUYEN VAN A',
  branch: 'Chi nhánh TP.HCM'
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const invoice = useMemo(() => {
    return mockInvoices.find(inv => inv.id === invoiceId);
  }, [invoiceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const generateVietQRUrl = (invoice: Invoice) => {
    const content = `${invoice.id} ${invoice.roomNumber}`;
    return `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-compact2.png?amount=${invoice.totalAmount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-100 text-emerald-700">Đã thanh toán</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Chờ thanh toán</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Quá hạn</Badge>;
      default:
        return null;
    }
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Receipt className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h1 className="text-xl font-semibold mb-2">Không tìm thấy hóa đơn</h1>
            <p className="text-muted-foreground">Mã hóa đơn không hợp lệ hoặc đã bị xóa.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const building = getBuildingById(invoice.buildingId);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile-optimized invoice view */}
      <div className="max-w-lg mx-auto">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm">NHÀ TRỌ NGỌC HẬU</h1>
                <p className="text-xs text-muted-foreground">Hóa đơn #{invoice.id.slice(-6)}</p>
              </div>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Invoice Info Card */}
          <Card className="overflow-hidden">
            <div className="bg-slate-800 text-white p-4">
              <div className="text-center">
                <p className="text-slate-300 text-sm">Tổng tiền thanh toán</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(invoice.totalAmount)}</p>
                <p className="text-slate-400 text-sm mt-2">
                  Kỳ: Tháng {invoice.month.split('-')[1]}/{invoice.month.split('-')[0]}
                </p>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Tenant Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-slate-600">
                    {invoice.tenantName.charAt(invoice.tenantName.lastIndexOf(' ') + 1)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{invoice.tenantName}</p>
                  <p className="text-sm text-muted-foreground">
                    Phòng {invoice.roomNumber} • {building?.shortName}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-muted-foreground text-xs">Ngày xuất</p>
                  <p className="font-medium">{formatDate(invoice.createdAt)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-muted-foreground text-xs">Hạn thanh toán</p>
                  <p className="font-medium text-red-600">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Breakdown */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Chi tiết hóa đơn
              </h3>

              <div className="space-y-3">
                {/* Rent */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-slate-600" />
                    </div>
                    <span>Tiền nhà</span>
                  </div>
                  <span className="font-medium">{formatCurrency(invoice.rentAmount)}</span>
                </div>

                <Separator />

                {/* Electricity */}
                <div className="py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                        <Zap className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <span>Tiền điện</span>
                        <p className="text-xs text-muted-foreground">
                          {invoice.electricityUsage} kWh × {formatCurrency(building?.electricityRate || 3500).replace('đ', '')}đ
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(invoice.electricityAmount)}</span>
                  </div>
                </div>

                <Separator />

                {/* Water */}
                <div className="py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Droplet className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span>Tiền nước</span>
                        <p className="text-xs text-muted-foreground">
                          {invoice.waterUsage} m³ × {formatCurrency(building?.waterRate || 15000).replace('đ', '')}đ
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(invoice.waterAmount)}</span>
                  </div>
                </div>

                <Separator />

                {/* Other fees */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Wifi className="h-4 w-4 text-slate-600" />
                    </div>
                    <span>Phí khác (Wifi, Rác)</span>
                  </div>
                  <span className="font-medium">{formatCurrency(invoice.otherFees)}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between py-3 bg-slate-900 text-white -mx-4 px-4 rounded-lg mt-4">
                  <span className="font-semibold">TỔNG CỘNG</span>
                  <span className="text-xl font-bold">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          {invoice.status !== 'paid' ? (
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-700">
                  <QrCode className="h-4 w-4" />
                  Thanh toán chuyển khoản
                </h3>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <img
                      src={generateVietQRUrl(invoice)}
                      alt="VietQR"
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground mb-4">
                  Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                </p>

                {/* Bank Details */}
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Ngân hàng</span>
                    <span className="font-medium">{bankInfo.bankName}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{bankInfo.accountNumber}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(bankInfo.accountNumber)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Chủ tài khoản</span>
                    <span className="font-medium">{bankInfo.accountName}</span>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Nội dung chuyển khoản</p>
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-3">
                      <code className="flex-1 text-sm font-mono font-medium">
                        {invoice.id} {invoice.roomNumber}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => copyToClipboard(`${invoice.id} ${invoice.roomNumber}`)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Amount to pay */}
                <div className="mt-4 p-4 bg-white rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Số tiền cần thanh toán</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(invoice.totalAmount)}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Paid Status */
            <Card className="border-2 border-emerald-200 bg-emerald-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-700 mb-2">
                  Đã thanh toán
                </h3>
                {invoice.paidDate && (
                  <p className="text-emerald-600">
                    Ngày {formatDate(invoice.paidDate)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact & Address */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Thông tin liên hệ
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p>{building?.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href="tel:0901234567" className="text-blue-600">0901234567</a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex gap-3 pb-4">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Tải PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center py-6 text-xs text-muted-foreground border-t">
            <p>Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ</p>
            <p className="mt-1">© 2025 Nhà Trọ Ngọc Hậu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
