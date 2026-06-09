import { $ as escape_html, Z as attr, v as spread_props } from "../../../chunks/index-server.js";
import "../../../chunks/dist.js";
import "../../../chunks/client.js";
import "../../../chunks/navigation.js";
import { t as Icon } from "../../../chunks/Icon.js";
import { t as Arrow_right } from "../../../chunks/arrow-right.js";
import { t as Landmark } from "../../../chunks/landmark.js";
//#region node_modules/@lucide/svelte/dist/icons/key-round.svelte
function Key_round($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "key-round" },
		props,
		{ iconNode: [["path", { "d": "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" }], ["circle", {
			"cx": "16.5",
			"cy": "7.5",
			"r": ".5",
			"fill": "currentColor"
		}]] }
	]));
}
//#endregion
//#region node_modules/@lucide/svelte/dist/icons/mail.svelte
function Mail($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "mail" },
		props,
		{ iconNode: [["path", { "d": "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }], ["rect", {
			"x": "2",
			"y": "4",
			"width": "20",
			"height": "16",
			"rx": "2"
		}]] }
	]));
}
//#endregion
//#region src/routes/login/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let email = "";
		let password = "";
		let isLoading = false;
		$$renderer.push(`<div class="min-h-screen w-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden font-sans relative"><div class="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,black_1px,transparent_0)] bg-[size:16px_16px]"></div> <div class="hidden md:flex md:w-1/2 bg-white border-r-2 border-black flex-col justify-between p-12 relative"><div class="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div> <div class="flex items-center gap-3 relative z-10"><div class="bg-blue-300 border-2 border-black p-2.5 rounded-lg shadow-secondary">`);
		Landmark($$renderer, { class: "h-6 w-6 text-black" });
		$$renderer.push(`<!----></div> <span class="text-2xl font-black tracking-tight text-black">Roomio</span></div> <div class="space-y-6 relative z-10 max-w-lg"><h1 class="text-4xl lg:text-5xl font-black leading-none text-black">Quản lý nhà trọ &amp; căn hộ dịch vụ hiệu quả.</h1> <p class="text-zinc-600 text-base leading-relaxed font-semibold">Phần mềm quản trị vận hành tối ưu cho cả chủ nhà và khách thuê. Tự động hoá hoá đơn, báo cáo chỉ số điện nước, quản lý sự cố và chuyển khoản VietQR tiện lợi.</p></div> <div class="text-zinc-500 text-xs relative z-10 font-bold uppercase tracking-wider">© 2026 Roomio Inc. All rights reserved.</div></div> <div class="flex-1 flex items-center justify-center p-6 md:p-12 relative"><div class="w-full max-w-md bg-white border-2 border-black rounded-lg shadow-primary overflow-hidden flex flex-col"><div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none"><div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div> <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div> <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div> <span class="text-xs font-bold text-zinc-500 ml-2">Roomio Window System</span></div> <div class="p-6 md:p-8 flex-1 flex flex-col justify-center"><div class="text-center mb-6"><div class="flex justify-center md:hidden items-center gap-2 mb-4"><div class="bg-blue-300 border-2 border-black p-2 rounded-lg shadow-secondary">`);
		Landmark($$renderer, { class: "h-5 w-5 text-black" });
		$$renderer.push(`<!----></div> <span class="text-xl font-black text-black tracking-tight">Roomio</span></div> <h2 class="text-2xl font-black text-black leading-none">${escape_html("ĐĂNG NHẬP HỆ THỐNG")}</h2> <p class="text-zinc-600 text-xs font-semibold mt-2">${escape_html("Nhập thông tin truy cập cổng dịch vụ của bạn")}</p></div> <form class="space-y-4">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-1"><label for="acc-email" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">${escape_html("Email hoặc Số điện thoại")}</label> <div class="relative"><span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">`);
		Mail($$renderer, { class: "h-4.5 w-4.5" });
		$$renderer.push(`<!----></span> <input id="acc-email"${attr("type", "text")}${attr("value", email)} required=""${attr("placeholder", "Email hoặc SĐT đăng nhập")} class="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"/></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-1"><label for="acc-password" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Mật khẩu</label> <div class="relative"><span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">`);
		Key_round($$renderer, { class: "h-4.5 w-4.5" });
		$$renderer.push(`<!----></span> <input id="acc-password" type="password"${attr("value", password)} required="" placeholder="••••••••" class="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"/></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <button type="submit"${attr("disabled", isLoading, true)} class="w-full py-3 mt-2 bg-blue-300 hover:bg-blue-400 text-black border-2 border-black rounded-[6px] shadow-primary hover:translate-x-[5px] hover:translate-y-[6px] hover:shadow-none active:translate-x-[5px] active:translate-y-[6px] active:shadow-none transition-all font-bold text-sm cursor-pointer flex items-center justify-center gap-2">`);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`${escape_html("ĐĂNG NHẬP")} `);
		Arrow_right($$renderer, { class: "h-4.5 w-4.5" });
		$$renderer.push(`<!---->`);
		$$renderer.push(`<!--]--></button></form> <div class="text-center mt-6 text-xs text-zinc-600 font-bold uppercase tracking-wider">${escape_html("Bạn là chủ trọ mới?")} <button type="button" class="text-blue-500 hover:underline font-bold ml-1 bg-transparent border-none p-0 cursor-pointer">${escape_html("Đăng ký tại đây")}</button></div></div></div></div></div>`);
	});
}
//#endregion
export { _page as default };
