import { json } from '@sveltejs/kit';
import { errorMessage } from '$lib/server/api';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { rooms, invoices, invoiceItems, meterReadings } from '$lib/server/db/schema';
import { and, eq, isNotNull, sql } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { landlordId, propertyId, month, dueDate, readings } = body; // readings: { [roomId]: { [serviceId]: { prevValue, currValue } } }

		if (!landlordId || !propertyId || !month || !dueDate || !readings) {
			return json({ error: 'Missing required parameters' }, { status: 400 });
		}

		// Fetch all occupied rooms for this property
		const occupiedRooms = await db.query.rooms.findMany({
			where: and(eq(rooms.propertyId, propertyId), isNotNull(rooms.tenantId)),
			with: {
				tenant: { with: { user: true } },
				services: { with: { service: true } }
			}
		});

		if (occupiedRooms.length === 0) {
			return json(
				{ error: 'Không tìm thấy phòng có khách đang ở trong tòa nhà này' },
				{ status: 400 }
			);
		}

		const today = new Date().toISOString().split('T')[0];

		const createdInvoices = db.transaction((tx) => {
			const results = [];

			for (const room of occupiedRooms) {
				if (!room.tenant) continue;

				const tenantName = room.tenant.user.name;
				const tenantPhone = room.tenant.user.phone;
				const roomReadings = readings[room.id] || {};

				const items = [];
				let totalServicesAmount = 0;

				// Add room rent item
				items.push({
					name: 'Tiền phòng',
					amount: room.monthlyRent,
					details: `Tiền thuê phòng tháng ${month.split('-')[1]}/${month.split('-')[0]}`
				});

				// Loop through each service configuration for this room
				for (const config of room.services) {
					if (!config.service.isActive) continue;

					const rate = config.customRate !== null ? config.customRate : config.service.defaultRate;
					let amount = 0;
					let details = '';

					if (config.service.type === 'METERED') {
						const serviceReading = roomReadings[config.serviceId] || { prevValue: 0, currValue: 0 };
						const prev = Number(serviceReading.prevValue) || 0;
						const curr = Number(serviceReading.currValue) || 0;
						const usage = curr - prev;
						amount = usage * rate;
						details = `Chỉ số: ${prev} -> ${curr} (${usage} ${config.service.name === 'Điện' ? 'kWh' : 'm³'}) x ${new Intl.NumberFormat('vi-VN').format(rate)}đ`;

						// Record this meter reading
						tx.insert(meterReadings)
							.values({
								roomId: room.id,
								serviceId: config.serviceId,
								month,
								prevValue: prev,
								currValue: curr,
								recordedAt: today
							})
							.run();
					} else if (config.service.type === 'FLAT_ROOM') {
						amount = rate * config.quantity;
						details = `Phí cố định x ${config.quantity} phòng`;
					} else if (config.service.type === 'FLAT_PERSON') {
						amount = rate * config.quantity;
						details = `Đơn giá: ${new Intl.NumberFormat('vi-VN').format(rate)}đ x ${config.quantity} người`;
					} else if (config.service.type === 'FLAT_VEHICLE') {
						amount = rate * config.quantity;
						details = `Đơn giá: ${new Intl.NumberFormat('vi-VN').format(rate)}đ x ${config.quantity} xe`;
					}

					if (amount > 0) {
						items.push({
							name: config.service.name,
							amount,
							details
						});
						totalServicesAmount += amount;
					}
				}

				const totalAmount = room.monthlyRent + totalServicesAmount;

				// Generate Invoice ID
				const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
				const invoiceId = `INV-${month.replace('-', '')}-${randomHex}`;

				// Create Invoice
				const inv = tx
					.insert(invoices)
					.values({
						id: invoiceId,
						roomId: room.id,
						roomNumber: room.roomNumber,
						tenantName,
						tenantPhone,
						month,
						rentAmount: room.monthlyRent,
						totalAmount,
						dueDate,
						status: 'pending',
						paidAmount: 0,
						createdAt: today,
						notes: `Hóa đơn tự động tháng ${month}`
					})
					.returning()
					.get();

				// Create Invoice Items
				tx.insert(invoiceItems)
					.values(items.map((item) => ({ ...item, invoiceId: inv.id })))
					.run();

				// Increment Room outstanding debt
				tx.update(rooms)
					.set({
						status: 'debt',
						debtAmount: sql`coalesce(${rooms.debtAmount}, 0) + ${totalAmount}`
					})
					.where(eq(rooms.id, room.id))
					.run();

				results.push(inv);
			}

			return results;
		});

		return json({ success: true, count: createdInvoices.length, invoices: createdInvoices });
	} catch (error) {
		return json({ error: errorMessage(error) }, { status: 500 });
	}
};
