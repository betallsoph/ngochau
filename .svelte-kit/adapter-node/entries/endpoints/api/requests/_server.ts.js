import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/requests/+server.ts
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		const tenantId = url.searchParams.get("tenantId");
		const filter = {};
		if (landlordId) filter.tenant = { rooms: { some: { property: { landlordId } } } };
		else if (tenantId) filter.tenantId = tenantId;
		return json(await db.maintenanceRequest.findMany({
			where: filter,
			include: {
				tenant: { include: { user: { select: {
					name: true,
					phone: true
				} } } },
				assignedTo: { include: { user: { select: {
					name: true,
					phone: true
				} } } }
			},
			orderBy: { createdAt: "desc" }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { tenantId, roomNumber, buildingName, category, title, description, imageUrl, priority } = await request.json();
		if (!tenantId || !roomNumber || !buildingName || !category || !title || !description) return json({ error: "Missing required maintenance request fields" }, { status: 400 });
		return json(await db.maintenanceRequest.create({ data: {
			tenantId,
			roomNumber,
			buildingName,
			category,
			title,
			description,
			imageUrl,
			priority: priority || "normal",
			status: "pending"
		} }));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { id, status, response, assignedToId } = await request.json();
		if (!id) return json({ error: "Missing maintenance request ID" }, { status: 400 });
		return json(await db.maintenanceRequest.update({
			where: { id },
			data: {
				status,
				response,
				assignedToId
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var DELETE = async ({ url }) => {
	try {
		const id = url.searchParams.get("id");
		if (!id) return json({ error: "Missing maintenance request ID" }, { status: 400 });
		await db.maintenanceRequest.delete({ where: { id } });
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { DELETE, GET, POST, PUT };
