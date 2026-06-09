import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/properties/+server.ts
var GET = async ({ url }) => {
	try {
		const landlordId = url.searchParams.get("landlordId");
		if (!landlordId) return json({ error: "Missing landlord ID" }, { status: 400 });
		return json(await db.property.findMany({
			where: { landlordId },
			include: {
				blocks: true,
				rooms: { select: {
					id: true,
					roomNumber: true,
					status: true,
					roomType: true,
					monthlyRent: true
				} }
			},
			orderBy: { name: "asc" }
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var POST = async ({ request }) => {
	try {
		const { landlordId, name, shortName, address, blocks } = await request.json();
		if (!landlordId || !name || !shortName || !address) return json({ error: "Missing required property fields" }, { status: 400 });
		const property = await db.$transaction(async (tx) => {
			const prop = await tx.property.create({ data: {
				landlordId,
				name,
				shortName,
				address
			} });
			if (blocks && Array.isArray(blocks) && blocks.length > 0) {
				for (const blockName of blocks) if (blockName.trim()) await tx.block.create({ data: {
					propertyId: prop.id,
					name: blockName.trim()
				} });
			}
			return prop;
		});
		return json(await db.property.findUnique({
			where: { id: property.id },
			include: {
				blocks: true,
				rooms: true
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ request }) => {
	try {
		const { id, name, shortName, address, blocks } = await request.json();
		if (!id) return json({ error: "Missing property ID" }, { status: 400 });
		const property = await db.$transaction(async (tx) => {
			const prop = await tx.property.update({
				where: { id },
				data: {
					name,
					shortName,
					address
				}
			});
			if (blocks && Array.isArray(blocks)) {
				const existingNames = (await tx.block.findMany({ where: { propertyId: id } })).map((b) => b.name);
				for (const blockName of blocks) {
					const trimmed = blockName.trim();
					if (trimmed && !existingNames.includes(trimmed)) await tx.block.create({ data: {
						propertyId: id,
						name: trimmed
					} });
				}
			}
			return prop;
		});
		return json(await db.property.findUnique({
			where: { id: property.id },
			include: {
				blocks: true,
				rooms: true
			}
		}));
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var DELETE = async ({ url }) => {
	try {
		const id = url.searchParams.get("id");
		if (!id) return json({ error: "Missing property ID" }, { status: 400 });
		await db.property.delete({ where: { id } });
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { DELETE, GET, POST, PUT };
