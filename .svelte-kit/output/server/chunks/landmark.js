import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/landmark.svelte
function Landmark($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "landmark" },
		props,
		{ iconNode: [
			["path", { "d": "M10 18v-7" }],
			["path", { "d": "M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z" }],
			["path", { "d": "M14 18v-7" }],
			["path", { "d": "M18 18v-7" }],
			["path", { "d": "M3 22h18" }],
			["path", { "d": "M6 18v-7" }]
		] }
	]));
}
//#endregion
export { Landmark as t };
