import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to hash password using SHA-256
function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Vietnamese names for mock data
const vietnameseFirstNames = [
  'An', 'Bình', 'Cường', 'Dung', 'Em', 'Phương', 'Giang', 'Hà',
  'Hùng', 'Kim', 'Long', 'Mai', 'Nam', 'Oanh', 'Phúc', 'Quỳnh',
  'Sơn', 'Thanh', 'Tùng', 'Uyên', 'Vinh', 'Xuyến', 'Yên', 'Lan',
  'Minh', 'Ngọc', 'Quang', 'Thảo', 'Tuấn', 'Vân', 'Xuân', 'Hương',
  'Đức', 'Linh', 'Hải', 'Trang', 'Khoa', 'Nhung', 'Hiếu', 'Thủy'
];

const vietnameseLastNames = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi',
  'Đỗ', 'Ngô', 'Dương', 'Lý', 'Vũ', 'Phan', 'Trịnh', 'Đinh',
  'Hồ', 'Tô', 'Lương', 'Mai', 'Chu', 'Cao', 'Tạ', 'La'
];

const vietnameseMiddleNames = [
  'Văn', 'Thị', 'Hữu', 'Ngọc', 'Minh', 'Thanh', 'Hoàng', 'Kim',
  'Quốc', 'Anh', 'Đức', 'Xuân', 'Thu', 'Hồng', 'Bảo', 'Phương'
];

const generateVietnameseName = (): string => {
  const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
  const middleName = vietnameseMiddleNames[Math.floor(Math.random() * vietnameseMiddleNames.length)];
  const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
  return `${lastName} ${middleName} ${firstName}`;
};

const generatePhone = (): string => {
  const prefixes = ['090', '091', '093', '094', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039', '070', '076', '077', '078', '079', '081', '082', '083', '084', '085'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
};

const generateIdNumber = (): string => {
  const provinceCode = Math.floor(Math.random() * 96).toString().padStart(3, '0');
  const genderYear = Math.floor(Math.random() * 2) + (Math.random() > 0.5 ? 0 : 1);
  const yearCode = genderYear.toString();
  const randomPart = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
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
    address: '121 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM',
  },
  {
    id: 'pha',
    name: 'Phú Hoàng Anh',
    shortName: 'Phú Hoàng Anh',
    address: '1 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM',
  },
  {
    id: 'ssr',
    name: 'Saigon South Residences',
    shortName: 'SSR',
    address: '63 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM',
  },
  {
    id: 'sunrise',
    name: 'Sunrise Riverside',
    shortName: 'Sunrise',
    address: '60 Nguyễn Hữu Thọ, Nhà Bè, TP.HCM',
  },
  {
    id: 'mp6',
    name: 'Mizuki Park 6',
    shortName: 'MP6',
    address: 'Nguyễn Văn Linh, Bình Chánh, TP.HCM',
  }
];

