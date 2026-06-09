import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/users.svelte
function Users($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "users" },
		props,
		{ iconNode: [
			["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
			["path", { "d": "M16 3.128a4 4 0 0 1 0 7.744" }],
			["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }],
			["circle", {
				"cx": "9",
				"cy": "7",
				"r": "4"
			}]
		] }
	]));
}
//#endregion
export { Users as t };
