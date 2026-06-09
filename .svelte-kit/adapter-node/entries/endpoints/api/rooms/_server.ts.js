import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/rooms/+server.ts
var GET = async ({ url }) => {
	try {
		const propertyId = url.searchParams.get("propertyId");
		const blockId = url.searchParams.get("blockId");
		const tenantId = url.searchParams.get("tenantId");
		const filter = {};
		if (propertyId) filter.propertyId = propertyId;
		if (blockId && blockId !== "all") filter.blockId = blockId;
		if (tenantId) filter.tenantId = tenantId;
		return json(await db.room.findMany({
			where: filter,
			include: {
				property: true,
				tenant: { include: { user: true } },
				services: { include: { service: true } },
				assets: true,
				meterReadings: { orderBy: { month: "desc" } }
			},
			orderBy: { roomNumber: "asc" }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { propertyId, blockId, roomNumber, roomCode, roomType, floor, monthlyRent, area } = await request.json();
		if (!propertyId || !roomNumber || !roomType || !monthlyRent) return json({ error: "Missing required room fields" }, { status: 400 });
		if (await db.room.findFirst({ where: {
			propertyId,
			roomNumber
		} })) return json({ error: "Số phòng này đã tồn tại trong tòa nhà này" }, { status: 400 });
		const room = await db.$transaction(async (tx) => {
			const r = await tx.room.create({ data: {
				propertyId,
				blockId: blockId || null,
				roomNumber,
				roomCode: roomCode || null,
				roomType,
				floor: floor ? Number(floor) : null,
				status: "empty",
				monthlyRent: Number(monthlyRent),
				area: area ? Number(area) : null,
				debtAmount: 0
			} });
			const property = await tx.property.findUnique({
				where: { id: propertyId },
				select: { landlordId: true }
			});
			if (property) {
				const services = await tx.service.findMany({ where: {
					landlordId: property.landlordId,
					isActive: true
				} });
				for (const service of services) await tx.roomServiceConfig.create({ data: {
					roomId: r.id,
					serviceId: service.id,
					customRate: null,
					quantity: 1
				} });
			}
			return r;
		});
		return json(await db.room.findUnique({
			where: { id: room.id },
			include: {
				tenant: { include: { user: true } },
				services: { include: { service: true } },
				assets: true,
				meterReadings: true
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { id, action, ...data } = await request.json();
		if (!id) return json({ error: "Missing room ID" }, { status: 400 });
		if (action === "updateMeters") {
			const { serviceId, month, prevValue, currValue, photoUrl } = data;
			if (!serviceId || !month || currValue === void 0 || prevValue === void 0) return json({ error: "Missing meter reading parameters" }, { status: 400 });
			const existingReading = await db.meterReading.findFirst({ where: {
				roomId: id,
				serviceId,
				month
			} });
			if (existingReading) await db.meterReading.update({
				where: { id: existingReading.id },
				data: {
					prevValue: Number(prevValue),
					currValue: Number(currValue),
					photoUrl: photoUrl || void 0,
					recordedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
				}
			});
			else await db.meterReading.create({ data: {
				roomId: id,
				serviceId,
				month,
				prevValue: Number(prevValue),
				currValue: Number(currValue),
				photoUrl: photoUrl || null,
				recordedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
			} });
		} else if (action === "updateAsset") {
			const { assetId, name, code, status, notes } = data;
			if (!name) return json({ error: "Missing asset name" }, { status: 400 });
			if (assetId) await db.roomAsset.update({
				where: { id: assetId },
				data: {
					name,
					code,
					status,
					notes
				}
			});
			else await db.roomAsset.create({ data: {
				roomId: id,
				name,
				code,
				status,
				notes
			} });
		} else if (action === "deleteAsset") {
			const { assetId } = data;
			if (assetId) await db.roomAsset.delete({ where: { id: assetId } });
		} else if (action === "updateServiceConfig") {
			const { configs } = data;
			if (configs && Array.isArray(configs)) for (const config of configs) {
				const existingConfig = await db.roomServiceConfig.findFirst({ where: {
					roomId: id,
					serviceId: config.serviceId
				} });
				if (existingConfig) await db.roomServiceConfig.update({
					where: { id: existingConfig.id },
					data: {
						customRate: config.customRate === "" || config.customRate === null ? null : Number(config.customRate),
						quantity: Number(config.quantity) || 1
					}
				});
			}
		} else if (action === "checkout") await db.room.update({
			where: { id },
			data: {
				status: "empty",
				tenantId: null,
				debtAmount: 0
			}
		});
		else {
			const updateData = {};
			if (data.roomNumber !== void 0) updateData.roomNumber = data.roomNumber;
			if (data.roomCode !== void 0) updateData.roomCode = data.roomCode;
			if (data.roomType !== void 0) updateData.roomType = data.roomType;
			if (data.floor !== void 0) updateData.floor = Number(data.floor);
			if (data.monthlyRent !== void 0) updateData.monthlyRent = Number(data.monthlyRent);
			if (data.area !== void 0) updateData.area = Number(data.area);
			if (data.status !== void 0) updateData.status = data.status;
			if (data.debtAmount !== void 0) updateData.debtAmount = Number(data.debtAmount);
			if (data.blockId !== void 0) updateData.blockId = data.blockId;
			await db.room.update({
				where: { id },
				data: updateData
			});
		}
		return json(await db.room.findUnique({
			where: { id },
			include: {
				tenant: { include: { user: true } },
				services: { include: { service: true } },
				assets: true,
				meterReadings: { orderBy: { month: "desc" } }
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var DELETE = async ({ url }) => {
	try {
		const id = url.searchParams.get("id");
		if (!id) return json({ error: "Missing room ID" }, { status: 400 });
		await db.room.delete({ where: { id } });
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { DELETE, GET, POST, PUT };