async function main() {
  console.log('Bắt đầu dọn dẹp database...');
  await prisma.message.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.roomAsset.deleteMany();
  await prisma.specialNote.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.meterReading.deleteMany();
  await prisma.roomServiceConfig.deleteMany();
  await prisma.room.deleteMany();
  await prisma.service.deleteMany();
  await prisma.block.deleteMany();
  await prisma.property.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.landlordProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Khởi tạo Super Admin...');
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@ngochau.com',
      phone: '0999999999',
      passwordHash: hashPassword('admin'),
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('Khởi tạo Landlord (Chủ trọ Ngọc Hậu)...');
  const landlordUser = await prisma.user.create({
    data: {
      email: 'ngochau@gmail.com',
      phone: '0901234567',
      passwordHash: hashPassword('password'),
      name: 'Nguyễn Văn Hậu',
      role: 'LANDLORD'
    }
  });

  const landlordProfile = await prisma.landlordProfile.create({
    data: {
      userId: landlordUser.id,
      companyName: 'Nhà Trọ Ngọc Hậu',
      bankName: 'Vietcombank',
      bankCode: 'VCB',
      accountNumber: '1234567890',
      accountName: 'NGUYEN VAN HAU',
      bankBranch: 'Chi nhánh TP.HCM'
    }
  });

  console.log('Khởi tạo Staff (Nhân viên quản lý)...');
  const staffUser = await prisma.user.create({
    data: {
      email: 'nhanvien@nhatro.com',
      phone: '0987654321',
      passwordHash: hashPassword('staff'),
      name: 'Trần Thị B',
      role: 'STAFF'
    }
  });

  const staffProfile = await prisma.staffProfile.create({
    data: {
      userId: staffUser.id,
      landlordId: landlordProfile.id
    }
  });

  console.log('Tạo Dịch vụ động (Dynamic Services)...');
  const services = [
    await prisma.service.create({
      data: { landlordId: landlordProfile.id, name: 'Điện', type: 'METERED', defaultRate: 3500 }
    }),
    await prisma.service.create({
      data: { landlordId: landlordProfile.id, name: 'Nước', type: 'METERED', defaultRate: 15000 }
    }),
    await prisma.service.create({
      data: { landlordId: landlordProfile.id, name: 'Wifi', type: 'FLAT_ROOM', defaultRate: 100000 }
    }),
    await prisma.service.create({
      data: { landlordId: landlordProfile.id, name: 'Rác', type: 'FLAT_ROOM', defaultRate: 30000 }
    }),
    await prisma.service.create({
      data: { landlordId: landlordProfile.id, name: 'Gửi xe máy', type: 'FLAT_VEHICLE', defaultRate: 100000 }
    })
  ];

  console.log('Tạo tòa nhà (Properties) và các Block...');
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;

  let globalInvoiceCounter = 1;

  for (const propData of propertiesData) {
    const property = await prisma.property.create({
      data: {
        id: propData.id,
        landlordId: landlordProfile.id,
        name: propData.name,
        shortName: propData.shortName,
        address: propData.address
      }
    });

    // Tạo các Block/Tầng cho tòa nhà
    const totalRooms = propData.id === 'mp6' ? 8 : 40; // Giới hạn số phòng lại một chút để seed chạy nhanh hơn
    const floors = propData.id === 'mp6' ? 3 : 5;
    const roomsPerFloor = Math.ceil(totalRooms / floors);

    const blocks: any[] = [];
    for (let f = 1; f <= floors; f++) {
      const block = await prisma.block.create({
        data: {
          propertyId: property.id,
          name: `Tầng ${f}`
        }
      });
      blocks.push(block);
    }

    for (let i = 1; i <= totalRooms; i++) {
      const floor = Math.ceil(i / roomsPerFloor);
      const roomOnFloor = ((i - 1) % roomsPerFloor) + 1;
      const block = blocks[floor - 1];

      let roomNumber = `${floor}${roomOnFloor.toString().padStart(2, '0')}`;
      let roomCode = property.id === 'mp6' ? `MP-${floor}-${roomOnFloor.toString().padStart(2, '0')}` : undefined;

      const randomVal = Math.random();
      let status: 'empty' | 'paid' | 'debt' = 'empty';
      if (randomVal >= 0.15 && randomVal < 0.80) {
        status = 'paid';
      } else if (randomVal >= 0.80) {
        status = 'debt';
      }

      // Giá thuê
      const baseRent = property.id === 'ssr' || property.id === 'sunrise' ? 8000000 : 5000000;
      const floorBonus = (floor - 1) * 300000;
      const monthlyRent = baseRent + floorBonus + Math.floor(Math.random() * 2) * 1000000;

      const area = (property.id === 'ssr' || property.id === 'sunrise' ? 65 : 50) + Math.floor(Math.random() * 15);

      const typeRandom = Math.random();
      const roomType = typeRandom < 0.60 ? 'standard' : typeRandom < 0.85 ? 'master' : 'balcony';

      let tenantProfileId: string | undefined = undefined;
      let tenantUser: any = null;

      if (status !== 'empty') {
        const phone = generatePhone();
        tenantUser = await prisma.user.create({
          data: {
            email: `tenant_${phone}@ngochau.com`,
            phone: phone,
            passwordHash: hashPassword('123456'), // Mật khẩu mặc định của khách
            name: generateVietnameseName(),
            role: 'TENANT'
          }
        });

        const profile = await prisma.tenantProfile.create({
          data: {
            userId: tenantUser.id,
            idNumber: generateIdNumber(),
            moveInDate: generateMoveInDate(),
            deposit: (Math.floor(Math.random() * 2) + 1) * monthlyRent,
            notes: Math.random() > 0.85 ? 'Khách đóng tiền đúng hạn' : null
          }
        });
        tenantProfileId = profile.id;
      }

      const debtAmount = status === 'debt' ? Math.floor(Math.random() * 2 + 1) * 1000000 : 0;

      const room = await prisma.room.create({
        data: {
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
          tenantId: tenantProfileId || null
        }
      });

      // Tạo cấu hình dịch vụ phòng (RoomServiceConfigs)
      for (const service of services) {
        const quantity = service.name === 'Gửi xe máy' ? (Math.floor(Math.random() * 2) + 1) : 1;
        
        // 10% phòng có đơn giá Wifi tùy biến
        const isCustomWifi = service.name === 'Wifi' && Math.random() < 0.1;

        await prisma.roomServiceConfig.create({
          data: {
            roomId: room.id,
            serviceId: service.id,
            customRate: isCustomWifi ? 80000 : null, // Wifi giảm giá riêng
            quantity
          }
        });
      }

      // Tạo thiết bị phòng (RoomAssets)
      if (Math.random() > 0.3) {
        await prisma.roomAsset.create({
          data: {
            roomId: room.id,
            name: 'Máy lạnh Daikin 1.5 HP',
            code: `DAI-${property.id}-${roomNumber}`,
            status: 'good',
            notes: 'Mới lắp đặt năm 2024'
          }
        });
        await prisma.roomAsset.create({
          data: {
            roomId: room.id,
            name: 'Tủ lạnh Panasonic 180L',
            code: `PAN-${property.id}-${roomNumber}`,
            status: 'good'
          }
        });
      }

      // Tạo chỉ số điện nước & hóa đơn
      if (tenantProfileId && tenantUser) {
        let electricityBase = Math.floor(Math.random() * 500) + 100;
        let waterBase = Math.floor(Math.random() * 30) + 5;
        
        let lastReading: any = null;

        for (let j = 4; j >= 0; j--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - j, 1);
          const monthStr = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;

          const electricityUsage = Math.floor(Math.random() * 100) + 50;
          const waterUsage = Math.floor(Math.random() * 6) + 2;

          const electricityCurr = electricityBase + electricityUsage;
          const waterCurr = waterBase + waterUsage;

          // Tạo Điện reading
          const elecService = services.find(s => s.name === 'Điện')!;
          lastReading = await prisma.meterReading.create({
            data: {
              roomId: room.id,
              serviceId: elecService.id,
              month: monthStr,
              prevValue: electricityBase,
              currValue: electricityCurr,
              recordedAt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 3).toISOString().split('T')[0]
            }
          });

          // Tạo Nước reading
          const watService = services.find(s => s.name === 'Nước')!;
          await prisma.meterReading.create({
            data: {
              roomId: room.id,
              serviceId: watService.id,
              month: monthStr,
              prevValue: waterBase,
              currValue: waterCurr,
              recordedAt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 3).toISOString().split('T')[0]
            }
          });

          electricityBase = electricityCurr;
          waterBase = waterCurr;
        }

        // Tạo hóa đơn tháng trước
        if (lastReading) {
          const elecService = services.find(s => s.name === 'Điện')!;
          const watService = services.find(s => s.name === 'Nước')!;
          const wifiService = services.find(s => s.name === 'Wifi')!;
          const racService = services.find(s => s.name === 'Rác')!;
          const xeService = services.find(s => s.name === 'Gửi xe máy')!;

          const configs = await prisma.roomServiceConfig.findMany({
            where: { roomId: room.id }
          });

          const elecConfig = configs.find(c => c.serviceId === elecService.id)!;
          const watConfig = configs.find(c => c.serviceId === watService.id)!;
          const wifiConfig = configs.find(c => c.serviceId === wifiService.id)!;
          const racConfig = configs.find(c => c.serviceId === racService.id)!;
          const xeConfig = configs.find(c => c.serviceId === xeService.id)!;

          const eRate = elecConfig.customRate ?? elecService.defaultRate;
          const wRate = watConfig.customRate ?? watService.defaultRate;
          const wifiRate = wifiConfig.customRate ?? wifiService.defaultRate;
          const racRate = racConfig.customRate ?? racService.defaultRate;
          const xeRate = xeConfig.customRate ?? xeService.defaultRate;

          const eUsage = lastReading.currValue - lastReading.prevValue;
          const wUsage = 5; // Fixed assumption for water usage in seed

          const eAmount = eUsage * eRate;
          const wAmount = wUsage * wRate;
          const serviceFees = (wifiRate * wifiConfig.quantity) + (racRate * racConfig.quantity) + (xeRate * xeConfig.quantity);
          const totalAmount = monthlyRent + eAmount + wAmount + serviceFees;

          let invoiceStatus = 'paid';
          let paidDate: string | undefined = undefined;

          if (status === 'paid') {
            invoiceStatus = 'paid';
            paidDate = new Date(now.getFullYear(), now.getMonth(), 6).toISOString().split('T')[0];
          } else if (status === 'debt') {
            invoiceStatus = Math.random() > 0.5 ? 'overdue' : 'pending';
          }

          const invoice = await prisma.invoice.create({
            data: {
              id: `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${globalInvoiceCounter.toString().padStart(4, '0')}`,
              roomId: room.id,
              roomNumber,
              tenantName: tenantUser.name,
              tenantPhone: tenantUser.phone,
              month: lastMonthStr,
              rentAmount: monthlyRent,
              totalAmount,
              dueDate: new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split('T')[0],
              paidDate: paidDate || null,
              paidAmount: invoiceStatus === 'paid' ? totalAmount : 0,
              status: invoiceStatus,
              createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
            }
          });

          // Tạo các dòng chi tiết hóa đơn (InvoiceItems)
          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              name: 'Tiền phòng',
              amount: monthlyRent,
              details: `Tháng ${lastMonthStr.split('-')[1]}`
            }
          });

          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              name: 'Tiền điện',
              amount: eAmount,
              details: `Chỉ số: ${lastReading.prevValue} -> ${lastReading.currValue} (${eUsage} kWh) x ${eRate}đ`
            }
          });

          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              name: 'Tiền nước',
              amount: wAmount,
              details: `${wUsage} m³ x ${wRate}đ`
            }
          });

          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              name: 'Phí dịch vụ (Wifi, Rác)',
              amount: wifiRate + racRate,
              details: 'Cố định hàng tháng'
            }
          });

          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              name: 'Phí gửi xe máy',
              amount: xeRate * xeConfig.quantity,
              details: `${xeConfig.quantity} xe x ${xeRate}đ`
            }
          });

          globalInvoiceCounter++;
        }
      }
    }
  }

  // Tạo các lời nhắn đặc biệt từ khách thuê (SpecialNotes)
  const tenantProfiles = await prisma.tenantProfile.findMany({ take: 3 });
  for (let idx = 0; idx < tenantProfiles.length; idx++) {
    await prisma.specialNote.create({
      data: {
        tenantId: tenantProfiles[idx].id,
        content: `Khách gửi lời nhắn số ${idx + 1}: Vui lòng xuất hóa đơn trước ngày mùng 2 hàng tháng giúp em để công ty thanh toán.`,
        isRead: false
      }
    });
  }

  // Tạo yêu cầu sửa chữa (MaintenanceRequests)
  const allTenants = await prisma.tenantProfile.findMany({
    include: { user: true, rooms: true }
  });

  if (allTenants.length >= 2) {
    await prisma.maintenanceRequest.create({
      data: {
        tenantId: allTenants[0].id,
        roomNumber: allTenants[0].rooms[0]?.roomNumber || '101',
        buildingName: 'Hoàng Anh Gia Lai 3',
        category: 'plumbing',
        title: 'Bồn cầu toilet bị nghẹt',
        description: 'Nước xả không trôi từ tối qua, cần thợ qua thông nghẹt gấp.',
        status: 'pending',
        priority: 'important'
      }
    });

    await prisma.maintenanceRequest.create({
      data: {
        tenantId: allTenants[1].id,
        roomNumber: allTenants[1].rooms[0]?.roomNumber || '205',
        buildingName: 'Phú Hoàng Anh',
        category: 'electrical',
        title: 'Máy lạnh chảy nước và không lạnh',
        description: 'Máy lạnh phòng ngủ có tiếng kêu to, bị chảy nước rỉ xuống giường và gió thổi ra không mát.',
        status: 'in_progress',
        priority: 'important',
        response: 'Đã ghi nhận, thợ điện lạnh sẽ qua bảo trì trong chiều nay.',
        assignedToId: staffProfile.id
      }
    });
  }

  // Tạo thông báo ghim (Announcements)
  await prisma.announcement.create({
    data: {
      senderId: landlordUser.id,
      title: 'Thông báo đóng tiền nhà tháng 6',
      content: 'Nhắc nhở toàn bộ cư dân đóng tiền trước ngày mùng 10 hàng tháng để tránh phí phạt quá hạn. Xin cảm ơn.',
      isImportant: true,
      targetType: 'ALL'
    }
  });

  await prisma.announcement.create({
    data: {
      senderId: landlordUser.id,
      title: 'Bảo trì hệ thống thang máy',
      content: 'Thang máy Block A sẽ tạm ngưng hoạt động từ 9h đến 12h ngày mai để thực hiện bảo trì định kỳ.',
      isImportant: false,
      targetType: 'PROPERTY',
      targetId: 'hagl3'
    }
  });

  console.log('Hoàn thành Seeding cơ sở dữ liệu SaaS Multi-Tenant thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
