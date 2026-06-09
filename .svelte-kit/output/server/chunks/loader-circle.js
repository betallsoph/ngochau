import { v as spread_props } from "./index-server.js";
import { t as Icon } from "./Icon.js";
//#region node_modules/@lucide/svelte/dist/icons/loader-circle.svelte
function Loader_circle($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "loader-circle" },
		props,
		{ iconNode: [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]] }
	]));
}
//#endregion
export { Loader_circle as t };
