// Use this to get a user's ID by their email address

import { db } from "~/database/db.server";

export async function getUserId(email: string): Promise<string> {
	if (!email) {
		throw new Error("email required to get user ID");
	}

	try {
		const user = await db.user.findUnique({
			where: { email: email.toLowerCase() },
			select: { id: true },
		});

		if (!user) {
			throw new Error(`User not found with email: ${email}`);
		}

		return user.id;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to get user ID for ${email}: ${errorMessage}`);
	}
}
