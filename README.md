# Roomio - Hệ thống quản lý nhà trọ

Roomio là ứng dụng web hỗ trợ chủ trọ quản lý vận hành nhà trọ: tòa nhà, phòng, khách thuê, dịch vụ, chỉ số điện nước, hóa đơn và yêu cầu sửa chữa. Ứng dụng được thiết kế theo mô hình multi-tenant SaaS, trong đó mỗi chủ trọ (landlord) quản lý dữ liệu riêng của mình và Super Admin quản lý toàn hệ thống.

## Tính năng chính

### Dành cho chủ trọ (Landlord)

- Quản lý nhiều cơ sở (tòa nhà), mỗi cơ sở có thể chia thành các block.
- Quản lý phòng: loại phòng, diện tích, giá thuê, trạng thái (trống, đã thanh toán, còn nợ), tài sản bàn giao trong phòng.
- Quản lý khách thuê: thông tin cá nhân, CCCD, tiền cọc, ngày chuyển vào.
- Cấu hình dịch vụ tùy biến: điện, nước (tính theo đồng hồ), wifi, rác, gửi xe (tính cố định theo phòng, người hoặc xe), có thể ghi đè đơn giá riêng cho từng phòng.
- Chốt số điện nước: khách tự báo số kèm ảnh chụp đồng hồ (ảnh được nén và đóng dấu thời gian ngay trên máy khách), hệ thống tự gắn cờ chỉ số bất thường so với trung bình 3 tháng, chủ trọ đối chiếu ảnh rồi duyệt hoặc từ chối.
- Tạo hóa đơn theo từng phòng hoặc tạo hàng loạt theo tháng (tự điền chỉ số đã chốt), theo dõi trạng thái thanh toán (đã trả, chờ trả, quá hạn, trả một phần).
- Đối soát thanh toán tự động qua webhook ngân hàng (SePay/Casso): tiền vào tài khoản có mã hóa đơn trong nội dung chuyển khoản sẽ tự được xác nhận, hạn chế bill giả mạo.
- Quản lý hợp đồng thuê: thời hạn, tiền cọc, file scan, cảnh báo hợp đồng sắp hết hạn trong 30 ngày.
- Theo dõi tài chính: ghi nhận chi phí vận hành (điện, nước, internet, sửa chữa...), so sánh thu chi và lợi nhuận theo tháng.
- Nhắn tin trực tiếp với khách thuê và gửi lời nhắn lưu ý riêng (hai chiều, tách biệt với chat).
- Tiếp nhận và xử lý yêu cầu sửa chữa từ khách thuê, phân công cho nhân viên.
- Gửi thông báo đến toàn bộ hoặc theo từng cơ sở, block, phòng, hoặc đích danh một khách thuê (có gắn nhãn quan trọng để ghim nổi bật phía khách).
- Cấu hình thông tin ngân hàng và số Momo nhận thanh toán chuyển khoản (mã VietQR sinh tự động cho từng hóa đơn).
- Dashboard tổng quan: doanh thu, tỷ lệ lấp đầy, công nợ.

### Dành cho khách thuê (Tenant)

- Xem thông tin phòng, hợp đồng, hóa đơn và lịch sử thanh toán; thanh toán bằng mã VietQR có sẵn mã hóa đơn.
- Báo số điện nước hàng tháng kèm ảnh chụp đồng hồ, theo dõi trạng thái duyệt.
- Gửi yêu cầu sửa chữa (điện, nước, internet...) kèm ảnh sự cố, đánh dấu mức độ khẩn cấp.
- Tải lên giấy tờ khi nhận phòng: ảnh CCCD hai mặt, cà vẹt xe, ảnh hiện trạng phòng lúc check-in.
- Nhận thông báo từ chủ trọ, chat trực tiếp và gửi lời nhắn lưu ý riêng.
- Xem danh sách phòng trống của tòa nhà để giới thiệu bạn bè.

### Dành cho Super Admin

- Quản lý toàn bộ tài khoản chủ trọ và gói dịch vụ (FREE, PREMIUM, ENTERPRISE).

## Công nghệ sử dụng

