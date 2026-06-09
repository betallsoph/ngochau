import { $ as escape_html, Z as attr, u as derived, v as spread_props } from "../../../chunks/index-server.js";
import "../../../chunks/dist.js";
import "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as Icon } from "../../../chunks/Icon.js";
import { t as Building_2 } from "../../../chunks/building-2.js";
import { t as Loader_circle } from "../../../chunks/loader-circle.js";
import { t as Log_out } from "../../../chunks/log-out.js";
import { t as Users } from "../../../chunks/users.js";
//#region node_modules/@lucide/svelte/dist/icons/award.svelte
function Award($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "award" },
		props,
		{ iconNode: [["path", { "d": "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" }], ["circle", {
			"cx": "12",
			"cy": "8",
			"r": "6"
		}]] }
	]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/search.svelte
function Search($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "search" },
		props,
		{ iconNode: [["path", { "d": "m21 21-4.34-4.34" }], ["circle", {
			"cx": "11",
			"cy": "11",
			"r": "8"
		}]] }
	]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/shield-check.svelte
function Shield_check($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "shield-check" },
		props,
		{ iconNode: [["path", { "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { "d": "m9 12 2 2 4-4" }]] }
	]));
}
//#endregion
//#region src/routes/super-admin/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let adminName = "";
		let landlords = [];
		let searchQuery = "";
		derived(() => () => {
			if (!searchQuery.trim()) return landlords;
			const query = searchQuery.toLowerCase();
			return landlords.filter((l) => l.user.name.toLowerCase().includes(query) || l.companyName && l.companyName.toLowerCase().includes(query) || l.user.email.toLowerCase().includes(query) || l.user.phone.includes(query));
		});
		$$renderer.push(`<div class="min-h-screen bg-slate-50 font-sans"><header class="bg-slate-900 text-white h-16 px-6 flex items-center justify-between shadow-md"><div class="flex items-center gap-3"><div class="bg-indigo-600 p-2 rounded-xl">`);
		Shield_check($$renderer, { class: "h-5 w-5 text-white" });
		$$renderer.push(`<!----></div> <span class="text-xl font-bold tracking-tight">Roomio SuperAdmin</span></div> <div class="flex items-center gap-4"><span class="text-slate-300 text-sm font-semibold">Chào Admin, ${escape_html(adminName)}</span> <button class="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer">`);
		Log_out($$renderer, { class: "h-4.5 w-4.5" });
		$$renderer.push(`<!----> Đăng xuất</button></div></header> <main class="max-w-7xl mx-auto p-6 space-y-6"><div class="grid gap-4 sm:grid-cols-3"><div class="bg-white border p-5 rounded-2xl shadow-sm flex items-center gap-4"><div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">`);
		Users($$renderer, { class: "h-6 w-6" });
		$$renderer.push(`<!----></div> <div><p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng chủ trọ vận hành</p> <h3 class="text-2xl font-extrabold text-slate-800 mt-1">${escape_html(landlords.length)} chủ trọ</h3></div></div> <div class="bg-white border p-5 rounded-2xl shadow-sm flex items-center gap-4"><div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">`);
		Award($$renderer, { class: "h-6 w-6" });
		$$renderer.push(`<!----></div> <div><p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Đối tác Premium</p> <h3 class="text-2xl font-extrabold text-slate-800 mt-1">${escape_html(landlords.filter((l) => l.subscriptionType !== "FREE").length)} đối tác</h3></div></div> <div class="bg-white border p-5 rounded-2xl shadow-sm flex items-center gap-4"><div class="p-3 bg-amber-50 rounded-xl text-amber-600">`);
		Building_2($$renderer, { class: "h-6 w-6" });
		$$renderer.push(`<!----></div> <div><p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng số phòng quản lý</p> <h3 class="text-2xl font-extrabold text-slate-800 mt-1">${escape_html(landlords.reduce((sum, l) => sum + l.properties.reduce((s, p) => s + p._count.rooms, 0), 0))} phòng</h3></div></div></div> <div class="bg-white border p-4 rounded-2xl shadow-sm flex items-center gap-3">`);
		Search($$renderer, { class: "h-5 w-5 text-slate-400 shrink-0" });
		$$renderer.push(`<!----> <input type="text"${attr("value", searchQuery)} placeholder="Tìm kiếm chủ trọ theo tên, công ty, email hoặc số điện thoại..." class="w-full text-sm outline-none bg-transparent text-slate-700"/></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="h-[40vh] w-full flex items-center justify-center">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-indigo-600 animate-spin" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--></main> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
