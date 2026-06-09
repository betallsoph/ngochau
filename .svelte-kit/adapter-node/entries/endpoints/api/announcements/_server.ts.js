import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/announcements/+server.ts
var GET = async ({ url }) => {
	try {
		const senderId = url.searchParams.get("senderId");
		const targetType = url.searchParams.get("targetType");
		const targetId = url.searchParams.get("targetId");
		const filter = {};
		if (senderId) filter.senderId = senderId;
		if (targetType) filter.targetType = targetType;
		if (targetId) filter.targetId = targetId;
		return json(await db.announcement.findMany({
			where: filter,
			orderBy: { createdAt: "desc" }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { senderId, title, content, isImportant, targetType, targetId } = await request.json();
		if (!senderId || !title || !content) return json({ error: "Missing required announcement fields" }, { status: 400 });
		return json(await db.announcement.create({ data: {
			senderId,
			title,
			content,
			isImportant: isImportant || false,
			targetType: targetType || "ALL",
			targetId: targetId || null
		} }));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var DELETE = async ({ url }) => {
	try {
		const id = url.searchParams.get("id");
		if (!id) return json({ error: "Missing announcement ID" }, { status: 400 });
		await db.announcement.delete({ where: { id } });
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { DELETE, GET, POST };
