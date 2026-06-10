# Roomio - Hệ thống quản lý nhà trọ

Roomio là ứng dụng web hỗ trợ chủ trọ quản lý vận hành nhà trọ: tòa nhà, phòng, khách thuê, dịch vụ, chỉ số điện nước, hóa đơn và yêu cầu sửa chữa. Ứng dụng được thiết kế theo mô hình multi-tenant SaaS, trong đó mỗi chủ trọ (landlord) quản lý dữ liệu riêng của mình và Super Admin quản lý toàn hệ thống.

## Tính năng chính

### Dành cho chủ trọ (Landlord)

- Quản lý nhiều cơ sở (tòa nhà), mỗi cơ sở có thể chia thành các block.
- Quản lý phòng: loại phòng, diện tích, giá thuê, trạng thái (trống, đã thanh toán, còn nợ), tài sản bàn giao trong phòng.
- Quản lý khách thuê: thông tin cá nhân, CCCD, tiền cọc, ngày chuyển vào.
- Cấu hình dịch vụ tùy biến: điện, nước (tính theo đồng hồ), wifi, rác, gửi xe (tính cố định theo phòng, người hoặc xe), có thể ghi đè đơn giá riêng cho từng phòng.
- Ghi chỉ số điện nước hàng tháng, kèm ảnh chụp đồng hồ đối chiếu.
- Tạo hóa đơn theo từng phòng hoặc tạo hàng loạt theo tháng, theo dõi trạng thái thanh toán (đã trả, chờ trả, quá hạn, trả một phần).
- Tiếp nhận và xử lý yêu cầu sửa chữa từ khách thuê, phân công cho nhân viên.
- Gửi thông báo đến toàn bộ hoặc theo từng cơ sở, block, phòng.
- Cấu hình thông tin ngân hàng nhận thanh toán chuyển khoản.
- Dashboard tổng quan: doanh thu, tỷ lệ lấp đầy, công nợ.

### Dành cho khách thuê (Tenant)

- Xem thông tin phòng, hóa đơn và lịch sử thanh toán.
- Gửi yêu cầu sửa chữa (điện, nước, internet...) kèm ảnh sự cố.
- Nhận thông báo từ chủ trọ.

### Dành cho Super Admin

- Quản lý toàn bộ tài khoản chủ trọ và gói dịch vụ (FREE, PREMIUM, ENTERPRISE).

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Framework | SvelteKit 2 (Svelte 5) |
| Ngôn ngữ | TypeScript |
| Giao diện | Tailwind CSS 4, Lucide Icons, svelte-sonner |
| ORM | Prisma 6 |
| Cơ sở dữ liệu | SQLite (môi trường phát triển) |
| Build tool | Vite 8 |
| Deploy | @sveltejs/adapter-node |

## Yêu cầu môi trường

- Node.js 20 trở lên
- npm

## Cài đặt và chạy dự án

1. Cài đặt dependencies (lệnh này cũng tự động chạy `prisma generate`):

   ```bash
   npm install
   ```

2. Khởi tạo cơ sở dữ liệu:

   ```bash
   npx prisma migrate dev
   ```

3. Tạo dữ liệu mẫu:

   ```bash
   npm run seed
   ```

4. Chạy server phát triển:

   ```bash
   npm run dev
   ```

   Ứng dụng chạy tại `http://localhost:5173`.

### Tài khoản mẫu (sau khi seed)

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Super Admin | superadmin@ngochau.com | admin |
| Chủ trọ | ngochau@gmail.com | password |
| Nhân viên | nhanvien@nhatro.com | staff |
| Khách thuê | (tạo ngẫu nhiên khi seed) | 123456 |

## Các lệnh có sẵn

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Chạy server phát triển |
| `npm run build` | Build bản production |
| `npm run start` | Chạy bản build production |
| `npm run preview` | Xem trước bản build |
| `npm run check` | Kiểm tra type với svelte-check |
| `npm run lint` | Kiểm tra format (Prettier) và lint (ESLint) |
| `npm run format` | Tự động format code |
| `npm run seed` | Tạo dữ liệu mẫu |

## Cấu trúc thư mục

```
prisma/
  schema.prisma          Định nghĩa cơ sở dữ liệu (Prisma schema)
  seed.ts                Script tạo dữ liệu mẫu
  migrations/            Lịch sử migration
src/
  lib/
    db.ts                Prisma client (singleton)
  routes/
    +page.svelte         Trang chủ (landing)
    login/               Đăng nhập, đăng ký
    dashboard/           Khu vực quản lý của chủ trọ
      buildings/         Quản lý tòa nhà
      rooms/             Quản lý phòng
      tenants/           Quản lý khách thuê
      invoices/          Quản lý hóa đơn (kèm tạo hàng loạt)
      requests/          Yêu cầu sửa chữa
      notifications/     Thông báo
      settings/          Cài đặt (dịch vụ, ngân hàng)
    tenant/              Cổng dành cho khách thuê
    super-admin/         Trang quản trị hệ thống
    api/                 Các REST API endpoint (SvelteKit server routes)
static/                  Tài nguyên tĩnh (font, robots.txt)
```

## Mô hình dữ liệu

Các thực thể chính trong `prisma/schema.prisma`:

- `User`: tài khoản chung, phân vai trò qua trường `role` (SUPER_ADMIN, LANDLORD, STAFF, TENANT). Mỗi vai trò có bảng profile tương ứng (`LandlordProfile`, `StaffProfile`, `TenantProfile`).
- `Property` / `Block` / `Room`: cấu trúc tòa nhà - block - phòng.
- `Service` / `RoomServiceConfig`: dịch vụ của chủ trọ và cấu hình áp dụng cho từng phòng (đơn giá riêng, số lượng).
- `MeterReading`: chỉ số điện nước theo tháng.
- `Invoice` / `InvoiceItem`: hóa đơn và các dòng chi tiết.
- `MaintenanceRequest`: yêu cầu sửa chữa, có thể phân công cho nhân viên.
- `Announcement`, `SpecialNote`, `Message`: thông báo và trao đổi.

## Ghi chú

- Dự án đang ở giai đoạn phát triển, dùng SQLite và cơ chế xác thực đơn giản (chưa phù hợp cho môi trường production).
- Khi thay đổi schema, chạy `npx prisma migrate dev` để tạo migration mới.
