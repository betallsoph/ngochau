import { $ as escape_html, L as get, Q as clsx, Z as attr, _ as slot, b as unsubscribe_stores, c as attributes, f as ensure_array_like, g as sanitize_props, h as rest_props, l as bind_props, n as onDestroy, o as attr_class, ot as fallback, s as attr_style, v as spread_props, y as store_get, z as writable } from "./index-server.js";
import "./index-server2.js";
//#region node_modules/svelte-sonner/dist/Icon.svelte
function Icon($$renderer, $$props) {
	let type = fallback($$props["type"], "success");
	if (type === "success") {
		$$renderer.push("<!--[0-->");
		$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>`);
	} else if (type === "error") {
		$$renderer.push("<!--[1-->");
		$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`);
	} else if (type === "info") {
		$$renderer.push("<!--[2-->");
		$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"></path></svg>`);
	} else if (type === "warning") {
		$$renderer.push("<!--[3-->");
		$$renderer.push(`<svg viewBox="0 0 64 64" fill="currentColor" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M32.427,7.987c2.183,0.124 4,1.165 5.096,3.281l17.936,36.208c1.739,3.66 -0.954,8.585 -5.373,8.656l-36.119,0c-4.022,-0.064 -7.322,-4.631 -5.352,-8.696l18.271,-36.207c0.342,-0.65 0.498,-0.838 0.793,-1.179c1.186,-1.375 2.483,-2.111 4.748,-2.063Zm-0.295,3.997c-0.687,0.034 -1.316,0.419 -1.659,1.017c-6.312,11.979 -12.397,24.081 -18.301,36.267c-0.546,1.225 0.391,2.797 1.762,2.863c12.06,0.195 24.125,0.195 36.185,0c1.325,-0.064 2.321,-1.584 1.769,-2.85c-5.793,-12.184 -11.765,-24.286 -17.966,-36.267c-0.366,-0.651 -0.903,-1.042 -1.79,-1.03Z"></path><path d="M33.631,40.581l-3.348,0l-0.368,-16.449l4.1,0l-0.384,16.449Zm-3.828,5.03c0,-0.609 0.197,-1.113 0.592,-1.514c0.396,-0.4 0.935,-0.601 1.618,-0.601c0.684,0 1.223,0.201 1.618,0.601c0.395,0.401 0.593,0.905 0.593,1.514c0,0.587 -0.193,1.078 -0.577,1.473c-0.385,0.395 -0.929,0.593 -1.634,0.593c-0.705,0 -1.249,-0.198 -1.634,-0.593c-0.384,-0.395 -0.576,-0.886 -0.576,-1.473Z"></path></svg>`);
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]-->`);
	bind_props($$props, { type });
}
//#endregion
//#region node_modules/svelte-sonner/dist/Loader.svelte
function Loader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let visible = $$props["visible"];
		const bars = Array(12).fill(0);
		$$renderer.push(`<div class="sonner-loading-wrapper"${attr("data-visible", visible)}><div class="sonner-spinner"><!--[-->`);
		const each_array = ensure_array_like(bars);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			each_array[i];
			$$renderer.push(`<div class="sonner-loading-bar"></div>`);
		}
		$$renderer.push(`<!--]--></div></div>`);
		bind_props($$props, { visible });
	});
}
//#endregion
//#region node_modules/svelte-sonner/dist/internal/helpers.js
function cn(...classes) {
	return classes.filter(Boolean).join(" ");
}
var isBrowser = typeof document !== "undefined";
/**
* A custom store that only allows setting/updating the value from the
* browser to avoid SSR data leaks. By defining this helper, we don't
* have to worry about checking for `isBrowser` in every place we
* mutate the various stores.
*
* This should only ever be initialized with an empty array or object,
* as otherwise the initial value will persist across requests.
*/
function clientWritable(initialValue) {
	const store = writable(initialValue);
	function set(value) {
		if (isBrowser) store.set(value);
	}
	function update(updater) {
		if (isBrowser) store.update(updater);
	}
	return {
		subscribe: store.subscribe,
		set,
		update
	};
}
//#endregion
//#region node_modules/svelte-sonner/dist/state.js
var toastsCounter = 0;
function createToastState() {
	const toasts = clientWritable([]);
	const heights = clientWritable([]);
	function addToast(data) {
		toasts.update((prev) => [data, ...prev]);
	}
	function create(data) {
		const { message, ...rest } = data;
		const id = typeof data?.id === "number" || data.id && data.id?.length > 0 ? data.id : toastsCounter++;
		const dismissable = data.dismissable === void 0 ? true : data.dismissable;
		const type = data.type === void 0 ? "default" : data.type;
		if (get(toasts).find((toast) => {
			return toast.id === id;
		})) toasts.update((prev) => prev.map((toast) => {
			if (toast.id === id) return {
				...toast,
				...data,
				id,
				title: message,
				dismissable,
				type,
				updated: true
			};
			return {
				...toast,
				updated: false
			};
		}));
		else addToast({
			...rest,
			id,
			title: message,
			dismissable,
			type
		});
		return id;
	}
	function dismiss(id) {
		if (id === void 0) {
			toasts.update((prev) => prev.map((toast) => ({
				...toast,
				dismiss: true
			})));
			return;
		}
		toasts.update((prev) => prev.map((toast) => toast.id === id ? {
			...toast,
			dismiss: true
		} : toast));
		return id;
	}
	function remove(id) {
		if (id === void 0) {
			toasts.set([]);
			return;
		}
		toasts.update((prev) => prev.filter((toast) => toast.id !== id));
		return id;
	}
	function message(message, data) {
		return create({
			...data,
			type: "default",
			message
		});
	}
	function error(message, data) {
		return create({
			...data,
			type: "error",
			message
		});
	}
	function success(message, data) {
		return create({
			...data,
			type: "success",
			message
		});
	}
	function info(message, data) {
		return create({
			...data,
			type: "info",
			message
		});
	}
	function warning(message, data) {
		return create({
			...data,
			type: "warning",
			message
		});
	}
	function loading(message, data) {
		return create({
			...data,
			type: "loading",
			message
		});
	}
	function promise(promise, data) {
		if (!data) return;
		let id = void 0;
		if (data.loading !== void 0) id = create({
			...data,
			promise,
			type: "loading",
			message: data.loading
		});
		const p = promise instanceof Promise ? promise : promise();
		let shouldDismiss = id !== void 0;
		p.then((response) => {
			if (response && typeof response.ok === "boolean" && !response.ok) {
				shouldDismiss = false;
				const message = typeof data.error === "function" ? data.error(`HTTP error! status: ${response.status}`) : data.error;
				create({
					id,
					type: "error",
					message
				});
			} else if (data.success !== void 0) {
				shouldDismiss = false;
				const message = typeof data.success === "function" ? data.success(response) : data.success;
				create({
					id,
					type: "success",
					message
				});
			}
		}).catch((error) => {
			if (data.error !== void 0) {
				shouldDismiss = false;
				const message = typeof data.error === "function" ? data.error(error) : data.error;
				create({
					id,
					type: "error",
					message
				});
			}
		}).finally(() => {
			if (shouldDismiss) {
				dismiss(id);
				id = void 0;
			}
			data.finally?.();
		});
		return id;
	}
	function custom(component, data) {
		const id = data?.id || toastsCounter++;
		create({
			component,
			id,
			...data
		});
		return id;
	}
	function removeHeight(id) {
		heights.update((prev) => prev.filter((height) => height.toastId !== id));
	}
	function setHeight(data) {
		if (get(heights).find((el) => el.toastId === data.toastId) === void 0) {
			heights.update((prev) => [data, ...prev]);
			return;
		}
		heights.update((prev) => prev.map((el) => {
			if (el.toastId === data.toastId) return data;
			else return el;
		}));
	}
	function reset() {
		toasts.set([]);
		heights.set([]);
	}
	return {
		create,
		addToast,
		dismiss,
		remove,
		message,
		error,
		success,
		info,
		warning,
		loading,
		promise,
		custom,
		removeHeight,
		setHeight,
		reset,
		toasts,
		heights
	};
}
var toastState = createToastState();
function toastFunction(message, data) {
	return toastState.create({
		message,
		...data
	});
}
var toast = Object.assign(toastFunction, {
	success: toastState.success,
	info: toastState.info,
	warning: toastState.warning,
	error: toastState.error,
	custom: toastState.custom,
	message: toastState.message,
	promise: toastState.promise,
	dismiss: toastState.dismiss,
	loading: toastState.loading
});
var useEffect = (subscribe) => ({ subscribe });
//#endregion
//#region node_modules/svelte-sonner/dist/Toast.svelte
function Toast($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let isFront, isVisible, toastType, toastClass, toastDescriptionClass, heightIndex, coords, toastsHeightBefore, disabled, isPromiseLoadingOrInfiniteDuration;
		const TOAST_LIFETIME = 4e3;
		const GAP = 14;
		const TIME_BEFORE_UNMOUNT = 200;
		const defaultClasses = {
			toast: "",
			title: "",
			description: "",
			loader: "",
			closeButton: "",
			cancelButton: "",
			actionButton: "",
			action: "",
			warning: "",
			error: "",
			success: "",
			default: "",
			info: "",
			loading: ""
		};
		const { toasts, heights, removeHeight, setHeight, remove } = toastState;
		let toast = $$props["toast"];
		let index = $$props["index"];
		let expanded = $$props["expanded"];
		let invert = $$props["invert"];
		let position = $$props["position"];
		let visibleToasts = $$props["visibleToasts"];
		let expandByDefault = $$props["expandByDefault"];
		let closeButton = $$props["closeButton"];
		let interacting = $$props["interacting"];
		let cancelButtonStyle = fallback($$props["cancelButtonStyle"], "");
		let actionButtonStyle = fallback($$props["actionButtonStyle"], "");
		let duration = fallback($$props["duration"], 4e3);
		let descriptionClass = fallback($$props["descriptionClass"], "");
		let classes = fallback($$props["classes"], () => ({}), true);
		let unstyled = fallback($$props["unstyled"], false);
		let mounted = false;
		let removed = false;
		let swiping = false;
		let swipeOut = false;
		let offsetBeforeRemove = 0;
		let initialHeight = 0;
		let offset = 0;
		let closeTimerStartTimeRef = 0;
		let lastCloseTimerStartTimeRef = 0;
		async function updateHeights() {}
		function deleteToast() {
			removed = true;
			offsetBeforeRemove = offset;
			removeHeight(toast.id);
			setTimeout(() => {
				remove(toast.id);
			}, TIME_BEFORE_UNMOUNT);
		}
		let timeoutId;
		let remainingTime = toast.duration || duration || TOAST_LIFETIME;
		function pauseTimer() {
			if (lastCloseTimerStartTimeRef < closeTimerStartTimeRef) {
				const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - closeTimerStartTimeRef;
				remainingTime = remainingTime - elapsedTime;
			}
			lastCloseTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
		}
		function startTimer() {
			closeTimerStartTimeRef = (/* @__PURE__ */ new Date()).getTime();
			timeoutId = setTimeout(() => {
				toast.onAutoClose?.(toast);
				deleteToast();
			}, remainingTime);
		}
		/**
		* Hacky useEffect impl.
		* https://github.com/sveltejs/svelte/issues/5283#issuecomment-678759305
		*/
		let effect;
		$: classes = {
			...defaultClasses,
			...classes
		};
		$: isFront = index === 0;
		$: isVisible = index + 1 <= visibleToasts;
		$: toast.title;
		$: toast.description;
		$: toastType = toast.type;
		$: toastClass = toast.class || "";
		$: toastDescriptionClass = toast.descriptionClass || "";
		$: heightIndex = store_get($$store_subs ??= {}, "$heights", heights).findIndex((height) => height.toastId === toast.id) || 0;
		$: coords = position.split("-");
		$: toastsHeightBefore = store_get($$store_subs ??= {}, "$heights", heights).reduce((prev, curr, reducerIndex) => {
			if (reducerIndex >= heightIndex) return prev;
			return prev + curr.height;
		}, 0);
		$: invert = toast.invert || invert;
		$: disabled = toastType === "loading";
		$: offset = Math.round(heightIndex * GAP + toastsHeightBefore);
		$: updateHeights();
		$: if (toast.updated) {
			clearTimeout(timeoutId);
			remainingTime = toast.duration || duration || TOAST_LIFETIME;
			startTimer();
		}
		$: isPromiseLoadingOrInfiniteDuration = toast.promise && toastType === "loading" || toast.duration === Number.POSITIVE_INFINITY;
		$: effect = useEffect(() => {
			if (!isPromiseLoadingOrInfiniteDuration) if (expanded || interacting) pauseTimer();
			else startTimer();
			return () => clearTimeout(timeoutId);
		});
		$: store_get($$store_subs ??= {}, "$effect", effect);
		$: if (toast.delete) deleteToast();
		$$renderer.push(`<li${attr("aria-live", toast.important ? "assertive" : "polite")} aria-atomic="true" role="status"${attr("tabindex", 0)}${attr_class(clsx(cn($$sanitized_props.class, toastClass, classes?.toast, toast?.classes?.toast, classes?.[toastType], toast?.classes?.[toastType])))} data-sonner-toast=""${attr("data-styled", !(toast.component || toast?.unstyled || unstyled))}${attr("data-mounted", mounted)}${attr("data-promise", Boolean(toast.promise))}${attr("data-removed", removed)}${attr("data-visible", isVisible)}${attr("data-y-position", coords[0])}${attr("data-x-position", coords[1])}${attr("data-index", index)}${attr("data-front", isFront)}${attr("data-swiping", swiping)}${attr("data-type", toastType)}${attr("data-invert", invert)}${attr("data-swipe-out", swipeOut)}${attr("data-expanded", Boolean(expanded || expandByDefault && mounted))}${attr_style(`${$$sanitized_props.style} ${toast.style}`, {
			"--index": index,
			"--toasts-before": index,
			"--z-index": store_get($$store_subs ??= {}, "$toasts", toasts).length - index,
			"--offset": `${removed ? offsetBeforeRemove : offset}px`,
			"--initial-height": `${initialHeight}px`
		})}>`);
		if (closeButton && !toast.component) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<button aria-label="Close toast"${attr("data-disabled", disabled)} data-close-button=""${attr_class(clsx(cn(classes?.closeButton, toast?.classes?.closeButton)))}><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		if (toast.component) {
			$$renderer.push("<!--[0-->");
			if (toast.component) {
				$$renderer.push("<!--[-->");
				toast.component($$renderer, spread_props([toast.componentProps]));
				$$renderer.push("<!--]-->");
			} else {
				$$renderer.push("<!--[!-->");
				$$renderer.push("<!--]-->");
			}
		} else {
			$$renderer.push("<!--[-1-->");
			if (toastType !== "default" || toast.icon || toast.promise) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div data-icon="">`);
				if ((toast.promise || toastType === "loading") && !toast.icon) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<!--[-->`);
					slot($$renderer, $$props, "loading-icon", {}, null);
					$$renderer.push(`<!--]-->`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				if (toast.icon) {
					$$renderer.push("<!--[0-->");
					if (toast.icon) {
						$$renderer.push("<!--[-->");
						toast.icon($$renderer, {});
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
				} else if (toastType === "success") {
					$$renderer.push("<!--[1-->");
					$$renderer.push(`<!--[-->`);
					slot($$renderer, $$props, "success-icon", {}, null);
					$$renderer.push(`<!--]-->`);
				} else if (toastType === "error") {
					$$renderer.push("<!--[2-->");
					$$renderer.push(`<!--[-->`);
					slot($$renderer, $$props, "error-icon", {}, null);
					$$renderer.push(`<!--]-->`);
				} else if (toastType === "warning") {
					$$renderer.push("<!--[3-->");
					$$renderer.push(`<!--[-->`);
					slot($$renderer, $$props, "warning-icon", {}, null);
					$$renderer.push(`<!--]-->`);
				} else if (toastType === "info") {
					$$renderer.push("<!--[4-->");
					$$renderer.push(`<!--[-->`);
					slot($$renderer, $$props, "info-icon", {}, null);
					$$renderer.push(`<!--]-->`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <div data-content="">`);
			if (toast.title) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div data-title=""${attr_class(clsx(cn(classes?.title, toast?.classes?.title)))}>`);
				if (typeof toast.title !== "string") {
					$$renderer.push("<!--[0-->");
					if (toast.title) {
						$$renderer.push("<!--[-->");
						toast.title($$renderer, spread_props([toast.componentProps]));
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`${escape_html(toast.title)}`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (toast.description) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div data-description=""${attr_class(clsx(cn(descriptionClass, toastDescriptionClass, classes?.description, toast.classes?.description)))}>`);
				if (typeof toast.description !== "string") {
					$$renderer.push("<!--[0-->");
					if (toast.description) {
						$$renderer.push("<!--[-->");
						toast.description($$renderer, spread_props([toast.componentProps]));
						$$renderer.push("<!--]-->");
					} else {
						$$renderer.push("<!--[!-->");
						$$renderer.push("<!--]-->");
					}
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`${escape_html(toast.description)}`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			if (toast.cancel) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button data-button="" data-cancel=""${attr_style(cancelButtonStyle)}${attr_class(clsx(cn(classes?.cancelButton, toast?.classes?.cancelButton)))}>${escape_html(toast.cancel.label)}</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> `);
			if (toast.action) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button data-button=""${attr_style(actionButtonStyle)}${attr_class(clsx(cn(classes?.actionButton, toast?.classes?.actionButton)))}>${escape_html(toast.action.label)}</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></li>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
		bind_props($$props, {
			toast,
			index,
			expanded,
			invert,
			position,
			visibleToasts,
			expandByDefault,
			closeButton,
			interacting,
			cancelButtonStyle,
			actionButtonStyle,
			duration,
			descriptionClass,
			classes,
			unstyled
		});
	});
}
//#endregion
//#region node_modules/svelte-sonner/dist/Toaster.svelte
function Toaster($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);
	const $$restProps = rest_props($$sanitized_props, [
		"invert",
		"theme",
		"position",
		"hotkey",
		"containerAriaLabel",
		"richColors",
		"expand",
		"duration",
		"visibleToasts",
		"closeButton",
		"toastOptions",
		"offset",
		"dir"
	]);
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let possiblePositions, hotkeyLabel;
		const VISIBLE_TOASTS_AMOUNT = 3;
		const VIEWPORT_OFFSET = "32px";
		const TOAST_WIDTH = 356;
		const GAP = 14;
		const DARK = "dark";
		const LIGHT = "light";
		function getInitialTheme(t) {
			if (t !== "system") return t;
			if (typeof window !== "undefined") {
				if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return DARK;
				return LIGHT;
			}
			return LIGHT;
		}
		function getDocumentDirection() {
			if (typeof window === "undefined") return "ltr";
			if (typeof document === "undefined") return "ltr";
			const dirAttribute = document.documentElement.getAttribute("dir");
			if (dirAttribute === "auto" || !dirAttribute) return window.getComputedStyle(document.documentElement).direction;
			return dirAttribute;
		}
		let invert = fallback($$props["invert"], false);
		let theme = fallback($$props["theme"], "light");
		let position = fallback($$props["position"], "bottom-right");
		let hotkey = fallback($$props["hotkey"], () => ["altKey", "KeyT"], true);
		let containerAriaLabel = fallback($$props["containerAriaLabel"], "Notifications");
		let richColors = fallback($$props["richColors"], false);
		let expand = fallback($$props["expand"], false);
		let duration = fallback($$props["duration"], 4e3);
		let visibleToasts = fallback($$props["visibleToasts"], VISIBLE_TOASTS_AMOUNT);
		let closeButton = fallback($$props["closeButton"], false);
		let toastOptions = fallback($$props["toastOptions"], () => ({}), true);
		let offset = fallback($$props["offset"], null);
		let dir = fallback($$props["dir"], getDocumentDirection, true);
		const { toasts, heights, reset } = toastState;
		let expanded = false;
		let interacting = false;
		let actualTheme = getInitialTheme(theme);
		onDestroy(() => {});
		$: possiblePositions = Array.from(new Set([position, ...store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => toast.position).map((toast) => toast.position)].filter(Boolean)));
		$: hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
		$: if (store_get($$store_subs ??= {}, "$toasts", toasts).length <= 1) expanded = false;
		$: {
			const toastsToDismiss = store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => toast.dismiss && !toast.delete);
			if (toastsToDismiss.length > 0) {
				const updatedToasts = store_get($$store_subs ??= {}, "$toasts", toasts).map((toast) => {
					if (toastsToDismiss.find((dismissToast) => dismissToast.id === toast.id)) return {
						...toast,
						delete: true
					};
					return toast;
				});
				toasts.set(updatedToasts);
			}
		}
		$: {
			if (theme !== "system") actualTheme = theme;
			if (typeof window !== "undefined") {
				if (theme === "system") if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) actualTheme = DARK;
				else actualTheme = LIGHT;
				const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
				const changeHandler = ({ matches }) => {
					actualTheme = matches ? DARK : LIGHT;
				};
				if ("addEventListener" in mediaQueryList) mediaQueryList.addEventListener("change", changeHandler);
				else mediaQueryList.addListener(changeHandler);
			}
		}
		if (store_get($$store_subs ??= {}, "$toasts", toasts).length > 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<section${attr("aria-label", `${containerAriaLabel} ${hotkeyLabel}`)}${attr("tabindex", -1)} class="svelte-nbs0zk"><!--[-->`);
			const each_array = ensure_array_like(possiblePositions);
			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let position = each_array[index];
				$$renderer.push(`<ol${attributes({
					tabindex: -1,
					class: clsx($$sanitized_props.class),
					"data-sonner-toaster": true,
					"data-theme": actualTheme,
					"data-rich-colors": richColors,
					dir: dir === "auto" ? getDocumentDirection() : dir,
					"data-y-position": position.split("-")[0],
					"data-x-position": position.split("-")[1],
					style: $$sanitized_props.style,
					...$$restProps
				}, "svelte-nbs0zk", void 0, {
					"--front-toast-height": `${store_get($$store_subs ??= {}, "$heights", heights)[0]?.height}px`,
					"--offset": typeof offset === "number" ? `${offset}px` : offset || VIEWPORT_OFFSET,
					"--width": `${TOAST_WIDTH}px`,
					"--gap": `${GAP}px`
				})}><!--[-->`);
				const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$toasts", toasts).filter((toast) => !toast.position && index === 0 || toast.position === position));
				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let toast = each_array_1[index];
					Toast($$renderer, {
						index,
						toast,
						invert,
						visibleToasts,
						closeButton,
						interacting,
						position,
						expandByDefault: expand,
						expanded,
						actionButtonStyle: toastOptions?.actionButtonStyle || "",
						cancelButtonStyle: toastOptions?.cancelButtonStyle || "",
						class: toastOptions?.class || "",
						descriptionClass: toastOptions?.descriptionClass || "",
						classes: toastOptions.classes || {},
						duration: toastOptions?.duration ?? duration,
						unstyled: toastOptions.unstyled || false,
						$$slots: {
							"loading-icon": ($$renderer) => {
								$$renderer.push(`<!--[-->`);
								slot($$renderer, $$props, "loading-icon", {}, () => {
									Loader($$renderer, { visible: toast.type === "loading" });
								});
								$$renderer.push(`<!--]-->`);
							},
							"success-icon": ($$renderer) => {
								$$renderer.push(`<!--[-->`);
								slot($$renderer, $$props, "success-icon", {}, () => {
									Icon($$renderer, { type: "success" });
								});
								$$renderer.push(`<!--]-->`);
							},
							"error-icon": ($$renderer) => {
								$$renderer.push(`<!--[-->`);
								slot($$renderer, $$props, "error-icon", {}, () => {
									Icon($$renderer, { type: "error" });
								});
								$$renderer.push(`<!--]-->`);
							},
							"warning-icon": ($$renderer) => {
								$$renderer.push(`<!--[-->`);
								slot($$renderer, $$props, "warning-icon", {}, () => {
									Icon($$renderer, { type: "warning" });
								});
								$$renderer.push(`<!--]-->`);
							},
							"info-icon": ($$renderer) => {
								$$renderer.push(`<!--[-->`);
								slot($$renderer, $$props, "info-icon", {}, () => {
									Icon($$renderer, { type: "info" });
								});
								$$renderer.push(`<!--]-->`);
							}
						}
					});
				}
				$$renderer.push(`<!--]--></ol>`);
			}
			$$renderer.push(`<!--]--></section>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
		bind_props($$props, {
			invert,
			theme,
			position,
			hotkey,
			containerAriaLabel,
			richColors,
			expand,
			duration,
			visibleToasts,
			closeButton,
			toastOptions,
			offset,
			dir
		});
	});
}
//#endregion
export { toast as n, Toaster as t };
