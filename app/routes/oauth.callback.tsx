import { useEffect, useRef } from "react";

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { data, redirect, useActionData, useFetcher, useSearchParams } from "react-router";
import { parseFormAny } from "react-zorm";
import { z } from "zod";

import { supabaseClient } from "~/integrations/supabase";
import { refreshAccessToken } from "~/modules/auth/service.server";
import { commitAuthSession, getAuthSession } from "~/modules/auth/session.server";
import { tryCreateUser, getUserByEmail } from "~/modules/user/service.server";
import { safeRedirect , assertIsPost } from "~/utils/http.server";

// imagine a user go back after OAuth login success or type this URL
// we don't want him to fall in a black hole 👽
export async function loader({ request }: LoaderFunctionArgs) {
	const authSession = await getAuthSession(request);

	if (authSession) return redirect("/notes");

	return {};
}

export async function action({ request }: ActionFunctionArgs) {
	assertIsPost(request);

	const formData = await request.formData();
	const result = await z
		.object({
			refreshToken: z.string(),
			redirectTo: z.string().optional(),
		})
		.safeParseAsync(parseFormAny(formData));

	if (!result.success) {
		return data(
			{
				message: "invalid-request",
			},
			{ status: 400 },
		);
	}

	const { redirectTo, refreshToken } = result.data;
	const safeRedirectTo = safeRedirect(redirectTo, "/notes");

	// We should not trust what is sent from the client
	// https://github.com/rphlmr/supa-fly-stack/issues/45
	const authSession = await refreshAccessToken(refreshToken);

	if (!authSession) {
		return data(
			{
				message: "invalid-refresh-token",
			},
			{ status: 401 },
		);
	}

	// user have an account, skip creation part and just commit session
	if (await getUserByEmail(authSession.email)) {
		return redirect(safeRedirectTo, {
			headers: {
				"Set-Cookie": await commitAuthSession(request, {
					authSession,
				}),
			},
		});
	}

	// first time sign in, let's create a brand-new User row in supabase
	const user = await tryCreateUser(authSession);

	if (!user) {
		return data(
			{
				message: "create-user-error",
			},
			{ status: 500 },
		);
	}

	return redirect(safeRedirectTo, {
		headers: {
			"Set-Cookie": await commitAuthSession(request, {
				authSession,
			}),
		},
	});
}

export default function LoginCallback() {
	const error = useActionData<typeof action>();
	const fetcher = useFetcher();
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get("redirectTo") ?? "/notes";
	const hasSubmitted = useRef(false);

	// Handle navigation after successful fetcher submission
	// Use window.location for full page reload to pick up the session cookie
	useEffect(() => {
		if (fetcher.state === "idle" && hasSubmitted.current && !fetcher.data) {
			// Fetcher completed without error data - redirect was successful
			// Full page navigation to pick up the cookie set by the action
			window.location.href = redirectTo;
		}
	}, [fetcher.state, fetcher.data, redirectTo]);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabaseClient.auth.onAuthStateChange((event, supabaseSession) => {
			if (event === "SIGNED_IN") {
				// supabase sdk has ability to read url fragment that contains your token after third party provider redirects you here
				// this fragment url looks like https://.....#access_token=evxxxxxxxx&refresh_token=xxxxxx, and it's not readable server-side (Oauth security)
				// supabase auth listener gives us a user session, based on what it founds in this fragment url
				// we can't use it directly, client-side, because we can't access sessionStorage from here

				// we should not trust what's happen client side
				// so, we only pick the refresh token, and let's back-end getting user session from it
				const refreshToken = supabaseSession?.refresh_token;

				if (!refreshToken) return;

				const formData = new FormData();

				formData.append("refreshToken", refreshToken);
				formData.append("redirectTo", redirectTo);

				hasSubmitted.current = true;
				fetcher.submit(formData, { method: "post" });
			}
		});

		return () => {
			// prevent memory leak. Listener stays alive 👨‍🎤
			subscription.unsubscribe();
		};
	}, [fetcher, redirectTo]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			{error ? (
				<div className="text-red-500">{error.message}</div>
			) : (
				<div className="flex flex-col items-center gap-4">
					<div className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
					<p className="text-gray-600">Signing you in...</p>
				</div>
			)}
		</div>
	);
}
