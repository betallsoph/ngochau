import { $ as escape_html } from "../../../../chunks/index-server.js";
import "../../../../chunks/dist.js";
import { t as Dollar_sign } from "../../../../chunks/dollar-sign.js";
import { t as Loader_circle } from "../../../../chunks/loader-circle.js";
import { t as Plus } from "../../../../chunks/plus.js";
import { t as Users } from "../../../../chunks/users.js";
//#region src/routes/dashboard/tenants/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let tenants = [];
		(/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		function formatCurrency(amount) {
			return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
		}
		$$renderer.push(`<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 class="text-xl sm:text-2xl font-black text-black">Quản Lý Khách Thuê</h1> <p class="text-zinc-600 text-xs sm:text-sm mt-1 font-bold">Hồ sơ khách hàng, tiền đặt cọ và lịch bàn giao phòng</p></div> <button class="bg-blue-300 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer font-black text-sm w-full sm:w-auto justify-center sm:justify-start">Thêm khách thuê `);
		Plus($$renderer, { class: "h-4 w-4" });
		$$renderer.push(`<!----></button></div> <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"><div class="bg-blue-100 border-2 border-black p-3 sm:p-5 rounded-lg shadow-secondary flex items-center gap-3 sm:gap-4 text-black"><div class="p-2 sm:p-3 bg-white border-2 border-black text-black rounded-lg shadow-secondary shrink-0">`);
		Users($$renderer, { class: "h-4 w-4 sm:h-6 sm:w-6" });
		$$renderer.push(`<!----></div> <div class="min-w-0"><p class="text-zinc-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Khách thuê</p> <h3 class="text-sm sm:text-2xl font-black text-black mt-0.5 sm:mt-1">${escape_html(tenants.length)} người</h3></div></div> <div class="bg-blue-100 border-2 border-black p-3 sm:p-5 rounded-lg shadow-secondary flex items-center gap-3 sm:gap-4 text-black"><div class="p-2 sm:p-3 bg-white border-2 border-black text-black rounded-lg shadow-secondary shrink-0">`);
		Dollar_sign($$renderer, { class: "h-4 w-4 sm:h-6 sm:w-6" });
		$$renderer.push(`<!----></div> <div class="min-w-0"><p class="text-zinc-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Tiền cọ</p> <h3 class="text-sm sm:text-2xl font-black text-black mt-0.5 sm:mt-1 truncate">${escape_html(formatCurrency(tenants.reduce((sum, t) => sum + t.deposit, 0)))}</h3></div></div></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="h-[40vh] w-full flex items-center justify-center">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-black animate-spin" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
