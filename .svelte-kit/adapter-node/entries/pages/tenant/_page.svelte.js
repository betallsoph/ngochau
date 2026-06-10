import { u as derived } from "../../../chunks/index-server.js";
import "../../../chunks/dist.js";
import "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import "../../../chunks/Icon.js";
import "../../../chunks/calendar.js";
import "../../../chunks/circle-check.js";
import { t as House } from "../../../chunks/house.js";
import { t as Loader_circle } from "../../../chunks/loader-circle.js";
import { t as Log_out } from "../../../chunks/log-out.js";
import "../../../chunks/pin.js";
import "../../../chunks/receipt.js";
import "../../../chunks/wrench.js";
import "../../../chunks/zap.js";
//#endregion
//#region src/routes/tenant/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		(/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
		let invoices = [];
		derived(() => () => {
			return invoices.find((inv) => inv.status !== "paid");
		});
		$$renderer.push(`<div class="min-h-screen bg-white flex flex-col font-sans relative"><header class="bg-blue-300 text-black h-16 px-6 border-b-2 border-black flex items-center justify-between sticky top-0 z-40 shadow-sm shrink-0"><div class="flex items-center gap-2"><div class="bg-white border-2 border-black p-1.5 rounded-lg shadow-secondary">`);
		House($$renderer, { class: "h-5 w-5 text-black" });
		$$renderer.push(`<!----></div> <span class="font-black text-lg">Roomio Cư Dân</span></div> <button class="flex items-center gap-1.5 bg-white border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-3 py-1.5 rounded-[6px] shadow-secondary text-xs font-bold cursor-pointer">Đăng xuất `);
		Log_out($$renderer, { class: "h-4 w-4" });
		$$renderer.push(`<!----></button></header> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="flex-1 flex items-center justify-center relative z-10"><div class="flex flex-col items-center gap-3">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-black animate-spin" });
		$$renderer.push(`<!----> <p class="text-zinc-500 font-bold uppercase tracking-wider text-xs">Đang tải cổng thông tin cư dân...</p></div></div>`);
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
