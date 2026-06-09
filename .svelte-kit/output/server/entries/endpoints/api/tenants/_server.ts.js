import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
import crypto from "crypto";
//#region src/routes/api/tenants/+server.ts
function hashPassword(password) {
	return crypto.createHash("sha256").update(password).digest("hex");
}
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		if (!landlordId) return json({ error: "Missing landlord ID" }, { status: 400 });
		return json(await db.tenantProfile.findMany({
			where: { rooms: { some: { property: { landlordId } } } },
			include: {
				user: { select: {
					id: true,
					name: true,
					email: true,
					phone: true
				} },
				rooms: { include: {
					property: true,
					block: true
				} }
			},
			orderBy: { user: { name: "asc" } }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { email, phone, password, name, roomId, idNumber, moveInDate, deposit, notes, initialElectricity, initialWater } = await request.json();
		if (!email || !phone || !password || !name || !roomId || !idNumber || !moveInDate || deposit === void 0) return json({ error: "Thiếu thông tin khách thuê bắt buộc" }, { status: 400 });
		let user = await db.user.findFirst({ where: { OR: [{ email }, { phone }] } });
		const tenant = await db.$transaction(async (tx) => {
			if (!user) user = await tx.user.create({ data: {
				email,
				phone,
				passwordHash: hashPassword(password),
				name,
				role: "TENANT"
			} });
			let tenantProfile = await tx.tenantProfile.findUnique({ where: { userId: user.id } });
			if (!tenantProfile) tenantProfile = await tx.tenantProfile.create({ data: {
				userId: user.id,
				idNumber,
				moveInDate,
				deposit: Number(deposit),
				notes
			} });
			else tenantProfile = await tx.tenantProfile.update({
				where: { id: tenantProfile.id },
				data: {
					idNumber,
					moveInDate,
					deposit: Number(deposit),
					notes
				}
			});
			const room = await tx.room.update({
				where: { id: roomId },
				data: {
					tenantId: tenantProfile.id,
					status: "paid",
					debtAmount: 0
				},
				include: { property: true }
			});
			const checkInMonth = moveInDate.slice(0, 7);
			const electricityService = await tx.service.findFirst({ where: {
				landlordId: room.property.landlordId,
				name: { contains: "Điện" }
			} });
			const waterService = await tx.service.findFirst({ where: {
				landlordId: room.property.landlordId,
				name: { contains: "Nước" }
			} });
			if (electricityService && initialElectricity !== void 0) await tx.meterReading.create({ data: {
				roomId: room.id,
				serviceId: electricityService.id,
				month: checkInMonth,
				prevValue: Number(initialElectricity),
				currValue: Number(initialElectricity),
				recordedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
			} });
			if (waterService && initialWater !== void 0) await tx.meterReading.create({ data: {
				roomId: room.id,
				serviceId: waterService.id,
				month: checkInMonth,
				prevValue: Number(initialWater),
				currValue: Number(initialWater),
				recordedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
			} });
			return tenantProfile;
		});
		return json(await db.tenantProfile.findUnique({
			where: { id: tenant.id },
			include: {
				user: true,
				rooms: { include: { property: true } }
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { id, idNumber, idFrontImage, idBackImage, vehicleImage, checkInImage } = await request.json();
		if (!id) return json({ error: "Missing tenant profile ID" }, { status: 400 });
		return json(await db.tenantProfile.update({
			where: { id },
			data: {
				idNumber: idNumber !== void 0 ? idNumber : void 0,
				idFrontImage: idFrontImage !== void 0 ? idFrontImage : void 0,
				idBackImage: idBackImage !== void 0 ? idBackImage : void 0,
				vehicleImage: vehicleImage !== void 0 ? vehicleImage : void 0,
				checkInImage: checkInImage !== void 0 ? checkInImage : void 0
			},
			include: {
				user: true,
				rooms: { include: { property: true } }
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { GET, POST, PUT };
