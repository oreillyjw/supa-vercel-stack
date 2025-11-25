// Use this to delete a user by their email
// Simply call this with:
// npx tsx ./tests/support/delete-user.ts username@example.com
// and that user will get deleted

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { db } from "~/database/db.server";
import { deleteAuthAccount } from "~/modules/auth/service.server";
import { getUserByEmail } from "~/modules/user/service.server";

export async function deleteUser(email: string) {
	if (!email) {
		throw new Error("email required for deletion");
	}
	if (!email.endsWith("@example.com")) {
		throw new Error("All test emails must end in @example.com");
	}

	try {
		const user = await getUserByEmail(email);

		try {
			await db.user.delete({ where: { email } });
		} catch (error) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				error.code === "P2025"
			) {
				console.log("User not found in database, so no need to delete");
			} else {
				throw error;
			}
		}

		if (user?.id) {
			try {
				await deleteAuthAccount(user.id);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				throw new Error(
					`Failed to delete auth account for user ${email}: ${errorMessage}`,
				);
			}
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to delete test user ${email}: ${errorMessage}`);
	}
}

// Allow script execution
// if (require.main === module) {
// 	deleteUser(process.argv[2]);
// }
