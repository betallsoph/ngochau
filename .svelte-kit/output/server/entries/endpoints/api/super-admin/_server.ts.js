import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/super-admin/+server.ts
var GET = async ({ url }) => {
	try {
		return json(await db.landlordProfile.findMany({
			include: {
				user: { select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					isActive: true
				} },
				properties: { select: {
					id: true,
					name: true,
					_count: { select: { rooms: true } }
				} }
			},
			orderBy: { user: { name: "asc" } }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { landlordId, userId, subscriptionType, isActive, subValidUntil } = await request.json();
		if (!landlordId && !userId) return json({ error: "Missing landlord ID or user ID" }, { status: 400 });
		return json(await db.$transaction(async (tx) => {
			let profile = null;
			let user = null;
			if (landlordId) profile = await tx.landlordProfile.update({
				where: { id: landlordId },
				data: {
					subscriptionType,
					subValidUntil: subValidUntil ? new Date(subValidUntil) : void 0
				}
			});
			if (userId && isActive !== void 0) user = await tx.user.update({
				where: { id: userId },
				data: { isActive }
			});
			return {
				profile,
				user
			};
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { GET, PUT };
