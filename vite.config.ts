import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";


declare module "@remix-run/node" {
	// or cloudflare, deno, etc.
	interface Future {
		v3_singleFetch: true;
	}
}

export default defineConfig({
	plugins: [
		remix({
			presets: [vercelPreset()],
			ignoredRouteFiles: ["**/.*"],
			future: {
				unstable_optimizeDeps: true,
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				v3_lazyRouteDiscovery: true,
				v3_singleFetch: true,
			},
		}),
		tsconfigPaths(),
	],
	server: {
		port: 3000,
		watch: {
			// Watch Tailwind config for changes
			ignored: ["!**/tailwind.config.ts"],
		},
	},
	ssr: {
		noExternal: ["remix-i18next"],
	},
	optimizeDeps: {
		exclude: ["i18next-fs-backend"],
	},
});
