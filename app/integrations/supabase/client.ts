import { createClient } from "@supabase/supabase-js";

import {
	getSupabaseServiceRole,
	SUPABASE_URL,
	SUPABASE_ANON_KEY,
} from "~/utils/env";
import { isBrowser } from "~/utils/is-browser";

// ⚠️ cloudflare needs you define fetch option : https://github.com/supabase/supabase-js#custom-fetch-implementation
// Use Remix fetch polyfill for node (See https://remix.run/docs/en/v1/other-api/node)
function getSupabaseClient(supabaseKey: string, accessToken?: string) {
	const global = accessToken
		? {
				global: {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			}
		: {};

	return createClient(SUPABASE_URL, supabaseKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
		...global,
	});
}

/**
 * Provides a Supabase Admin Client with full admin privileges
 *
 * It's a per request scoped client, to prevent access token leaking if you don't use it like `getSupabaseAdmin().auth.api`.
 *
 * Reason : https://github.com/rphlmr/supa-fly-stack/pull/43#issue-1336412790
 */
function getSupabaseAdmin() {
	if (isBrowser)
		throw new Error(
			"getSupabaseAdmin is not available in browser and should NOT be used in insecure environments",
		);

	return getSupabaseClient(getSupabaseServiceRole());
}

const supabaseClient = getSupabaseClient(SUPABASE_ANON_KEY);

export { getSupabaseAdmin, supabaseClient };
