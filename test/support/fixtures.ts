import { test as base, type Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { createAccount } from "./create-user";
import { deleteUser } from "./delete-user";
import { getUserId } from "./get-user-id";
import { createNote } from "./create-note";
import { loginUser, logoutUser } from "./helpers";
import type { UserCredentials, NoteData } from "./types";

export type { UserCredentials, NoteData };

type TestFixtures = {
	/**
	 * Creates a test user and automatically cleans up after test
	 * The user is NOT logged in
	 */
	user: UserCredentials;

	/**
	 * Creates a test user, logs them in, and automatically cleans up after test
	 * Provides both page (already authenticated) and user credentials
	 */
	authenticatedUser: { page: Page; user: UserCredentials };

	/**
	 * Creates a test user with pre-populated notes
	 * The user is NOT logged in
	 * Provides user credentials and array of created notes
	 */
	userWithNotes: { user: UserCredentials; notes: NoteData[] };

	/**
	 * Generates fake note data using Faker
	 */
	noteData: NoteData;
};

/**
 * Custom test fixtures for E2E testing
 * Usage:
 *
 * import { test, expect } from '../support/fixtures';
 *
 * // User fixture - creates user, no login
 * test('should do something with user', async ({ page, user }) => {
 *   // user.email and user.password are available
 *   // user will be automatically cleaned up after test
 * });
 *
 * // Authenticated user fixture - creates user and logs in
 * test('should test authenticated flow', async ({ authenticatedUser }) => {
 *   const { page, user } = authenticatedUser;
 *   // page is already logged in as user
 * });
 *
 * // User with notes fixture - creates user with sample notes
 * test('should test with existing notes', async ({ page, userWithNotes }) => {
 *   const { user, notes } = userWithNotes;
 *   // notes array contains the created notes
 * });
 *
 * // Note data fixture - just generates fake note data
 * test('should use note data', async ({ noteData }) => {
 *   // noteData.title and noteData.body contain fake data
 * });
 */
export const test = base.extend<TestFixtures>({
	user: async ({}, use) => {
		const email = faker.internet
			.email({ provider: "example.com" })
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

	authenticatedUser: async ({ page }, use) => {
		const email = faker.internet
			.email({ provider: "example.com" })
			.toLowerCase();
		const password = faker.internet.password();

		// Create user and login
		await createAccount(email, password);
		const user = { email, password };
		await loginUser(page, email, password);

		// Provide authenticated page and user to test
		await use({ page, user });

		// Logout and cleanup
		try {
			await logoutUser(page);
		} catch (error) {
			// If logout fails (e.g., already logged out), continue with cleanup
			console.warn("Logout failed during cleanup:", error);
		}
		await deleteUser(email);
	},

	userWithNotes: async ({}, use) => {
		const email = faker.internet
			.email({ provider: "example.com" })
			.toLowerCase();
		const password = faker.internet.password();

		// Create user account
		await createAccount(email, password);
		const user = { email, password };

		// Get user ID for note creation
		const userId = await getUserId(email);

		// Create sample notes programmatically (bypassing UI for reliability)
		const notes: NoteData[] = [
			{
				title: faker.lorem.words(3),
				body: faker.lorem.paragraphs(2),
			},
			{
				title: faker.lorem.words(2),
				body: faker.lorem.paragraphs(1),
			},
			{
				title: faker.lorem.words(4),
				body: faker.lorem.paragraphs(3),
			},
		];

		// Create notes directly in database
		for (const note of notes) {
			await createNote(userId, note);
		}

		// Provide user and notes to test (user is NOT logged in)
		await use({ user, notes });

		// Cleanup
		await deleteUser(email);
	},

	noteData: async ({}, use) => {
		const note: NoteData = {
			title: faker.lorem.words(3),
			body: faker.lorem.paragraphs(2),
		};
		await use(note);
	},
});

export { expect } from "@playwright/test";
