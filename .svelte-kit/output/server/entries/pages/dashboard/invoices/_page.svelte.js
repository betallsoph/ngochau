import { Z as attr, u as derived } from "../../../../chunks/index-server.js";
import "../../../../chunks/dist.js";
import "../../../../chunks/Icon.js";
import { t as Arrow_right } from "../../../../chunks/arrow-right.js";
import { t as Loader_circle } from "../../../../chunks/loader-circle.js";
import "../../../../chunks/receipt.js";
//#endregion
//#region src/routes/dashboard/invoices/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let invoices = [];
		let statusFilter = "";
		let monthFilter = "";
		let searchRoom = "";
		derived(() => () => {
			return invoices.filter((inv) => {
				return true;
			});
		});
		$$renderer.push(`<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 class="text-xl sm:text-2xl font-black text-black leading-none">Quản Lý Hóa Đơn</h1> <p class="text-zinc-500 text-xs sm:text-sm mt-1 font-bold">Lịch sử xuất hóa đơn và đối soát thanh toán</p></div> <a href="/dashboard/invoices/bulk" class="bg-blue-300 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-sm w-full sm:w-auto">Tạo hóa đơn loạt `);
		Arrow_right($$renderer, { class: "h-4 w-4" });
		$$renderer.push(`<!----></a></div> <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary grid gap-4 sm:grid-cols-3 items-end"><div class="space-y-1"><span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Trạng thái thanh toán</span> `);
		$$renderer.select({
			value: statusFilter,
			class: "w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Tất cả hóa đơn`);
			});
			$$renderer.option({ value: "pending" }, ($$renderer) => {
				$$renderer.push(`Chưa thanh toán`);
			});
			$$renderer.option({ value: "paid" }, ($$renderer) => {
				$$renderer.push(`Đã thanh toán`);
			});
			$$renderer.option({ value: "overdue" }, ($$renderer) => {
				$$renderer.push(`Trễ hạn`);
			});
		});
		$$renderer.push(`</div> <div class="space-y-1"><span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Lọc theo Tháng</span> <input type="month"${attr("value", monthFilter)} class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"/></div> <div class="space-y-1"><span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Tìm theo số phòng/tên khách</span> <input type="text"${attr("value", searchRoom)} placeholder="Nhập 101, A2, Tên khách..." class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"/></div></div> `);
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<div class="h-[50vh] w-full flex items-center justify-center">`);
		Loader_circle($$renderer, { class: "h-10 w-10 text-black animate-spin" });
		$$renderer.push(`<!----></div>`);
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
export { _page as default };
