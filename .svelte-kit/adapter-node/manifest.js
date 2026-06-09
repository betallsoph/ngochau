export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["fonts/GoogleSansOTF/GoogleSans-Bold.otf","fonts/GoogleSansOTF/GoogleSans-BoldItalic.otf","fonts/GoogleSansOTF/GoogleSans-Italic.otf","fonts/GoogleSansOTF/GoogleSans-Medium.otf","fonts/GoogleSansOTF/GoogleSans-MediumItalic.otf","fonts/GoogleSansOTF/GoogleSans-Regular.otf","robots.txt"]),
	mimeTypes: {".otf":"font/otf",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Cpyjy7fp.js",app:"_app/immutable/entry/app.BnJwwWmh.js",imports:["_app/immutable/entry/start.Cpyjy7fp.js","_app/immutable/chunks/CFWKCLjI.js","_app/immutable/chunks/Bj-fpdES.js","_app/immutable/chunks/CMvHMrSq.js","_app/immutable/entry/app.BnJwwWmh.js","_app/immutable/chunks/Bj-fpdES.js","_app/immutable/chunks/kNaey6uv.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/announcements",
				pattern: /^\/api\/announcements\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/announcements/_server.ts.js'))
			},
			{
				id: "/api/auth",
				pattern: /^\/api\/auth\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/_server.ts.js'))
			},
			{
				id: "/api/dashboard/stats",
				pattern: /^\/api\/dashboard\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/dashboard/stats/_server.ts.js'))
			},
			{
				id: "/api/invoices",
				pattern: /^\/api\/invoices\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/invoices/_server.ts.js'))
			},
			{
				id: "/api/invoices/bulk",
				pattern: /^\/api\/invoices\/bulk\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/invoices/bulk/_server.ts.js'))
			},
			{
				id: "/api/invoices/[id]",
				pattern: /^\/api\/invoices\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/invoices/_id_/_server.ts.js'))
			},
			{
				id: "/api/notifications",
				pattern: /^\/api\/notifications\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/notifications/_server.ts.js'))
			},
			{
				id: "/api/properties",
				pattern: /^\/api\/properties\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/properties/_server.ts.js'))
			},
			{
				id: "/api/requests",
				pattern: /^\/api\/requests\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/requests/_server.ts.js'))
			},
			{
				id: "/api/rooms",
				pattern: /^\/api\/rooms\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/rooms/_server.ts.js'))
			},
			{
				id: "/api/services",
				pattern: /^\/api\/services\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/services/_server.ts.js'))
			},
			{
				id: "/api/settings",
				pattern: /^\/api\/settings\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/settings/_server.ts.js'))
			},
			{
				id: "/api/super-admin",
				pattern: /^\/api\/super-admin\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/super-admin/_server.ts.js'))
			},
			{
				id: "/api/tenants",
				pattern: /^\/api\/tenants\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/tenants/_server.ts.js'))
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/dashboard/buildings",
				pattern: /^\/dashboard\/buildings\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/dashboard/invoices",
				pattern: /^\/dashboard\/invoices\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/dashboard/invoices/bulk",
				pattern: /^\/dashboard\/invoices\/bulk\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/dashboard/notifications",
				pattern: /^\/dashboard\/notifications\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/dashboard/requests",
				pattern: /^\/dashboard\/requests\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/dashboard/rooms",
				pattern: /^\/dashboard\/rooms\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/dashboard/settings",
				pattern: /^\/dashboard\/settings\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/dashboard/tenants",
				pattern: /^\/dashboard\/tenants\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/super-admin",
				pattern: /^\/super-admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/tenant",
				pattern: /^\/tenant\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const prerendered = new Set([]);

export const base = "";