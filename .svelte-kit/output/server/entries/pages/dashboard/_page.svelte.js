import { $ as escape_html, v as spread_props } from "../../../chunks/index-server.js";
import "../../../chunks/dist.js";
import "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as Icon } from "../../../chunks/Icon.js";
import { t as Arrow_right } from "../../../chunks/arrow-right.js";
import { t as Calendar } from "../../../chunks/calendar.js";
import "../../../chunks/circle-check.js";
import "../../../chunks/dollar-sign.js";
import "../../../chunks/house.js";
import { t as Loader_circle } from "../../../chunks/loader-circle.js";
import "../../../chunks/receipt.js";
import "../../../chunks/user.js";
import "../../../chunks/wrench.js";
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/play.svelte
function Play($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "play" },
		props,
		{ iconNode: [["path", { "d": "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" }]] }
	]));
}
//#endregion
//#region src/routes/dashboard/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 class="text-xl sm:text-2xl font-black text-black">Cổng Quản Trị Roomio</h1> <p class="text-zinc-600 text-xs sm:text-sm mt-1 flex items-center gap-1.5 font-bold">Hôm nay, ${escape_html("")} `);
		Calendar($$renderer, { class: "h-4 w-4 text-zinc-500" });
		$$renderer.push(`<!----></p></div> <div class="flex gap-2 sm:gap-3"><a href="/dashboard/rooms" class="flex-1 sm:flex-none bg-blue-300 text-black border-2 border-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm">Phòng `);
		Arrow_right($$renderer, { class: "h-3.5 w-3.5" });
		$$renderer.push(`<!----></a> <a href="/dashboard/invoices/bulk" class="flex-1 sm:flex-none bg-green-200 text-black border-2 border-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm">Hoá đơn loạt `);
		Play($$renderer, { class: "h-3.5 w-3.5" });
		$$renderer.push(`<!----></a></div></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="h-[60vh] w-full flex items-center justify-center"><div class="flex flex-col items-center gap-3">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-black animate-spin" });
		$$renderer.push(`<!----> <p class="text-zinc-600 font-bold">Đang tải báo cáo tổng quan...</p></div></div>`);
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
