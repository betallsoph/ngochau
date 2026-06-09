import { v as spread_props } from "../../../../../chunks/index-server.js";
import "../../../../../chunks/dist.js";
import "../../../../../chunks/navigation.js";
import { t as Icon } from "../../../../../chunks/Icon.js";
import "../../../../../chunks/circle-alert.js";
import "../../../../../chunks/circle-check.js";
import { t as Loader_circle } from "../../../../../chunks/loader-circle.js";
import "../../../../../chunks/receipt.js";
//#region node_modules/@lucide/svelte/dist/icons/arrow-left.svelte
function Arrow_left($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "arrow-left" },
		props,
		{ iconNode: [["path", { "d": "m12 19-7-7 7-7" }], ["path", { "d": "M19 12H5" }]] }
	]));
}
//#endregion
//#region src/routes/dashboard/invoices/bulk/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		(/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
		$$renderer.push(`<div class="space-y-6"><div class="flex items-center gap-3"><a href="/dashboard/invoices" class="p-2 border-2 border-black bg-white hover:bg-zinc-100 rounded-[6px] text-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shrink-0 cursor-pointer">`);
		Arrow_left($$renderer, { class: "h-5 w-5" });
		$$renderer.push(`<!----></a> <div><h1 class="text-2xl font-black text-black">Tạo Hóa Đơn Hàng Loạt</h1> <p class="text-zinc-600 text-sm mt-0.5 font-bold">Nhập chỉ số điện nước cuối kỳ của toàn bộ tòa nhà để tự động tính hóa đơn.</p></div></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="h-[40vh] w-full flex items-center justify-center">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-black animate-spin" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
