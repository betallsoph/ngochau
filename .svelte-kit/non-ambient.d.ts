
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/announcements" | "/api/auth" | "/api/dashboard" | "/api/dashboard/stats" | "/api/invoices" | "/api/invoices/bulk" | "/api/invoices/[id]" | "/api/notifications" | "/api/properties" | "/api/requests" | "/api/rooms" | "/api/services" | "/api/settings" | "/api/super-admin" | "/api/tenants" | "/dashboard" | "/dashboard/buildings" | "/dashboard/invoices" | "/dashboard/invoices/bulk" | "/dashboard/notifications" | "/dashboard/requests" | "/dashboard/rooms" | "/dashboard/settings" | "/dashboard/tenants" | "/login" | "/super-admin" | "/tenant";
		RouteParams(): {
			"/api/invoices/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string | undefined };
			"/api": { id?: string | undefined };
			"/api/announcements": Record<string, never>;
			"/api/auth": Record<string, never>;
			"/api/dashboard": Record<string, never>;
			"/api/dashboard/stats": Record<string, never>;
			"/api/invoices": { id?: string | undefined };
			"/api/invoices/bulk": Record<string, never>;
			"/api/invoices/[id]": { id: string };
			"/api/notifications": Record<string, never>;
			"/api/properties": Record<string, never>;
			"/api/requests": Record<string, never>;
			"/api/rooms": Record<string, never>;
			"/api/services": Record<string, never>;
			"/api/settings": Record<string, never>;
			"/api/super-admin": Record<string, never>;
			"/api/tenants": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/dashboard/buildings": Record<string, never>;
			"/dashboard/invoices": Record<string, never>;
			"/dashboard/invoices/bulk": Record<string, never>;
			"/dashboard/notifications": Record<string, never>;
			"/dashboard/requests": Record<string, never>;
			"/dashboard/rooms": Record<string, never>;
			"/dashboard/settings": Record<string, never>;
			"/dashboard/tenants": Record<string, never>;
			"/login": Record<string, never>;
			"/super-admin": Record<string, never>;
			"/tenant": Record<string, never>
		};
		Pathname(): "/" | "/api/announcements" | "/api/auth" | "/api/dashboard/stats" | "/api/invoices" | "/api/invoices/bulk" | `/api/invoices/${string}` & {} | "/api/notifications" | "/api/properties" | "/api/requests" | "/api/rooms" | "/api/services" | "/api/settings" | "/api/super-admin" | "/api/tenants" | "/dashboard" | "/dashboard/buildings" | "/dashboard/invoices" | "/dashboard/invoices/bulk" | "/dashboard/notifications" | "/dashboard/requests" | "/dashboard/rooms" | "/dashboard/settings" | "/dashboard/tenants" | "/login" | "/super-admin" | "/tenant";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/fonts/GoogleSansOTF/GoogleSans-Bold.otf" | "/fonts/GoogleSansOTF/GoogleSans-BoldItalic.otf" | "/fonts/GoogleSansOTF/GoogleSans-Italic.otf" | "/fonts/GoogleSansOTF/GoogleSans-Medium.otf" | "/fonts/GoogleSansOTF/GoogleSans-MediumItalic.otf" | "/fonts/GoogleSansOTF/GoogleSans-Regular.otf" | "/robots.txt" | string & {};
	}
}