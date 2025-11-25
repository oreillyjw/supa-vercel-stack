// Use this to create a new user and login with that user
// Simply call this with:
// npx tsx ./tests/support/create-user.ts username@example.com password
// and it will create the user account

import { db } from "~/database/db.server";
import { createEmailAuthAccount } from "~/modules/auth/service.server";

export async function createAccount(email: string, password: string) {
	if (!email || !password) {
		throw new Error("email and password required to create account");
	}
	if (!email.endsWith("@example.com")) {
		throw new Error("All test emails must end in @example.com");
	}

	try {
		const authAccount = await createEmailAuthAccount(email, password);

		if (!authAccount) {
			throw new Error("createEmailAuthAccount returned null/undefined");
		}

		const newUser = await db.user.create({
			data: {
				email: email.toLowerCase(),
				id: authAccount.id,
			},
		});

		if (!newUser) {
			throw new Error("Prisma user.create returned null/undefined");
		}

		return { email, password };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Failed to create test user account for ${email}: ${errorMessage}`,
		);
	}
}

// Allow script execution
// if (require.main === module) {
// 	createAccount(process.argv[2], process.argv[3]);
// }
