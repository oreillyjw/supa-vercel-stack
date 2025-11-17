import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		remix({
			presets: [vercelPreset()],
			ignoredRouteFiles: ["**/.*"],
		}),
		tsconfigPaths(),
	],
	server: {
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
