// Use this to create a new user and login with that user
// Simply call this with:
// npx tsx ./tests/support/create-user.ts username@example.com password
// and it will create the user account

import { installGlobals } from "@remix-run/node";

import { db } from "~/database";
import { createEmailAuthAccount } from "~/modules/auth/service.server";

installGlobals();

export async function createAccount(email: string, password: string) {
	if (!email || !password) {
		throw new Error("email and password required to create account");
	}
	if (!email.endsWith("@example.com")) {
		throw new Error("All test emails must end in @example.com");
	}

	const authAccount = await createEmailAuthAccount(email, password);

	if (!authAccount) {
		throw new Error("Failed to create user account for tests");
	}

	const newUser = await db.user.create({
		data: {
			email: email.toLowerCase(),
			id: authAccount.id,
		},
	});

	if (!newUser) {
		throw new Error("Failed to create user database entry");
	}

	return { email, password };
}

// Allow script execution
if (require.main === module) {
	createAccount(process.argv[2], process.argv[3]);
}
