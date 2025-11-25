import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { destroyAuthSession } from "~/modules/auth/session.server";
import { assertIsPost } from "~/utils/http.server";

export async function action({ request }: ActionFunctionArgs) {
	assertIsPost(request);

	return destroyAuthSession(request);
}

export async function loader() {
	return redirect("/");
}
