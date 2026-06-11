import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const uuid = () => crypto.randomUUID();
const now = () => new Date();

export const users = sqliteTable('User', {
	id: text('id').primaryKey().$defaultFn(uuid),
	email: text('email').notNull().unique(),
	phone: text('phone').notNull().unique(),
	passwordHash: text('passwordHash').notNull(),
	name: text('name').notNull(),
	avatar: text('avatar'),
	role: text('role').notNull().default('TENANT'), // "SUPER_ADMIN" | "LANDLORD" | "STAFF" | "TENANT"
	isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now),
	updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(now)
		.$onUpdateFn(now)
});

export const landlordProfiles = sqliteTable('LandlordProfile', {
	id: text('id').primaryKey().$defaultFn(uuid),
	userId: text('userId')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	subscriptionType: text('subscriptionType').notNull().default('FREE'), // FREE, PREMIUM, ENTERPRISE
	subValidUntil: integer('subValidUntil', { mode: 'timestamp_ms' }),
	companyName: text('companyName'),

	// Thông tin ngân hàng nhận tiền chuyển khoản (Cấu hình riêng của mỗi chủ trọ)
	bankName: text('bankName').notNull().default('Vietcombank'),
	bankCode: text('bankCode').notNull().default('VCB'),
	accountNumber: text('accountNumber').notNull().default('1234567890'),
	accountName: text('accountName').notNull().default('NGUYEN VAN HAU'),
	bankBranch: text('bankBranch').notNull().default('Chi nhánh TP.HCM'),
	momoNumber: text('momoNumber') // Số điện thoại nhận Momo (tùy chọn)
});

export const staffProfiles = sqliteTable('StaffProfile', {
	id: text('id').primaryKey().$defaultFn(uuid),
	userId: text('userId')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	landlordId: text('landlordId')
		.notNull()
		.references(() => landlordProfiles.id, { onDelete: 'cascade' })
});

export const tenantProfiles = sqliteTable('TenantProfile', {
	id: text('id').primaryKey().$defaultFn(uuid),
	userId: text('userId')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	idNumber: text('idNumber').notNull(), // CCCD
	idFrontImage: text('idFrontImage'), // Ảnh chụp CCCD trước
	idBackImage: text('idBackImage'), // Ảnh chụp CCCD sau
	vehicleImage: text('vehicleImage'), // Ảnh xe máy/Cà vẹt
	checkInImage: text('checkInImage'), // Ảnh chụp lúc bàn giao phòng
	moveInDate: text('moveInDate').notNull(),
	deposit: real('deposit').notNull(),
	notes: text('notes')
});

export const properties = sqliteTable('Property', {
	id: text('id').primaryKey().$defaultFn(uuid),
	landlordId: text('landlordId')
		.notNull()
		.references(() => landlordProfiles.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	shortName: text('shortName').notNull(),
	address: text('address').notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now)
});

export const blocks = sqliteTable('Block', {
	id: text('id').primaryKey().$defaultFn(uuid),
	propertyId: text('propertyId')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	name: text('name').notNull() // ví dụ: "Block A", "Khu nhà cấp 4"
});

export const services = sqliteTable('Service', {
	id: text('id').primaryKey().$defaultFn(uuid),
	landlordId: text('landlordId')
		.notNull()
		.references(() => landlordProfiles.id, { onDelete: 'cascade' }),
	name: text('name').notNull(), // ví dụ: "Điện", "Nước", "Wifi", "Gửi xe máy"
	type: text('type').notNull(), // "METERED" | "FLAT_ROOM" | "FLAT_PERSON" | "FLAT_VEHICLE"
	defaultRate: real('defaultRate').notNull(), // Đơn giá chuẩn áp dụng cho toàn bộ cơ sở
	isActive: integer('isActive', { mode: 'boolean' }).notNull().default(true)
});

