import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/user.svelte
function User($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "user" },
		props,
		{ iconNode: [["path", { "d": "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ["circle", {
			"cx": "12",
			"cy": "7",
			"r": "4"
		}]] }
	]));
}
//#endregion
export { User as t };
