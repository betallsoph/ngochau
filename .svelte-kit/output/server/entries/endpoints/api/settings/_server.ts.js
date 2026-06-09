import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/settings/+server.ts
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		if (!landlordId) return json({ error: "Missing landlord ID" }, { status: 400 });
		const landlordProfile = await db.landlordProfile.findUnique({
			where: { id: landlordId },
			include: { user: { select: {
				name: true,
				email: true,
				phone: true
			} } }
		});
		if (!landlordProfile) return json({ error: "Landlord profile not found" }, { status: 404 });
		return json(landlordProfile);
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { landlordId, companyName, bankName, bankCode, accountNumber, accountName, bankBranch } = await request.json();
		if (!landlordId) return json({ error: "Missing landlord ID" }, { status: 400 });
		return json(await db.landlordProfile.update({
			where: { id: landlordId },
			data: {
				companyName,
				bankName,
				bankCode,
				accountNumber,
				accountName: accountName ? accountName.toUpperCase() : void 0,
				bankBranch
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { GET, PUT };
