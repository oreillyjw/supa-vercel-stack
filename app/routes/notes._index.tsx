import type { LoaderFunctionArgs } from "react-router";
import { Link } from "react-router";

import { requireAuthSession } from "~/modules/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAuthSession(request);

	return null;
}

export default function NoteIndexPage() {
	return (
		<>
			<p>
				No note selected. Select a note on the left, or{" "}
				<Link to="new" className="text-blue-500 underline">
					create a new note.
				</Link>
			</p>
		</>
	);
}
