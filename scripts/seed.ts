import crypto from 'crypto';
import { db } from '../src/lib/server/db';
import {
	users,
	landlordProfiles,
	staffProfiles,
	tenantProfiles,
	properties,
	blocks,
	services,
	rooms,
	roomServiceConfigs,
	meterReadings,
	invoices,
	invoiceItems,
	maintenanceRequests,
	specialNotes,
	roomAssets,
	announcements,
	messages,
	contracts,
	expenses
} from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Helper to hash password using SHA-256
function hashPassword(password: string) {
	return crypto.createHash('sha256').update(password).digest('hex');
}

// Vietnamese names for mock data
const vietnameseFirstNames = [
	'An',
	'Bình',
	'Cường',
	'Dung',
	'Em',
	'Phương',
	'Giang',
	'Hà',
	'Hùng',
	'Kim',
	'Long',
	'Mai',
	'Nam',
	'Oanh',
	'Phúc',
	'Quỳnh',
	'Sơn',
	'Thanh',
	'Tùng',
	'Uyên',
	'Vinh',
	'Xuyến',
	'Yên',
	'Lan',
	'Minh',
	'Ngọc',
	'Quang',
	'Thảo',
	'Tuấn',
	'Vân',
	'Xuân',
	'Hương',
	'Đức',
	'Linh',
	'Hải',
	'Trang',
	'Khoa',
	'Nhung',
	'Hiếu',
	'Thủy'
];

const vietnameseLastNames = [
	'Nguyễn',
	'Trần',
	'Lê',
	'Phạm',
	'Hoàng',
	'Võ',
	'Đặng',
	'Bùi',
	'Đỗ',
	'Ngô',
	'Dương',
	'Lý',
	'Vũ',
	'Phan',
	'Trịnh',
	'Đinh',
	'Hồ',
	'Tô',
	'Lương',
	'Mai',
	'Chu',
	'Cao',
	'Tạ',
	'La'
];

const vietnameseMiddleNames = [
	'Văn',
	'Thị',
	'Hữu',
	'Ngọc',
	'Minh',
	'Thanh',
	'Hoàng',
	'Kim',
	'Quốc',
	'Anh',
	'Đức',
	'Xuân',
	'Thu',
	'Hồng',
	'Bảo',
	'Phương'
];

const generateVietnameseName = (): string => {
	const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
	const middleName =
		vietnameseMiddleNames[Math.floor(Math.random() * vietnameseMiddleNames.length)];
	const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
	return `${lastName} ${middleName} ${firstName}`;
};

const generatePhone = (): string => {
	const prefixes = [
		'090',
		'091',
		'093',
		'094',
		'096',
		'097',
		'098',
		'032',
		'033',
		'034',
		'035',
		'036',
		'037',
		'038',
		'039',
		'070',
		'076',
		'077',
		'078',
		'079',
		'081',
		'082',
		'083',
		'084',
		'085'
	];
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const number = Math.floor(Math.random() * 10000000)
		.toString()
		.padStart(7, '0');
	return prefix + number;
};

const generateIdNumber = (): string => {
	const provinceCode = Math.floor(Math.random() * 96)
		.toString()
		.padStart(3, '0');
	const genderYear = Math.floor(Math.random() * 2) + (Math.random() > 0.5 ? 0 : 1);
	const yearCode = genderYear.toString();
	const randomPart = Math.floor(Math.random() * 100000000)
		.toString()
		.padStart(8, '0');
	return provinceCode + yearCode + randomPart;
};

const generateMoveInDate = (): string => {
	const now = new Date();
	const monthsAgo = Math.floor(Math.random() * 36) + 1;
	now.setMonth(now.getMonth() - monthsAgo);
	now.setDate(Math.floor(Math.random() * 28) + 1);
	return now.toISOString().split('T')[0];
};

const propertiesData = [
	{
		id: 'hagl3',
		name: 'Hoàng Anh Gia Lai 3',
		shortName: 'HAGL 3',
		address: '121 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM'
	},
	{
		id: 'pha',
		name: 'Phú Hoàng Anh',
		shortName: 'Phú Hoàng Anh',
		address: '1 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM'
	},
	{
		id: 'ssr',
		name: 'Saigon South Residences',
		shortName: 'SSR',
		address: '63 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM'
	},
	{
		id: 'sunrise',
		name: 'Sunrise Riverside',
		shortName: 'Sunrise',
		address: '60 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM'
	},
	{
		id: 'mp6',
		name: 'Mizuki Park 6',
		shortName: 'MP6',
		address: 'Nguyễn Văn Linh, Bình Chánh, TP.HCM'
	}
];

