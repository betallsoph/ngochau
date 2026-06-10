import { $ as escape_html } from "../../../../chunks/index-server.js";
import "../../../../chunks/dist.js";
import "../../../../chunks/building-2.js";
import { t as Loader_circle } from "../../../../chunks/loader-circle.js";
import { t as Plus } from "../../../../chunks/plus.js";
//#region src/routes/dashboard/buildings/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let properties = [];
		$$renderer.push(`<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 class="text-xl sm:text-2xl font-black text-black">Danh Sách Tòa Nhà</h1> <p class="text-zinc-600 text-sm mt-1 font-bold">${escape_html(properties.length)} tòa nhà, ${escape_html(properties.reduce((sum, p) => sum + p.rooms.length, 0))} phòng trọ</p></div> <button class="w-full sm:w-auto bg-blue-300 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-sm">Thêm tòa nhà `);
		Plus($$renderer, { class: "h-4.5 w-4.5" });
		$$renderer.push(`<!----></button></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="h-[50vh] w-full flex items-center justify-center"><div class="flex flex-col items-center gap-3">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-black animate-spin" });
		$$renderer.push(`<!----> <p class="text-zinc-600 font-bold">Đang tải danh sách tòa nhà...</p></div></div>`);
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
