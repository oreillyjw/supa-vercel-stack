import type { ActionFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/node";
import { parseFormAny } from "react-zorm";
import { z } from "zod";

import { sendMagicLink } from "~/modules/auth/service.server";
import { assertIsPost } from "~/utils/http.server";

export async function action({ request }: ActionFunctionArgs) {
	assertIsPost(request);

	const formData = await request.formData();
	const result = await z
		.object({
			email: z
				.string()
				.email("invalid-email")
				.transform((email) => email.toLowerCase()),
		})
		.safeParseAsync(parseFormAny(formData));

	if (!result.success) {
		return data(
			{
				error: "invalid-email",
			},
			{ status: 400 },
		);
	}

	const { error } = await sendMagicLink(result.data.email);

	if (error) {
		console.error(error);
		return data(
			{
				error: "unable-to-send-magic-link",
			},
			{ status: 500 },
		);
	}

	return { error: null };
}
