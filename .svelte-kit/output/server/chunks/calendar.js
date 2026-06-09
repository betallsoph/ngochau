import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/calendar.svelte
function Calendar($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "calendar" },
		props,
		{ iconNode: [
			["path", { "d": "M8 2v4" }],
			["path", { "d": "M16 2v4" }],
			["rect", {
				"width": "18",
				"height": "18",
				"x": "3",
				"y": "4",
				"rx": "2"
			}],
			["path", { "d": "M3 10h18" }]
		] }
	]));
}
//#endregion
export { Calendar as t };