export const rooms = sqliteTable('Room', {
	id: text('id').primaryKey().$defaultFn(uuid),
	propertyId: text('propertyId')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	blockId: text('blockId').references(() => blocks.id, { onDelete: 'set null' }),
	roomNumber: text('roomNumber').notNull(),
	roomCode: text('roomCode'), // Mã căn hộ
	roomType: text('roomType').notNull(), // 'standard' | 'master' | 'balcony'
	floor: integer('floor'),
	status: text('status').notNull(), // 'empty' | 'paid' | 'debt'
	monthlyRent: real('monthlyRent').notNull(),
	area: real('area'),
	debtAmount: real('debtAmount').default(0),
	tenantId: text('tenantId').references(() => tenantProfiles.id, { onDelete: 'set null' })
});

export const roomServiceConfigs = sqliteTable('RoomServiceConfig', {
	id: text('id').primaryKey().$defaultFn(uuid),
	roomId: text('roomId')
		.notNull()
		.references(() => rooms.id, { onDelete: 'cascade' }),
	serviceId: text('serviceId')
		.notNull()
		.references(() => services.id, { onDelete: 'cascade' }),
	customRate: real('customRate'), // Nếu không null, ghi đè đơn giá defaultRate của Service
	quantity: integer('quantity').notNull().default(1) // Số lượng đăng ký (áp dụng cho xe máy, số người)
});

export const meterReadings = sqliteTable('MeterReading', {
	id: text('id').primaryKey().$defaultFn(uuid),
	roomId: text('roomId')
		.notNull()
		.references(() => rooms.id, { onDelete: 'cascade' }),
	serviceId: text('serviceId').notNull(), // Chỉ số đo lường cho dịch vụ nào (Ví dụ dịch vụ Điện / Nước)
	month: text('month').notNull(), // Định dạng YYYY-MM
	prevValue: real('prevValue').notNull(),
	currValue: real('currValue').notNull(),
	recordedAt: text('recordedAt').notNull(), // YYYY-MM-DD
	photoUrl: text('photoUrl'), // Lưu trữ ảnh chụp đồng hồ đối chiếu
	status: text('status').notNull().default('approved'), // 'pending' | 'approved' | 'rejected'
	submittedBy: text('submittedBy').notNull().default('LANDLORD'), // 'LANDLORD' | 'TENANT'
	isAnomalous: integer('isAnomalous', { mode: 'boolean' }).notNull().default(false) // Lệch quá ngưỡng so với trung bình 3 tháng
});

export const invoices = sqliteTable('Invoice', {
	id: text('id').primaryKey(),
	roomId: text('roomId')
		.notNull()
		.references(() => rooms.id, { onDelete: 'cascade' }),
	roomNumber: text('roomNumber').notNull(),
	tenantName: text('tenantName').notNull(),
	tenantPhone: text('tenantPhone').notNull(),
	month: text('month').notNull(), // YYYY-MM
	rentAmount: real('rentAmount').notNull(),
	totalAmount: real('totalAmount').notNull(),
	dueDate: text('dueDate').notNull(), // YYYY-MM-DD
	paidDate: text('paidDate'), // YYYY-MM-DD
	status: text('status').notNull(), // 'paid' | 'pending' | 'overdue' | 'partial'
	paidAmount: real('paidAmount').notNull().default(0), // Số tiền đã trả
	paymentProofImage: text('paymentProofImage'), // Ảnh chụp hóa đơn/bill chuyển khoản
	paymentMethod: text('paymentMethod'), // 'manual' | 'bank_webhook' — cách xác nhận thanh toán
	createdAt: text('createdAt').notNull(), // YYYY-MM-DD
	notes: text('notes')
});

export const invoiceItems = sqliteTable('InvoiceItem', {
	id: text('id').primaryKey().$defaultFn(uuid),
	invoiceId: text('invoiceId')
		.notNull()
		.references(() => invoices.id, { onDelete: 'cascade' }),
	name: text('name').notNull(), // ví dụ: "Tiền phòng", "Tiền điện tháng 5", "Wifi"
	amount: real('amount').notNull(),
	details: text('details') // ví dụ: "Chỉ số: 1025 -> 1205 (180 kWh) x 3.500đ"
});

