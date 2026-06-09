import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/dollar-sign.svelte
function Dollar_sign($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "dollar-sign" },
		props,
		{ iconNode: [["line", {
			"x1": "12",
			"x2": "12",
			"y1": "2",
			"y2": "22"
		}], ["path", { "d": "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }]] }
	]));
}
//#endregion
export { Dollar_sign as t };
