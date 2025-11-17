import { test as base } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { createAccount } from "./create-user";
import { deleteUser } from "./delete-user";

type TestFixtures = {
	user: { email: string; password: string };
};

/**
 * Custom test fixture that automatically creates and cleans up test users
 * Usage:
 *
 * import { test, expect } from './support/fixtures';
 *
 * test('should do something with user', async ({ page, user }) => {
 *   // user.email and user.password are available
 *   // user will be automatically cleaned up after test
 * });
 */
export const test = base.extend<TestFixtures>({
	user: async ({}, use) => {
		const email = faker.internet
			.email(undefined, undefined, "example.com")
			.toLowerCase();
		const password = faker.internet.password();

		// Create user before test
		await createAccount(email, password);
		const user = { email, password };

		// Provide user to test
		await use(user);

		// Clean up user after test
		await deleteUser(email);
	},
});

export { expect } from "@playwright/test";
