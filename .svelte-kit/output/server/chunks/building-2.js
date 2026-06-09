import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/building-2.svelte
function Building_2($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "building-2" },
		props,
		{ iconNode: [
			["path", { "d": "M10 12h4" }],
			["path", { "d": "M10 8h4" }],
			["path", { "d": "M14 21v-3a2 2 0 0 0-4 0v3" }],
			["path", { "d": "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" }],
			["path", { "d": "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" }]
		] }
	]));
}
//#endregion
export { Building_2 as t };
