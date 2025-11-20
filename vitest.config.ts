/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	// @ts-expect-error - vitest uses a different version of vite internally
	plugins: [react()],
	resolve: {
		alias: {
			"~": new URL("./app", import.meta.url).pathname,
			"mocks": new URL("./mocks", import.meta.url).pathname,
		},
	},
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./test/unit/setup-test-env.ts"],
		includeSource: ["app/**/*.{js,ts}"],
		exclude: ["node_modules", "mocks/**/*.{js,ts}", "test/e2e/**"],
		coverage: {
			reporter: ["text", "json", "html"],
			include: ["app/**/*.{js,ts}"],
			all: true,
		},
	},
});
