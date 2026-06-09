import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/notifications/+server.ts
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		const tenantId = url.searchParams.get("tenantId");
		const filter = {};
		if (landlordId) filter.tenant = { rooms: { some: { property: { landlordId } } } };
		else if (tenantId) filter.tenantId = tenantId;
		return json(await db.specialNote.findMany({
			where: filter,
			include: { tenant: { include: {
				user: { select: {
					name: true,
					phone: true
				} },
				rooms: { select: { roomNumber: true } }
			} } },
			orderBy: { createdAt: "desc" }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { tenantId, content } = await request.json();
		if (!tenantId || !content) return json({ error: "Missing tenant ID or content" }, { status: 400 });
		return json(await db.specialNote.create({ data: {
			tenantId,
			content,
			isRead: false
		} }));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { id, isRead } = await request.json();
		if (!id) return json({ error: "Missing notification/note ID" }, { status: 400 });
		return json(await db.specialNote.update({
			where: { id },
			data: { isRead: isRead !== void 0 ? isRead : true }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { GET, POST, PUT };
