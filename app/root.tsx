import { useTranslation } from "react-i18next";
import type { LinksFunction, LoaderFunction, MetaFunction } from "react-router";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "react-router";
import { useChangeLanguage } from "remix-i18next/react";

import { i18nextServer } from "~/integrations/i18n/i18next.server";

import tailwindStylesheetUrl from "./styles/tailwind.css?url";
import { getBrowserEnv } from "./utils/env";

export const links: LinksFunction = () => [
	{
		rel: "stylesheet preload prefetch",
		href: tailwindStylesheetUrl,
		as: "style",
	},
];

export const meta: MetaFunction = () => [
	{ title: "React Router Notes" },
	{ name: "description", content: "React Router Notes App" },
];

type LoaderData = {
	locale: string;
	env: ReturnType<typeof getBrowserEnv>;
};

export const loader: LoaderFunction = async ({ request }) => {
	const locale = await i18nextServer.getLocale(request);
	return {
		locale,
		env: getBrowserEnv(),
	};
};

export default function App() {
	const { env, locale } = useLoaderData<LoaderData>();
	const { i18n } = useTranslation();

	useChangeLanguage(locale);

	return (
		<html lang={locale} dir={i18n.dir()} className="h-full">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width,initial-scale=1.0,maximum-scale=1.0"
				/>
				<Meta />
				<Links />
			</head>
			<body className="h-full">
				<Outlet />
				<ScrollRestoration />
				<script
					dangerouslySetInnerHTML={{
						__html: `window.env = ${JSON.stringify(env)}`,
					}}
				/>
				<Scripts />
			</body>
		</html>
	);
}
