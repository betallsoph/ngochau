import "../../../../chunks/index-server.js";
import "../../../../chunks/dist.js";
import "../../../../chunks/Icon.js";
import "../../../../chunks/landmark.js";
import { t as Loader_circle } from "../../../../chunks/loader-circle.js";
import "../../../../chunks/user.js";
//#endregion
//#region src/routes/dashboard/settings/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="space-y-6 max-w-4xl"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 class="text-xl sm:text-2xl font-black text-black">Cấu Hình Tài Khoản</h1> <p class="text-zinc-650 text-sm mt-1 font-bold">Quản lý thương hiệu dịch vụ và tài khoản nhận thanh toán VietQR động</p></div></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="h-[40vh] w-full flex items-center justify-center">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-black animate-spin" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
