import "../../../../chunks/index-server.js";
import "../../../../chunks/dist.js";
import "../../../../chunks/Icon.js";
import { t as Bell } from "../../../../chunks/bell.js";
import "../../../../chunks/calendar.js";
import "../../../../chunks/circle-alert.js";
import { t as Loader_circle } from "../../../../chunks/loader-circle.js";
import { n as Message_square } from "../../../../chunks/pin.js";
import { t as Plus } from "../../../../chunks/plus.js";
//#endregion
//#region src/routes/dashboard/notifications/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="space-y-6"><div class="flex items-center justify-between"><div><h1 class="text-2xl font-black text-black">Thông Báo &amp; Lời Nhắn</h1> <p class="text-zinc-650 text-sm mt-1 font-bold">Đăng thông báo ghim cho cư dân và theo dõi các lời nhắn đặc biệt</p></div> <button class="bg-blue-300 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer font-black text-sm">Đăng thông báo `);
		Plus($$renderer, { class: "h-4.5 w-4.5" });
		$$renderer.push(`<!----></button></div> <div class="grid gap-6 lg:grid-cols-2"><div class="bg-blue-100 border-2 border-black rounded-lg shadow-secondary flex flex-col h-[70vh] overflow-hidden"><div class="p-4 border-b-2 border-black bg-zinc-100 flex items-center justify-between shrink-0 select-none"><h2 class="font-black text-black text-base flex items-center gap-2">Lời nhắn &amp; Đề nghị từ khách `);
		Message_square($$renderer, { class: "h-5 w-5" });
		$$renderer.push(`<!----></h2></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="flex-grow flex items-center justify-center bg-white">`);
		Loader_circle($$renderer, { class: "h-8 w-8 text-black animate-spin" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--></div> <div class="bg-blue-100 border-2 border-black rounded-lg shadow-secondary flex flex-col h-[70vh] overflow-hidden"><div class="p-4 border-b-2 border-black bg-zinc-100 flex items-center justify-between shrink-0 select-none"><h2 class="font-black text-black text-base flex items-center gap-2">Bảng tin thông báo tòa nhà `);
		Bell($$renderer, { class: "h-5 w-5" });
		$$renderer.push(`<!----></h2></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="flex-grow flex items-center justify-center bg-white">`);
		Loader_circle($$renderer, { class: "h-8 w-8 text-black animate-spin" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
