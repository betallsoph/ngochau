import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/circle-check.svelte
function Circle_check($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "circle-check" },
		props,
		{ iconNode: [["circle", {
			"cx": "12",
			"cy": "12",
			"r": "10"
		}], ["path", { "d": "m9 12 2 2 4-4" }]] }
	]));
}
//#endregion
export { Circle_check as t };
