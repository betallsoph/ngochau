import { u as derived } from "../../../../chunks/index-server.js";
import "../../../../chunks/dist.js";
import { t as Loader_circle } from "../../../../chunks/loader-circle.js";
import "../../../../chunks/user.js";
import "../../../../chunks/wrench.js";
//#region src/routes/dashboard/requests/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let requests = [];
		let statusFilter = "";
		let priorityFilter = "";
		derived(() => () => {
			return requests.filter((req) => {
				return true;
			});
		});
		$$renderer.push(`<div class="space-y-6"><div><h1 class="text-2xl font-black text-black">Báo Cáo Sự Cố</h1> <p class="text-zinc-650 text-sm mt-1 font-bold">Quản lý và giải quyết các yêu cầu sửa chữa từ khách thuê phòng</p></div> <div class="bg-blue-100 border-2 border-black p-4 rounded-lg shadow-secondary flex flex-wrap gap-4 items-center"><div class="space-y-1"><span class="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Trạng thái sự cố</span> `);
		$$renderer.select({
			value: statusFilter,
			class: "border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black w-44"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Tất cả trạng thái`);
			});
			$$renderer.option({ value: "pending" }, ($$renderer) => {
				$$renderer.push(`Đang chờ (Pending)`);
			});
			$$renderer.option({ value: "in_progress" }, ($$renderer) => {
				$$renderer.push(`Đang sửa (In Progress)`);
			});
			$$renderer.option({ value: "completed" }, ($$renderer) => {
				$$renderer.push(`Đã xong (Completed)`);
			});
			$$renderer.option({ value: "rejected" }, ($$renderer) => {
				$$renderer.push(`Từ chối (Rejected)`);
			});
		});
		$$renderer.push(`</div> <div class="space-y-1"><span class="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Mức độ khẩn cấp</span> `);
		$$renderer.select({
			value: priorityFilter,
			class: "border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black w-44"
		}, ($$renderer) => {
			$$renderer.option({ value: "" }, ($$renderer) => {
				$$renderer.push(`Tất cả`);
			});
			$$renderer.option({ value: "important" }, ($$renderer) => {
				$$renderer.push(`Khẩn cấp / Gấp`);
			});
			$$renderer.option({ value: "normal" }, ($$renderer) => {
				$$renderer.push(`Bình thường`);
			});
		});
		$$renderer.push(`</div></div> `);
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
