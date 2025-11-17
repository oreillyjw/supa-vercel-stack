/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	// @ts-expect-error - vite version mismatch between vitest and vite
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./test/unit/setup-test-env.ts"],
		includeSource: ["app/**/*.{js,ts}"],
		exclude: ["node_modules", "mocks/**/*.{js,ts}"],
		coverage: {
			reporter: ["text", "json", "html"],
			include: ["app/**/*.{js,ts}"],
			all: true,
		},
	},
});
