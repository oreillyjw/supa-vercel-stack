import { test, expect } from "../support/fixtures";
import { faker } from "@faker-js/faker";
import { createAccount } from "../support/create-user";
import { deleteUser } from "../support/delete-user";

test.describe("smoke tests", () => {
	test("should allow you to register and login", async ({ page }) => {
		const loginForm = {
			email: faker.internet
				.email({ provider: "example.com" })
				.toLowerCase(),
			password: faker.internet.password(),
		};

		// Navigate to home page
		await page.goto("/");

		// Click join button
		await page.getByTestId("join").click();

		// Fill in registration form
		await page.getByTestId("email").fill(loginForm.email);
		await page.getByTestId("password").fill(loginForm.password);
		await page.getByTestId("create-account").click();

		// Verify we're on the notes page
		await expect(page.getByText("No notes yet")).toBeVisible();

		// Logout
		await page.getByTestId("logout").click();

		// Wait for logout to complete before cleanup
		await expect(page.getByTestId("login")).toBeVisible();
		await expect(page).toHaveURL("/");

		// Cleanup - delete the test user after logout completes
		await deleteUser(loginForm.email);
	});

	test("should allow you to make a note", async ({ page }) => {
		const testNote = {
			title: faker.lorem.words(1),
			body: faker.lorem.sentences(1),
		};
		const credentials = {
			email: faker.internet
				.email({ provider: "example.com" })
				.toLowerCase(),
			password: faker.internet.password(),
		};

		// Create account programmatically
		await createAccount(credentials.email, credentials.password);

		// Navigate to home and login
		await page.goto("/");
		await page.getByTestId("login").click();

		await page.getByTestId("email").fill(credentials.email);
		await page.getByTestId("password").fill(credentials.password);
		await page.getByTestId("login").click();

		// Verify we're on notes page
		await expect(page.getByText("No notes yet")).toBeVisible();

		// Create a new note
		await page.getByRole("link", { name: /\+ new note/i }).click();

		await page.getByRole("textbox", { name: /title/i }).fill(testNote.title);
		await page.getByRole("textbox", { name: /body/i }).fill(testNote.body);
		await page.getByRole("button", { name: /save/i }).click();

		// Delete the note
		await page.getByRole("button", { name: /delete/i }).click();

		// Verify note is deleted
		await expect(page.getByText("No notes yet")).toBeVisible();

		// Logout
		await page.getByTestId("logout").click();

		// Wait for logout to complete before cleanup
		await expect(page.getByTestId("login")).toBeVisible();
		await expect(page).toHaveURL("/");

		// Cleanup - delete the test user after logout completes
		await deleteUser(credentials.email);
	});
});
