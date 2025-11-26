import { isBrowser } from "./is-browser";

declare global {
	interface Window {
		env: {
			SUPABASE_URL: string;
			SUPABASE_ANON_KEY: string;
		};
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			SUPABASE_URL: string;
			SUPABASE_SERVICE_ROLE_KEY: string;
			VERCEL_URL?: string;
			SERVER_URL?: string;
			SUPABASE_ANON_KEY: string;
			SUPABASE_JWT_SECRET: string;
		}
	}
}

type EnvOptions = {
	isSecret?: boolean;
	isRequired?: boolean;
};
function getEnv(
	name: string,
	{ isRequired, isSecret }: EnvOptions = { isSecret: true, isRequired: true },
) {
	if (isBrowser && isSecret) return "";

	const source = (isBrowser ? window.env : process.env) ?? {};

	const value = source[name as keyof typeof source];

	if (!value && isRequired) {
		throw new Error(`${name} is not set`);
	}

	return value;
}

/**
 * Server env
 */
// Use VERCEL_URL on Vercel (add https://), fallback to SERVER_URL for local dev
const vercelUrl = getEnv("VERCEL_URL", { isRequired: false });
export const SERVER_URL = vercelUrl
	? `https://${vercelUrl}`
	: getEnv("SERVER_URL", { isRequired: false }) || "http://localhost:3000";

export const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
export const SUPABASE_JWT_SECRET = getEnv("SUPABASE_JWT_SECRET");

/**
 * Shared envs
 */
export const NODE_ENV = getEnv("NODE_ENV", {
	isSecret: false,
	isRequired: false,
});
export const SUPABASE_URL = getEnv("SUPABASE_URL", { isSecret: false });
export const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY", {
	isSecret: false,
});


export const getSupabaseServiceRole = () => {
	if (isBrowser)
		throw new Error("SUPABASE_SERVICE_ROLE_KEY is not available in browser");
	return getEnv("SUPABASE_SERVICE_ROLE_KEY");
};

export function getBrowserEnv() {
	return {
		SUPABASE_URL,
		SUPABASE_ANON_KEY,
	};
}
