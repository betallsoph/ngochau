import { t as db } from "../../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
//#region src/routes/api/invoices/[id]/+server.ts
var GET = async ({ params }) => {
	try {
		const { id } = params;
		if (!id) return json({ error: "Missing invoice ID" }, { status: 400 });
		const invoice = await db.invoice.findUnique({
			where: { id },
			include: {
				items: true,
				room: { include: { property: { include: { landlord: true } } } }
			}
		});
		if (!invoice) return json({ error: "Invoice not found" }, { status: 404 });
		return json(invoice);
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var PUT = async ({ params, request }) => {
	try {
		const { id } = params;
		const { action, paymentProofImage, paidAmount } = await request.json();
		if (!id) return json({ error: "Missing invoice ID" }, { status: 400 });
		const invoice = await db.invoice.findUnique({
			where: { id },
			include: { room: true }
		});
		if (!invoice) return json({ error: "Invoice not found" }, { status: 404 });
		if (action === "confirmPaid") {
			if (invoice.status === "paid") return json({ error: "Invoice is already paid" }, { status: 400 });
			return json(await db.$transaction(async (tx) => {
				const inv = await tx.invoice.update({
					where: { id },
					data: {
						status: "paid",
						paidAmount: invoice.totalAmount,
						paidDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
					}
				});
				const outstandingAmount = invoice.totalAmount - invoice.paidAmount;
				await tx.room.update({
					where: { id: invoice.roomId },
					data: {
						status: "paid",
						debtAmount: { decrement: outstandingAmount >= 0 ? outstandingAmount : 0 }
					}
				});
				return inv;
			}));
		} else if (action === "uploadProof") {
			if (!paymentProofImage) return json({ error: "Missing payment proof image url" }, { status: 400 });
			return json(await db.invoice.update({
				where: { id },
				data: {
					paymentProofImage,
					status: "pending"
				}
			}));
		} else {
			const updateData = {};
			if (paidAmount !== void 0) {
				updateData.paidAmount = Number(paidAmount);
				if (Number(paidAmount) >= invoice.totalAmount) {
					updateData.status = "paid";
					updateData.paidDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
				}
			}
			return json(await db.invoice.update({
				where: { id },
				data: updateData
			}));
		}
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
var DELETE = async ({ params }) => {
	try {
		const { id } = params;
		if (!id) return json({ error: "Missing invoice ID" }, { status: 400 });
		const invoice = await db.invoice.findUnique({ where: { id } });
		if (!invoice) return json({ error: "Invoice not found" }, { status: 404 });
		await db.$transaction(async (tx) => {
			await tx.invoice.delete({ where: { id } });
			if (invoice.status !== "paid") {
				const outstanding = invoice.totalAmount - invoice.paidAmount;
				await tx.room.update({
					where: { id: invoice.roomId },
					data: { debtAmount: { decrement: outstanding > 0 ? outstanding : 0 } }
				});
			}
		});
		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { DELETE, GET, PUT };