export const maintenanceRequests = sqliteTable('MaintenanceRequest', {
	id: text('id').primaryKey().$defaultFn(uuid),
	tenantId: text('tenantId')
		.notNull()
		.references(() => tenantProfiles.id, { onDelete: 'cascade' }),
	roomNumber: text('roomNumber').notNull(),
	buildingName: text('buildingName').notNull(),
	category: text('category').notNull(), // 'maintenance' | 'plumbing' | 'electrical' | 'internet' | 'other'
	title: text('title').notNull(),
	description: text('description').notNull(),
	imageUrl: text('imageUrl'), // Ảnh sự cố
	status: text('status').notNull(), // 'pending' | 'in_progress' | 'completed' | 'rejected'
	priority: text('priority').notNull(), // 'important' | 'normal'
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now),
	updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(now)
		.$onUpdateFn(now),
	response: text('response'),
	assignedToId: text('assignedToId').references(() => staffProfiles.id, { onDelete: 'set null' })
});

export const specialNotes = sqliteTable('SpecialNote', {
	id: text('id').primaryKey().$defaultFn(uuid),
	tenantId: text('tenantId')
		.notNull()
		.references(() => tenantProfiles.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	sender: text('sender').notNull().default('TENANT'), // 'TENANT' | 'LANDLORD' — chiều gửi của lời nhắn
	isRead: integer('isRead', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now)
});

export const roomAssets = sqliteTable('RoomAsset', {
	id: text('id').primaryKey().$defaultFn(uuid),
	roomId: text('roomId')
		.notNull()
		.references(() => rooms.id, { onDelete: 'cascade' }),
	name: text('name').notNull(), // ví dụ: "Máy lạnh Daikin 1.5 HP", "Tủ lạnh Panasonic"
	code: text('code'), // Mã tài sản kiểm kê
	status: text('status').notNull(), // "good" | "broken" | "need_maintenance"
	imageUrl: text('imageUrl'), // Ảnh thực tế bàn giao
	notes: text('notes')
});

export const announcements = sqliteTable('Announcement', {
	id: text('id').primaryKey().$defaultFn(uuid),
	senderId: text('senderId').notNull(), // Người gửi (Super Admin hoặc Landlord)
	title: text('title').notNull(),
	content: text('content').notNull(),
	isImportant: integer('isImportant', { mode: 'boolean' }).notNull().default(false), // Ghim lên đầu
	targetType: text('targetType').notNull(), // "ALL" | "PROPERTY" | "BLOCK" | "ROOM" | "TENANT"
	targetId: text('targetId'), // ID đối tượng nhận tương ứng
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now)
});

export const messages = sqliteTable('Message', {
	id: text('id').primaryKey().$defaultFn(uuid),
	conversationId: text('conversationId').notNull(), // Định dạng `${landlordProfileId}_${tenantProfileId}`
	senderId: text('senderId').notNull(), // User.id của người gửi
	content: text('content').notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now)
});

export const contracts = sqliteTable('Contract', {
	id: text('id').primaryKey().$defaultFn(uuid),
	tenantId: text('tenantId')
		.notNull()
		.references(() => tenantProfiles.id, { onDelete: 'cascade' }),
	roomId: text('roomId')
		.notNull()
		.references(() => rooms.id, { onDelete: 'cascade' }),
	startDate: text('startDate').notNull(), // YYYY-MM-DD
	endDate: text('endDate').notNull(), // YYYY-MM-DD
	monthlyRent: real('monthlyRent').notNull(),
	deposit: real('deposit').notNull().default(0),
	fileUrl: text('fileUrl'), // Ảnh/scan hợp đồng đã ký
	status: text('status').notNull().default('active'), // 'active' | 'expired' | 'terminated'
	notes: text('notes'),
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now)
});

export const expenses = sqliteTable('Expense', {
	id: text('id').primaryKey().$defaultFn(uuid),
	landlordId: text('landlordId')
		.notNull()
		.references(() => landlordProfiles.id, { onDelete: 'cascade' }),
	propertyId: text('propertyId').references(() => properties.id, { onDelete: 'set null' }), // Để trống nếu là chi phí chung
	category: text('category').notNull(), // 'electricity' | 'water' | 'internet' | 'maintenance' | 'cleaning' | 'tax' | 'other'
	description: text('description').notNull(),
	amount: real('amount').notNull(),
	date: text('date').notNull(), // YYYY-MM-DD
	notes: text('notes'),
	createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(now)
});