| Thành phần    | Công nghệ                                   |
| ------------- | ------------------------------------------- |
| Framework     | SvelteKit 2 (Svelte 5)                      |
| Ngôn ngữ      | TypeScript                                  |
| Giao diện     | Tailwind CSS 4, Lucide Icons, svelte-sonner |
| ORM           | Drizzle ORM                                 |
| Cơ sở dữ liệu | PostgreSQL (dev dùng PGlite nhúng)          |
| Build tool    | Vite 8                                      |
| Deploy        | @sveltejs/adapter-node                      |

## Yêu cầu môi trường

- Node.js 20 trở lên
- npm

## Cài đặt và chạy dự án

1. Cài đặt dependencies:

   ```bash
   npm install
   ```

2. Khởi tạo cơ sở dữ liệu (dev mặc định dùng PGlite — Postgres nhúng lưu vào thư mục `pgdata/`, không cần cài đặt gì thêm):

   ```bash
   npm run db:migrate
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

| Vai trò     | Email                     | Mật khẩu |
| ----------- | ------------------------- | -------- |
| Super Admin | superadmin@ngochau.com    | admin    |
| Chủ trọ     | ngochau@gmail.com         | password |
| Nhân viên   | nhanvien@nhatro.com       | staff    |
| Khách thuê  | (tạo ngẫu nhiên khi seed) | 123456   |

## Các lệnh có sẵn

| Lệnh                      | Mô tả                                                          |
| ------------------------- | -------------------------------------------------------------- |
| `npm run dev`             | Chạy server phát triển                                         |
| `npm run build`           | Build bản production                                           |
| `npm run start`           | Chạy bản build production                                      |
| `npm run preview`         | Xem trước bản build                                            |
| `npm run check`           | Kiểm tra type với svelte-check                                 |
| `npm run lint`            | Kiểm tra format (Prettier) và lint (ESLint)                    |
| `npm run format`          | Tự động format code                                            |
| `npm run db:generate`     | Sinh file migration mới từ thay đổi trong schema               |
| `npm run db:migrate`      | Áp dụng các migration vào cơ sở dữ liệu                        |
| `npm run db:push`         | Đồng bộ schema trực tiếp vào DB (chỉ dùng khi thử nghiệm)      |
| `npm run seed`            | Tạo dữ liệu mẫu                                                |
| `npm run cleanup:uploads` | Xóa ảnh đối chiếu (đồng hồ, bill) quá 3 tháng, giữ lại số liệu |

## Cấu trúc thư mục

```
drizzle/                 Các file migration SQL (sinh bởi drizzle-kit)
scripts/
  seed.ts                Script tạo dữ liệu mẫu
  cleanup-uploads.ts     Dọn ảnh đối chiếu quá 3 tháng
uploads/                 Ảnh do người dùng tải lên (tự tạo khi chạy, không commit)
pgdata/                  Dữ liệu PGlite khi chạy local (tự tạo, không commit)
src/
  hooks.server.ts        Middleware xác thực phiên và phân quyền API
  lib/
    upload.ts            Nén ảnh + đóng dấu thời gian phía client trước khi upload
    server/
      session.ts         Tạo và xác minh session cookie
      db/
        schema.ts        Định nghĩa cơ sở dữ liệu (Drizzle schema)
        index.ts         Kết nối Postgres (pg) hoặc PGlite và khởi tạo Drizzle client
  routes/
    +page.svelte         Trang chủ (landing)
    login/               Đăng nhập, đăng ký
    dashboard/           Khu vực quản lý của chủ trọ
      buildings/         Quản lý tòa nhà
      rooms/             Quản lý phòng
      meters/            Chốt số điện nước khách gửi
      tenants/           Quản lý khách thuê
      contracts/         Quản lý hợp đồng thuê
      invoices/          Quản lý hóa đơn (kèm tạo hàng loạt)
      requests/          Yêu cầu sửa chữa
      messages/          Chat với khách thuê
      finance/           Chi phí và dòng tiền
      notifications/     Thông báo và lời nhắn
      settings/          Cài đặt (dịch vụ, ngân hàng, Momo)
    tenant/              Cổng dành cho khách thuê
    super-admin/         Trang quản trị hệ thống
    api/                 Các REST API endpoint (SvelteKit server routes)
