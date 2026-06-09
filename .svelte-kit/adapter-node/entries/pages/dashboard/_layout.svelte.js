import { u as derived } from "../../../chunks/index-server.js";
import "../../../chunks/dist.js";
import "../../../chunks/client.js";
import { t as page } from "../../../chunks/state.js";
import "../../../chunks/navigation.js";
import "../../../chunks/Icon.js";
import "../../../chunks/bell.js";
import "../../../chunks/building-2.js";
import "../../../chunks/house.js";
import "../../../chunks/log-out.js";
import "../../../chunks/receipt.js";
import "../../../chunks/user.js";
import "../../../chunks/users.js";
import "../../../chunks/wrench.js";
//#endregion
//#region src/routes/dashboard/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		derived(() => page.url.pathname);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _layout as default };