function main() {
	db.transaction((tx) => {
		console.log('Bắt đầu dọn dẹp database...');
		tx.delete(expenses).run();
		tx.delete(contracts).run();
		tx.delete(messages).run();
		tx.delete(announcements).run();
		tx.delete(roomAssets).run();
		tx.delete(specialNotes).run();
		tx.delete(maintenanceRequests).run();
		tx.delete(invoiceItems).run();
		tx.delete(invoices).run();
		tx.delete(meterReadings).run();
		tx.delete(roomServiceConfigs).run();
		tx.delete(rooms).run();
		tx.delete(services).run();
		tx.delete(blocks).run();
		tx.delete(properties).run();
		tx.delete(tenantProfiles).run();
		tx.delete(staffProfiles).run();
		tx.delete(landlordProfiles).run();
		tx.delete(users).run();

		console.log('Khởi tạo Super Admin...');
		tx.insert(users)
			.values({
				email: 'superadmin@ngochau.com',
				phone: '0999999999',
				passwordHash: hashPassword('admin'),
				name: 'Super Admin',
				role: 'SUPER_ADMIN'
			})
			.run();

		console.log('Khởi tạo Landlord (Chủ trọ Ngọc Hậu)...');
		const landlordUser = tx
			.insert(users)
			.values({
				email: 'ngochau@gmail.com',
				phone: '0901234567',
				passwordHash: hashPassword('password'),
				name: 'Nguyễn Văn Hậu',
				role: 'LANDLORD'
			})
			.returning()
			.get();

		const landlordProfile = tx
			.insert(landlordProfiles)
			.values({
				userId: landlordUser.id,
				companyName: 'Nhà Trọ Ngọc Hậu',
				bankName: 'Vietcombank',
				bankCode: 'VCB',
				accountNumber: '1234567890',
				accountName: 'NGUYEN VAN HAU',
				bankBranch: 'Chi nhánh TP.HCM',
				momoNumber: '0901234567'
			})
			.returning()
			.get();

		console.log('Khởi tạo Staff (Nhân viên quản lý)...');
		const staffUser = tx
			.insert(users)
			.values({
				email: 'nhanvien@nhatro.com',
				phone: '0987654321',
				passwordHash: hashPassword('staff'),
				name: 'Trần Thị B',
				role: 'STAFF'
			})
			.returning()
			.get();

		const staffProfile = tx
			.insert(staffProfiles)
			.values({ userId: staffUser.id, landlordId: landlordProfile.id })
			.returning()
			.get();

		console.log('Tạo Dịch vụ động (Dynamic Services)...');
		const serviceList = tx
			.insert(services)
			.values([
				{ landlordId: landlordProfile.id, name: 'Điện', type: 'METERED', defaultRate: 3500 },
				{ landlordId: landlordProfile.id, name: 'Nước', type: 'METERED', defaultRate: 15000 },
				{ landlordId: landlordProfile.id, name: 'Wifi', type: 'FLAT_ROOM', defaultRate: 100000 },
				{ landlordId: landlordProfile.id, name: 'Rác', type: 'FLAT_ROOM', defaultRate: 30000 },
				{
					landlordId: landlordProfile.id,
					name: 'Gửi xe máy',
					type: 'FLAT_VEHICLE',
					defaultRate: 100000
				}
			])
			.returning()
			.all();

		console.log('Tạo tòa nhà (Properties) và các Block...');
		const now = new Date();
		const todayStr = now.toISOString().split('T')[0];
		const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
		const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const lastMonthStr = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;

		let globalInvoiceCounter = 1;

		for (const propData of propertiesData) {
			const property = tx
				.insert(properties)
				.values({
					id: propData.id,
					landlordId: landlordProfile.id,
					name: propData.name,
					shortName: propData.shortName,
					address: propData.address
				})
				.returning()
				.get();

			// Tạo các Block/Tầng cho tòa nhà
			const totalRooms = propData.id === 'mp6' ? 8 : 40; // Giới hạn số phòng lại một chút để seed chạy nhanh hơn
			const floors = propData.id === 'mp6' ? 3 : 5;
			const roomsPerFloor = Math.ceil(totalRooms / floors);

			const blockList = [];
			for (let f = 1; f <= floors; f++) {
				const block = tx
					.insert(blocks)
					.values({ propertyId: property.id, name: `Tầng ${f}` })
					.returning()
					.get();
				blockList.push(block);
			}

			for (let i = 1; i <= totalRooms; i++) {
				const floor = Math.ceil(i / roomsPerFloor);
				const roomOnFloor = ((i - 1) % roomsPerFloor) + 1;
				const block = blockList[floor - 1];

				const roomNumber = `${floor}${roomOnFloor.toString().padStart(2, '0')}`;
				const roomCode =
					property.id === 'mp6' ? `MP-${floor}-${roomOnFloor.toString().padStart(2, '0')}` : null;

				const randomVal = Math.random();
				let status: 'empty' | 'paid' | 'debt' = 'empty';
				if (randomVal >= 0.15 && randomVal < 0.8) {
					status = 'paid';
				} else if (randomVal >= 0.8) {
					status = 'debt';
				}

				// Giá thuê
				const baseRent = property.id === 'ssr' || property.id === 'sunrise' ? 8000000 : 5000000;
				const floorBonus = (floor - 1) * 300000;
				const monthlyRent = baseRent + floorBonus + Math.floor(Math.random() * 2) * 1000000;

				const area =
					(property.id === 'ssr' || property.id === 'sunrise' ? 65 : 50) +
					Math.floor(Math.random() * 15);

				const typeRandom = Math.random();
				const roomType = typeRandom < 0.6 ? 'standard' : typeRandom < 0.85 ? 'master' : 'balcony';

				let tenantProfileId: string | null = null;
				let tenantMoveIn = '';
				let tenantDeposit = 0;
				let tenantUser: { id: string; name: string; phone: string } | null = null;

				if (status !== 'empty') {
					const phone = generatePhone();
					tenantUser = tx
						.insert(users)
						.values({
							email: `tenant_${phone}@ngochau.com`,
							phone: phone,
							passwordHash: hashPassword('123456'), // Mật khẩu mặc định của khách
							name: generateVietnameseName(),
							role: 'TENANT'
						})
						.returning()
						.get();

					const profile = tx
						.insert(tenantProfiles)
						.values({
							userId: tenantUser.id,
							idNumber: generateIdNumber(),
							moveInDate: generateMoveInDate(),
							deposit: (Math.floor(Math.random() * 2) + 1) * monthlyRent,
							notes: Math.random() > 0.85 ? 'Khách đóng tiền đúng hạn' : null
						})
						.returning()
						.get();
					tenantProfileId = profile.id;
					tenantMoveIn = profile.moveInDate;
					tenantDeposit = profile.deposit;
				}

				const debtAmount = status === 'debt' ? Math.floor(Math.random() * 2 + 1) * 1000000 : 0;

				const room = tx
					.insert(rooms)
					.values({
						propertyId: property.id,
						blockId: block.id,
						roomNumber,
						roomCode,
						roomType,
						floor,
						status,
						monthlyRent,
						area,
						debtAmount,
						tenantId: tenantProfileId
					})
					.returning()
					.get();

				// Tạo hợp đồng thuê cho phòng có khách
				if (tenantProfileId) {
					const contractEnd = new Date(now.getTime() + (Math.floor(Math.random() * 355) + 10) * 24 * 60 * 60 * 1000);
					tx.insert(contracts)
						.values({
							tenantId: tenantProfileId,
							roomId: room.id,
							startDate: tenantMoveIn,
							endDate: contractEnd.toISOString().split('T')[0],
							monthlyRent,
							deposit: tenantDeposit,
							status: 'active'
						})
						.run();
				}

				// Tạo cấu hình dịch vụ phòng (RoomServiceConfigs)
				tx.insert(roomServiceConfigs)
					.values(
						serviceList.map((service) => {
							const quantity =
								service.name === 'Gửi xe máy' ? Math.floor(Math.random() * 2) + 1 : 1;

							// 10% phòng có đơn giá Wifi tùy biến
							const isCustomWifi = service.name === 'Wifi' && Math.random() < 0.1;

							return {
								roomId: room.id,
								serviceId: service.id,
								customRate: isCustomWifi ? 80000 : null, // Wifi giảm giá riêng
								quantity
							};
						})
					)
					.run();

				// Tạo thiết bị phòng (RoomAssets)
				if (Math.random() > 0.3) {
					tx.insert(roomAssets)
						.values([
							{
								roomId: room.id,
								name: 'Máy lạnh Daikin 1.5 HP',
								code: `DAI-${property.id}-${roomNumber}`,
								status: 'good',
								notes: 'Mới lắp đặt năm 2024'
							},
							{
								roomId: room.id,
								name: 'Tủ lạnh Panasonic 180L',
								code: `PAN-${property.id}-${roomNumber}`,
								status: 'good'
							}
						])
						.run();
				}

				// Tạo chỉ số điện nước & hóa đơn
				if (tenantProfileId && tenantUser) {
					let electricityBase = Math.floor(Math.random() * 500) + 100;
					let waterBase = Math.floor(Math.random() * 30) + 5;

					const elecService = serviceList.find((s) => s.name === 'Điện')!;
					const watService = serviceList.find((s) => s.name === 'Nước')!;

					let lastReading: { prevValue: number; currValue: number } | null = null;

					for (let j = 4; j >= 0; j--) {
						const monthDate = new Date(now.getFullYear(), now.getMonth() - j, 1);
						const monthStr = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;
						const recordedAt = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 3)
							.toISOString()
							.split('T')[0];

						const electricityUsage = Math.floor(Math.random() * 100) + 50;
						const waterUsage = Math.floor(Math.random() * 6) + 2;

						const electricityCurr = electricityBase + electricityUsage;
						const waterCurr = waterBase + waterUsage;

						// Tạo Điện reading
						lastReading = tx
							.insert(meterReadings)
							.values({
								roomId: room.id,
								serviceId: elecService.id,
								month: monthStr,
								prevValue: electricityBase,
								currValue: electricityCurr,
								recordedAt
							})
							.returning()
							.get();

						// Tạo Nước reading
						tx.insert(meterReadings)
							.values({
								roomId: room.id,
								serviceId: watService.id,
								month: monthStr,
								prevValue: waterBase,
								currValue: waterCurr,
								recordedAt
							})
							.run();

						electricityBase = electricityCurr;
						waterBase = waterCurr;
					}

					// Một số phòng demo chỉ số khách tự gửi đang chờ chủ chốt
					if (Math.random() < 0.1) {
						const elecSvc = serviceList.find((s) => s.name === 'Điện')!;
						const pendingUsage = Math.floor(Math.random() * 180) + 30;
						tx.insert(meterReadings)
							.values({
								roomId: room.id,
								serviceId: elecSvc.id,
								month: currentMonthStr,
								prevValue: electricityBase,
								currValue: electricityBase + pendingUsage,
								recordedAt: todayStr,
								status: 'pending',
								submittedBy: 'TENANT',
								isAnomalous: pendingUsage > 150
							})
							.run();
					}

					// Tạo hóa đơn tháng trước
					if (lastReading) {
						const wifiService = serviceList.find((s) => s.name === 'Wifi')!;
						const racService = serviceList.find((s) => s.name === 'Rác')!;
						const xeService = serviceList.find((s) => s.name === 'Gửi xe máy')!;

						const configs = tx
							.select()
							.from(roomServiceConfigs)
							.where(eq(roomServiceConfigs.roomId, room.id))
							.all();

						const elecConfig = configs.find((c) => c.serviceId === elecService.id)!;
						const watConfig = configs.find((c) => c.serviceId === watService.id)!;
						const wifiConfig = configs.find((c) => c.serviceId === wifiService.id)!;
						const racConfig = configs.find((c) => c.serviceId === racService.id)!;
						const xeConfig = configs.find((c) => c.serviceId === xeService.id)!;

						const eRate = elecConfig.customRate ?? elecService.defaultRate;
						const wRate = watConfig.customRate ?? watService.defaultRate;
						const wifiRate = wifiConfig.customRate ?? wifiService.defaultRate;
						const racRate = racConfig.customRate ?? racService.defaultRate;
						const xeRate = xeConfig.customRate ?? xeService.defaultRate;

						const eUsage = lastReading.currValue - lastReading.prevValue;
						const wUsage = 5; // Fixed assumption for water usage in seed

						const eAmount = eUsage * eRate;
						const wAmount = wUsage * wRate;
						const serviceFees =
							wifiRate * wifiConfig.quantity +
							racRate * racConfig.quantity +
							xeRate * xeConfig.quantity;
						const totalAmount = monthlyRent + eAmount + wAmount + serviceFees;

						let invoiceStatus = 'paid';
						let paidDate: string | null = null;

						if (status === 'paid') {
							invoiceStatus = 'paid';
							paidDate = new Date(now.getFullYear(), now.getMonth(), 6).toISOString().split('T')[0];
						} else if (status === 'debt') {
							invoiceStatus = Math.random() > 0.5 ? 'overdue' : 'pending';
						}

						const invoice = tx
							.insert(invoices)
							.values({
								id: `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${globalInvoiceCounter.toString().padStart(4, '0')}`,
								roomId: room.id,
								roomNumber,
								tenantName: tenantUser.name,
								tenantPhone: tenantUser.phone,
								month: lastMonthStr,
								rentAmount: monthlyRent,
								totalAmount,
								dueDate: new Date(now.getFullYear(), now.getMonth(), 10)
									.toISOString()
									.split('T')[0],
								paidDate,
								paidAmount: invoiceStatus === 'paid' ? totalAmount : 0,
								status: invoiceStatus,
								createdAt: new Date(now.getFullYear(), now.getMonth(), 1)
									.toISOString()
									.split('T')[0]
							})
							.returning()
							.get();

						// Tạo các dòng chi tiết hóa đơn (InvoiceItems)
						tx.insert(invoiceItems)
							.values([
								{
									invoiceId: invoice.id,
									name: 'Tiền phòng',
									amount: monthlyRent,
									details: `Tháng ${lastMonthStr.split('-')[1]}`
								},
								{
									invoiceId: invoice.id,
									name: 'Tiền điện',
									amount: eAmount,
									details: `Chỉ số: ${lastReading.prevValue} -> ${lastReading.currValue} (${eUsage} kWh) x ${eRate}đ`
								},
								{
									invoiceId: invoice.id,
									name: 'Tiền nước',
									amount: wAmount,
									details: `${wUsage} m³ x ${wRate}đ`
								},
								{
									invoiceId: invoice.id,
									name: 'Phí dịch vụ (Wifi, Rác)',
									amount: wifiRate + racRate,
									details: 'Cố định hàng tháng'
								},
								{
									invoiceId: invoice.id,
									name: 'Phí gửi xe máy',
									amount: xeRate * xeConfig.quantity,
									details: `${xeConfig.quantity} xe x ${xeRate}đ`
								}
							])
							.run();

						globalInvoiceCounter++;
					}
				}
			}
		}

		// Tạo các lời nhắn đặc biệt từ khách thuê (SpecialNotes)
		const someTenants = tx.select().from(tenantProfiles).limit(3).all();
		someTenants.forEach((tenant, idx) => {
			tx.insert(specialNotes)
				.values({
					tenantId: tenant.id,
					content: `Khách gửi lời nhắn số ${idx + 1}: Vui lòng xuất hóa đơn trước ngày mùng 2 hàng tháng giúp em để công ty thanh toán.`,
					isRead: false
				})
				.run();
		});

		// Tạo yêu cầu sửa chữa (MaintenanceRequests)
		const firstTenants = tx.select().from(tenantProfiles).limit(2).all();

		if (firstTenants.length >= 2) {
			const firstRoom = tx.select().from(rooms).where(eq(rooms.tenantId, firstTenants[0].id)).get();
			const secondRoom = tx
				.select()
				.from(rooms)
				.where(eq(rooms.tenantId, firstTenants[1].id))
				.get();

			tx.insert(maintenanceRequests)
				.values({
					tenantId: firstTenants[0].id,
					roomNumber: firstRoom?.roomNumber || '101',
					buildingName: 'Hoàng Anh Gia Lai 3',
					category: 'plumbing',
					title: 'Bồn cầu toilet bị nghẹt',
					description: 'Nước xả không trôi từ tối qua, cần thợ qua thông nghẹt gấp.',
					status: 'pending',
					priority: 'important'
				})
				.run();

			tx.insert(maintenanceRequests)
				.values({
					tenantId: firstTenants[1].id,
					roomNumber: secondRoom?.roomNumber || '205',
					buildingName: 'Phú Hoàng Anh',
					category: 'electrical',
					title: 'Máy lạnh chảy nước và không lạnh',
					description:
						'Máy lạnh phòng ngủ có tiếng kêu to, bị chảy nước rỉ xuống giường và gió thổi ra không mát.',
					status: 'in_progress',
					priority: 'important',
					response: 'Đã ghi nhận, thợ điện lạnh sẽ qua bảo trì trong chiều nay.',
					assignedToId: staffProfile.id
				})
				.run();
		}

		// Tạo thông báo ghim (Announcements)
		tx.insert(announcements)
			.values([
				{
					senderId: landlordUser.id,
					title: 'Thông báo đóng tiền nhà tháng 6',
					content:
						'Nhắc nhở toàn bộ cư dân đóng tiền trước ngày mùng 10 hàng tháng để tránh phí phạt quá hạn. Xin cảm ơn.',
					isImportant: true,
					targetType: 'ALL'
				},
				{
					senderId: landlordUser.id,
					title: 'Bảo trì hệ thống thang máy',
					content:
						'Thang máy Block A sẽ tạm ngưng hoạt động từ 9h đến 12h ngày mai để thực hiện bảo trì định kỳ.',
					isImportant: false,
					targetType: 'PROPERTY',
					targetId: 'hagl3'
				}
			])
			.run();

		// Lời nhắn từ chủ nhà gửi khách (chiều ngược lại của SpecialNote)
		const noteTenants = tx.select().from(tenantProfiles).limit(2).all();
		if (noteTenants.length > 0) {
			tx.insert(specialNotes)
				.values({
					tenantId: noteTenants[0].id,
					content: 'Chủ nhà nhắn: Em nhớ đóng cửa ban công khi mưa giúp anh, tuần trước nước tràn vào hành lang.',
					sender: 'LANDLORD',
					isRead: false
				})
				.run();

			// Hội thoại chat mẫu giữa chủ nhà và khách đầu tiên
			const convId = `${landlordProfile.id}_${noteTenants[0].id}`;
			tx.insert(messages)
				.values([
					{
						conversationId: convId,
						senderId: noteTenants[0].userId,
						content: 'Anh ơi, tháng này em chuyển khoản trễ 2 ngày được không ạ?'
					},
					{
						conversationId: convId,
						senderId: landlordUser.id,
						content: 'Được em, nhớ chuyển trước ngày 12 nhé.'
					},
					{
						conversationId: convId,
						senderId: noteTenants[0].userId,
						content: 'Dạ em cảm ơn anh nhiều ạ!'
					}
				])
				.run();
		}

		// Chi phí vận hành 3 tháng gần nhất (demo phân tích dòng tiền)
		const expenseTemplates = [
			{ category: 'electricity', description: 'Tiền điện khu vực chung (EVN)', amount: 4500000 },
			{ category: 'water', description: 'Tiền nước tổng (cấp nước)', amount: 6200000 },
			{ category: 'internet', description: 'Internet FPT 5 đường truyền', amount: 2750000 },
			{ category: 'cleaning', description: 'Vệ sinh khu vực chung', amount: 3000000 },
			{ category: 'maintenance', description: 'Sửa chữa lặt vặt trong tháng', amount: 1800000 }
		];
		for (let m = 2; m >= 0; m--) {
			const expDate = new Date(now.getFullYear(), now.getMonth() - m, 8);
			const expDateStr = expDate.toISOString().split('T')[0];
			for (const t of expenseTemplates) {
				tx.insert(expenses)
					.values({
						landlordId: landlordProfile.id,
						propertyId: 'hagl3',
						category: t.category,
						description: t.description,
						amount: Math.round(t.amount * (0.85 + Math.random() * 0.3)),
						date: expDateStr
					})
					.run();
			}
		}
	});

	console.log('Hoàn thành Seeding cơ sở dữ liệu SaaS Multi-Tenant thành công!');
}

try {
	main();
} catch (e) {
	console.error(e);
	process.exit(1);
}