static/                  Tài nguyên tĩnh (font, robots.txt)
```

## Mô hình dữ liệu

Các thực thể chính trong `src/lib/server/db/schema.ts`:

- `User`: tài khoản chung, phân vai trò qua trường `role` (SUPER_ADMIN, LANDLORD, STAFF, TENANT). Mỗi vai trò có bảng profile tương ứng (`LandlordProfile`, `StaffProfile`, `TenantProfile`).
- `Property` / `Block` / `Room`: cấu trúc tòa nhà - block - phòng.
- `Service` / `RoomServiceConfig`: dịch vụ của chủ trọ và cấu hình áp dụng cho từng phòng (đơn giá riêng, số lượng).
- `MeterReading`: chỉ số điện nước theo tháng, kèm trạng thái duyệt (chờ duyệt / đã chốt / từ chối), người gửi và cờ bất thường.
- `Invoice` / `InvoiceItem`: hóa đơn và các dòng chi tiết.
- `MaintenanceRequest`: yêu cầu sửa chữa, có thể phân công cho nhân viên.
- `Contract`: hợp đồng thuê gắn với khách và phòng (thời hạn, cọc, file scan).
- `Expense`: chi phí vận hành của chủ trọ, dùng cho phân tích dòng tiền.
- `Announcement`, `SpecialNote`, `Message`: thông báo, lời nhắn hai chiều và tin nhắn chat.

## Biến môi trường

| Biến             | Mặc định    | Mô tả                                                                                                            |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | (trống)     | Chuỗi kết nối Postgres production, ví dụ `postgres://user:pass@host:5432/roomio`. Bỏ trống thì dùng PGlite local |
| `PGLITE_DIR`     | `./pgdata`  | Thư mục dữ liệu PGlite khi chạy local                                                                            |
| `SESSION_SECRET` | (chuỗi dev) | Khóa ký cookie phiên đăng nhập — bắt buộc đổi khi chạy production                                                |
| `UPLOAD_DIR`     | `uploads`   | Thư mục lưu ảnh upload                                                                                           |
| `SEPAY_API_KEY`  | (trống)     | API key xác thực webhook SePay; bỏ trống thì webhook không kiểm tra header                                       |
| `ORIGIN`         | (trống)     | Origin của site khi chạy bản build Node (bắt buộc để upload form hoạt động), ví dụ `https://app.example.com`     |

## Xác thực và phân quyền

- Đăng nhập tạo session cookie (HMAC-signed, httpOnly) có hiệu lực 7 ngày; mọi API (trừ đăng nhập và webhook thanh toán) yêu cầu phiên hợp lệ.
- Middleware trong `src/hooks.server.ts` chặn truy cập chéo dữ liệu: chủ trọ chỉ đọc được dữ liệu theo `landlordProfileId` của mình, khách thuê theo `tenantProfileId` của mình, khu vực Super Admin chỉ dành cho vai trò SUPER_ADMIN.
- Ảnh upload được phục vụ qua `/api/files/` và cũng yêu cầu đăng nhập.

## Đối soát thanh toán tự động (SePay)

1. Tạo tài khoản SePay và liên kết tài khoản ngân hàng nhận tiền.
2. Khai báo webhook trỏ về `https://<domain>/api/payment-webhook`, chọn xác thực API key với header `Authorization: Apikey <SEPAY_API_KEY>`.
3. Đặt biến môi trường `SEPAY_API_KEY` trùng giá trị trên.
4. Khách quét mã VietQR trên hóa đơn (nội dung chuyển khoản chứa mã hóa đơn); khi tiền vào tài khoản, hệ thống tự xác nhận thanh toán và trừ công nợ phòng.

## Ghi chú

- Khi triển khai production: tạo database PostgreSQL (Supabase/Neon/Railway hoặc tự host), đặt `DATABASE_URL`, chạy `npm run db:migrate` rồi `npm run build` và `npm run start`. Bắt buộc đặt `SESSION_SECRET` và `ORIGIN`; cân nhắc nâng cấp thuật toán băm mật khẩu (hiện dùng SHA-256 không salt).
- PGlite chỉ dành cho môi trường dev local — production luôn dùng Postgres thật qua `DATABASE_URL`.
- Khi thay đổi schema, chạy `npm run db:generate` để sinh migration mới, sau đó `npm run db:migrate` để áp dụng.
