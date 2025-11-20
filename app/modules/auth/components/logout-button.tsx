import { useTranslation } from "react-i18next";
import { Form } from "react-router";

export function LogoutButton() {
	const { t } = useTranslation("auth");

	return (
		<Form action="/logout" method="post">
			<button
				data-test-id="logout"
				type="submit"
				className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
			>
				{t("logout.action")}
			</button>
		</Form>
	);
}
