// Use this to delete a user by their email
// Simply call this with:
// npx tsx ./tests/support/delete-user.ts username@example.com
// and that user will get deleted

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { installGlobals } from "@remix-run/node";

import { db } from "~/database";
import { deleteAuthAccount } from "~/modules/auth/service.server";
import { getUserByEmail } from "~/modules/user";

installGlobals();

export async function deleteUser(email: string) {
	if (!email) {
		throw new Error("email required for deletion");
	}
	if (!email.endsWith("@example.com")) {
		throw new Error("All test emails must end in @example.com");
	}

	const user = await getUserByEmail(email);

	try {
		await db.user.delete({ where: { email } });
	} catch (error) {
		if (
			error instanceof PrismaClientKnownRequestError &&
			error.code === "P2025"
		) {
			console.log("User not found, so no need to delete");
		} else {
			throw error;
		}
	}

	if (user?.id) {
		await deleteAuthAccount(user.id);
	}
}

// Allow script execution
if (require.main === module) {
	deleteUser(process.argv[2]);
}
