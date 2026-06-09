import { t as db } from "../../../../chunks/db.js";
import { json } from "@sveltejs/kit";
import crypto from "crypto";
//#region src/routes/api/auth/+server.ts
function hashPassword(password) {
	return crypto.createHash("sha256").update(password).digest("hex");
}
var POST = async ({ request }) => {
	try {
		const { action, email, phone, password, name, role } = await request.json();
		if (action === "register") {
			if (!email || !phone || !password || !name) return json({ error: "Thiếu thông tin đăng ký bắt buộc" }, { status: 400 });
			if (await db.user.findFirst({ where: { OR: [{ email }, { phone }] } })) return json({ error: "Email hoặc số điện thoại đã được đăng ký" }, { status: 400 });
			const passwordHash = hashPassword(password);
			const userRole = role || "LANDLORD";
			return json(await db.$transaction(async (tx) => {
				const newUser = await tx.user.create({ data: {
					email,
					phone,
					passwordHash,
					name,
					role: userRole
				} });
				let landlordProfileId = null;
				let tenantProfileId = null;
				if (userRole === "LANDLORD") {
					const profile = await tx.landlordProfile.create({ data: {
						userId: newUser.id,
						companyName: `${name} PMS`,
						bankName: "Vietcombank",
						bankCode: "VCB",
						accountNumber: "1234567890",
						accountName: name.toUpperCase(),
						bankBranch: "Chi nhánh TP.HCM"
					} });
					landlordProfileId = profile.id;
					for (const s of [
						{
							name: "Điện",
							type: "METERED",
							defaultRate: 3500
						},
						{
							name: "Nước",
							type: "METERED",
							defaultRate: 15e3
						},
						{
							name: "Wifi",
							type: "FLAT_ROOM",
							defaultRate: 1e5
						},
						{
							name: "Rác sinh hoạt",
							type: "FLAT_PERSON",
							defaultRate: 3e4
						},
						{
							name: "Gửi xe máy",
							type: "FLAT_VEHICLE",
							defaultRate: 1e5
						}
					]) await tx.service.create({ data: {
						landlordId: profile.id,
						name: s.name,
						type: s.type,
						defaultRate: s.defaultRate,
						isActive: true
					} });
				} else if (userRole === "TENANT") tenantProfileId = (await tx.tenantProfile.create({ data: {
					userId: newUser.id,
					idNumber: "000000000000",
					moveInDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
					deposit: 0,
					notes: "Tự đăng ký qua cổng khách"
				} })).id;
				return {
					id: newUser.id,
					email: newUser.email,
					phone: newUser.phone,
					name: newUser.name,
					role: newUser.role,
					landlordProfileId,
					tenantProfileId
				};
			}));
		} else if (action === "login") {
			if (!email && !phone || !password) return json({ error: "Thiếu tài khoản hoặc mật khẩu" }, { status: 400 });
			const user = await db.user.findFirst({
				where: { OR: [email ? { email } : void 0, phone ? { phone } : void 0].filter(Boolean) },
				include: {
					landlordProfile: true,
					tenantProfile: true,
					staffProfile: true
				}
			});
			if (!user) return json({ error: "Tài khoản không tồn tại" }, { status: 401 });
			const inputHash = hashPassword(password);
			if (user.passwordHash !== inputHash) return json({ error: "Mật khẩu không chính xác" }, { status: 401 });
			if (!user.isActive) return json({ error: "Tài khoản đã bị tạm khóa" }, { status: 403 });
			return json({
				id: user.id,
				email: user.email,
				phone: user.phone,
				name: user.name,
				role: user.role,
				landlordProfileId: user.landlordProfile?.id || null,
				tenantProfileId: user.tenantProfile?.id || null,
				staffProfileId: user.staffProfile?.id || null
			});
		}
		return json({ error: "Hành động không hợp lệ" }, { status: 400 });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
};
//#endregion
export { POST };
