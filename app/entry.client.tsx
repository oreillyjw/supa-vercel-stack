import React from "react";

import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import {
	I18nClientProvider,
	initI18nextClient,
} from "./integrations/i18n/i18next.client"; // your i18n configuration file

function hydrate() {
	React.startTransition(() => {
		hydrateRoot(
			document,
			<React.StrictMode>
				<I18nClientProvider>
					<HydratedRouter />
				</I18nClientProvider>
			</React.StrictMode>,
		);
	});
}

initI18nextClient(hydrate);
