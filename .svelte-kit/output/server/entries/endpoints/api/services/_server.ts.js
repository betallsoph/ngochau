import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/services/+server.ts
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		if (!landlordId) return json({ error: "Missing landlord ID" }, { status: 400 });
		return json(await db.service.findMany({
			where: { landlordId },
			orderBy: { name: "asc" }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { landlordId, name, type, defaultRate, isActive } = await request.json();
		if (!landlordId || !name || !type || defaultRate === void 0) return json({ error: "Missing required service fields" }, { status: 400 });
		const service = await db.service.create({ data: {
			landlordId,
			name,
			type,
			defaultRate: Number(defaultRate),
			isActive: isActive !== void 0 ? isActive : true
		} });
		const rooms = await db.room.findMany({ where: { property: { landlordId } } });
		for (const room of rooms) await db.roomServiceConfig.create({ data: {
			roomId: room.id,
			serviceId: service.id,
			customRate: null,
			quantity: 1
		} });
		return json(service);
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { id, name, defaultRate, isActive } = await request.json();
		if (!id) return json({ error: "Missing service ID" }, { status: 400 });
		return json(await db.service.update({
			where: { id },
			data: {
				name,
				defaultRate: defaultRate !== void 0 ? Number(defaultRate) : void 0,
				isActive
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var DELETE = async ({ url }) => {
	try {
		const id = url.searchParams.get("id");
		if (!id) return json({ error: "Missing service ID" }, { status: 400 });
		await db.service.delete({ where: { id } });
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { DELETE, GET, POST, PUT };
