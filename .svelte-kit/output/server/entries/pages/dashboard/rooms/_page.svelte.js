import { $ as escape_html, f as ensure_array_like } from "../../../../chunks/index-server.js";
import "../../../../chunks/dist.js";
import "../../../../chunks/state.js";
import "../../../../chunks/house.js";
import { t as Loader_circle } from "../../../../chunks/loader-circle.js";
import { t as Plus } from "../../../../chunks/plus.js";
//#region src/routes/dashboard/rooms/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let properties = [];
		let selectedPropertyId = "";
		let selectedBlockId = "all";
		(/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
		function getActiveProperty() {
			return properties.find((p) => p.id === selectedPropertyId);
		}
		$$renderer.push(`<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 class="text-2xl font-black text-black leading-none">Sơ Đồ Phòng Trọ</h1> <p class="text-zinc-500 text-sm mt-1.5 font-bold uppercase tracking-wider">Quản lý trạng thái, chỉ số và thiết bị bàn giao</p></div> <button class="bg-blue-300 hover:bg-blue-400 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-primary hover:translate-x-[5px] hover:translate-y-[6px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer font-bold text-sm">Thêm phòng `);
		Plus($$renderer, { class: "h-4.5 w-4.5" });
		$$renderer.push(`<!----></button></div> <div class="bg-blue-100 border-2 border-black p-4 rounded-lg shadow-secondary flex flex-col md:flex-row gap-4 items-center justify-between"><div class="flex flex-wrap items-center gap-4 w-full md:w-auto"><div class="space-y-1"><span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Chọn tòa nhà</span> `);
		$$renderer.select({
			value: selectedPropertyId,
			class: "border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-bold text-black w-60"
		}, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(properties);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let prop = each_array[$$index];
				$$renderer.option({ value: prop.id }, ($$renderer) => {
					$$renderer.push(`${escape_html(prop.name)}`);
				});
			}
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`</div> `);
		if (getActiveProperty() && getActiveProperty().blocks.length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="space-y-1"><span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Dãy/Phân cụm</span> `);
			$$renderer.select({
				value: selectedBlockId,
				class: "border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-bold text-black w-44"
			}, ($$renderer) => {
				$$renderer.option({ value: "all" }, ($$renderer) => {
					$$renderer.push(`Tất cả dãy`);
				});
				$$renderer.push(`<!--[-->`);
				const each_array_1 = ensure_array_like(getActiveProperty().blocks);
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let block = each_array_1[$$index_1];
					$$renderer.option({ value: block.id }, ($$renderer) => {
						$$renderer.push(`${escape_html(block.name)}`);
					});
				}
				$$renderer.push(`<!--]-->`);
			});
			$$renderer.push(`</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> <div class="flex gap-4 text-xs font-bold text-zinc-600 self-end md:self-auto select-none"><div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-md border-2 border-black bg-white"></span> <span>Phòng trống</span></div> <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-md border-2 border-black bg-green-200"></span> <span>Đã đóng đủ</span></div> <div class="flex items-center gap-1.5"><span class="w-3.5 h-3.5 rounded-md border-2 border-black bg-red-200"></span> <span>Chưa thanh toán</span></div></div></div> `);
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
