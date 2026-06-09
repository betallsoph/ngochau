import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/invoices/+server.ts
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		const tenantId = url.searchParams.get("tenantId");
		const roomId = url.searchParams.get("roomId");
		const status = url.searchParams.get("status");
		const filter = {};
		if (landlordId) filter.room = { property: { landlordId } };
		else if (tenantId) filter.room = { tenantId };
		else if (roomId) filter.roomId = roomId;
		if (status) filter.status = status;
		return json(await db.invoice.findMany({
			where: filter,
			include: {
				items: true,
				room: { include: {
					property: true,
					block: true
				} }
			},
			orderBy: [{ month: "desc" }, { createdAt: "desc" }]
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { roomId, month, rentAmount, dueDate, items, notes } = await request.json();
		if (!roomId || !month || rentAmount === void 0 || !dueDate || !items || !Array.isArray(items)) return json({ error: "Missing required invoice parameters" }, { status: 400 });
		const room = await db.room.findUnique({
			where: { id: roomId },
			include: { tenant: { include: { user: true } } }
		});
		if (!room) return json({ error: "Room not found" }, { status: 404 });
		if (!room.tenant) return json({ error: "Room has no active tenant" }, { status: 400 });
		const tenantName = room.tenant.user.name;
		const tenantPhone = room.tenant.user.phone;
		const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
		const randomHex = Math.floor(1e3 + Math.random() * 9e3).toString();
		const invoiceId = `INV-${month.replace("-", "")}-${randomHex}`;
		const invoice = await db.$transaction(async (tx) => {
			const inv = await tx.invoice.create({ data: {
				id: invoiceId,
				roomId,
				roomNumber: room.roomNumber,
				tenantName,
				tenantPhone,
				month,
				rentAmount: Number(rentAmount),
				totalAmount,
				dueDate,
				status: "pending",
				paidAmount: 0,
				createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
				notes
			} });
			for (const item of items) await tx.invoiceItem.create({ data: {
				invoiceId: inv.id,
				name: item.name,
				amount: Number(item.amount),
				details: item.details
			} });
			await tx.room.update({
				where: { id: roomId },
				data: {
					status: "debt",
					debtAmount: { increment: totalAmount }
				}
			});
			return inv;
		});
		return json(await db.invoice.findUnique({
			where: { id: invoice.id },
			include: { items: true }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { GET, POST };
