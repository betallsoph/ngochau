import { t as db } from "../../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/dashboard/stats/+server.ts
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		if (!landlordId) return json({ error: "Missing landlord ID" }, { status: 400 });
		const propertyIds = (await db.property.findMany({
			where: { landlordId },
			select: { id: true }
		})).map((p) => p.id);
		const rooms = await db.room.findMany({
			where: { propertyId: { in: propertyIds } },
			select: {
				id: true,
				status: true
			}
		});
		const totalRooms = rooms.length;
		const emptyRooms = rooms.filter((r) => r.status === "empty").length;
		const occupiedRooms = totalRooms - emptyRooms;
		const unpaidInvoicesCount = await db.invoice.count({ where: {
			room: { propertyId: { in: propertyIds } },
			status: { in: [
				"pending",
				"overdue",
				"partial"
			] }
		} });
		return json({
			totalRevenue: (await db.invoice.findMany({
				where: { room: { propertyId: { in: propertyIds } } },
				select: { paidAmount: true }
			})).reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
			emptyRooms,
			unpaidInvoices: unpaidInvoicesCount,
			expiringContracts: 1,
			totalRooms,
			occupiedRooms
		});
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { GET };