// Quan hệ giữa các bảng (dùng cho db.query relational API)

export const usersRelations = relations(users, ({ one }) => ({
	landlordProfile: one(landlordProfiles),
	tenantProfile: one(tenantProfiles),
	staffProfile: one(staffProfiles)
}));

export const landlordProfilesRelations = relations(landlordProfiles, ({ one, many }) => ({
	user: one(users, { fields: [landlordProfiles.userId], references: [users.id] }),
	properties: many(properties),
	services: many(services),
	staffs: many(staffProfiles),
	expenses: many(expenses)
}));

export const staffProfilesRelations = relations(staffProfiles, ({ one, many }) => ({
	user: one(users, { fields: [staffProfiles.userId], references: [users.id] }),
	landlord: one(landlordProfiles, {
		fields: [staffProfiles.landlordId],
		references: [landlordProfiles.id]
	}),
	assignedRequests: many(maintenanceRequests)
}));

export const tenantProfilesRelations = relations(tenantProfiles, ({ one, many }) => ({
	user: one(users, { fields: [tenantProfiles.userId], references: [users.id] }),
	rooms: many(rooms),
	requests: many(maintenanceRequests),
	specialNotes: many(specialNotes),
	contracts: many(contracts)
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
	landlord: one(landlordProfiles, {
		fields: [properties.landlordId],
		references: [landlordProfiles.id]
	}),
	blocks: many(blocks),
	rooms: many(rooms),
	expenses: many(expenses)
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
	property: one(properties, { fields: [blocks.propertyId], references: [properties.id] }),
	rooms: many(rooms)
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
	landlord: one(landlordProfiles, {
		fields: [services.landlordId],
		references: [landlordProfiles.id]
	}),
	configs: many(roomServiceConfigs)
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
	property: one(properties, { fields: [rooms.propertyId], references: [properties.id] }),
	block: one(blocks, { fields: [rooms.blockId], references: [blocks.id] }),
	tenant: one(tenantProfiles, { fields: [rooms.tenantId], references: [tenantProfiles.id] }),
	services: many(roomServiceConfigs),
	meterReadings: many(meterReadings),
	invoices: many(invoices),
	assets: many(roomAssets),
	contracts: many(contracts)
}));

export const roomServiceConfigsRelations = relations(roomServiceConfigs, ({ one }) => ({
	room: one(rooms, { fields: [roomServiceConfigs.roomId], references: [rooms.id] }),
	service: one(services, { fields: [roomServiceConfigs.serviceId], references: [services.id] })
}));

export const meterReadingsRelations = relations(meterReadings, ({ one }) => ({
	room: one(rooms, { fields: [meterReadings.roomId], references: [rooms.id] })
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	room: one(rooms, { fields: [invoices.roomId], references: [rooms.id] }),
	items: many(invoiceItems)
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
	invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] })
}));

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
	tenant: one(tenantProfiles, {
		fields: [maintenanceRequests.tenantId],
		references: [tenantProfiles.id]
	}),
	assignedTo: one(staffProfiles, {
		fields: [maintenanceRequests.assignedToId],
		references: [staffProfiles.id]
	})
}));

export const specialNotesRelations = relations(specialNotes, ({ one }) => ({
	tenant: one(tenantProfiles, { fields: [specialNotes.tenantId], references: [tenantProfiles.id] })
}));

export const roomAssetsRelations = relations(roomAssets, ({ one }) => ({
	room: one(rooms, { fields: [roomAssets.roomId], references: [rooms.id] })
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
	tenant: one(tenantProfiles, { fields: [contracts.tenantId], references: [tenantProfiles.id] }),
	room: one(rooms, { fields: [contracts.roomId], references: [rooms.id] })
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
	landlord: one(landlordProfiles, {
		fields: [expenses.landlordId],
		references: [landlordProfiles.id]
	}),
	property: one(properties, { fields: [expenses.propertyId], references: [properties.id] })
}));
