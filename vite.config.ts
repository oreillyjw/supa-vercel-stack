import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
	plugins: [
		reactRouter(),
		tsconfigPaths(),
		{
			name: "server-only-files",
			resolveId(id, importer, options) {
				if (
					id.includes("service.server") ||
					id.includes("session.server") ||
					id.includes(".server.ts") ||
					id.includes(".server.tsx")
				) {
					if (options?.ssr === false) {
						return { id: "virtual:empty", external: false };
					}
				}
				return null;
			},
			load(id) {
				if (id === "virtual:empty") {
					return "export {}";
				}
				return null;
			},
		},
		{
			name: "ts-file-resolver",
			enforce: "pre",
			resolveId(source) {
				// Handle the supabase client specifically to ensure .ts extension is found
				if (source === "~/integrations/supabase/client") {
					return path.resolve(
						__dirname,
						"./app/integrations/supabase/client.ts",
					);
				}
				return null;
			},
		},
	],
	server: {
		port: 3000,
		watch: {
			// Watch Tailwind config for changes
			ignored: ["!**/tailwind.config.ts"],
		},
	},
	ssr: {
		noExternal: ["remix-i18next/react", "@supabase/supabase-js"],
	},
	optimizeDeps: {
		exclude: ["i18next-fs-backend"],
		include: [
			"remix-i18next/react",
			"react",
			"react-dom",
			"react-i18next",
			"@supabase/supabase-js",
			"@supabase/postgrest-js",
			"tailwind-merge",
		],
		force: true,
		esbuildOptions: {
			target: "esnext",
		},
	},
	define: {
		"process.env.SERVER_URL": JSON.stringify(
			process.env.SERVER_URL || process.env.VERCEL_URL,
		)
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		},
	},
});
