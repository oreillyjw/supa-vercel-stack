/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()] as any,
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./test/unit/setup-test-env.ts"],
		includeSource: ["app/**/*.{js,ts}"],
		exclude: ["node_modules", "mocks/**/*.{js,ts}", "test/e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["app/**/*.{js,ts}"],
			all: true,
		},
		pool: "forks",
	},
});
