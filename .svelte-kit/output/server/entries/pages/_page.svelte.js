import "../../chunks/index-server.js";
import "../../chunks/client.js";
import "../../chunks/navigation.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="h-screen w-screen flex items-center justify-center bg-slate-50"><div class="flex flex-col items-center gap-3"><div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> <p class="text-slate-500 font-medium">Đang chuyển hướng...</p></div></div>`);
	});
}
//#endregion
export { _page as default };
