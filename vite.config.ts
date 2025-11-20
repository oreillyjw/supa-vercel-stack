import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [reactRouter(), tsconfigPaths()],
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
