import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import type { NoteData } from "./types";

/**
 * Navigation helpers
 */

export async function goToHome(page: Page) {
	await page.goto("/");
	await expect(page).toHaveURL("/");
}

export async function goToLogin(page: Page) {
	await page.goto("/login");
	await expect(page).toHaveURL("/login");
}

export async function goToJoin(page: Page) {
	await page.goto("/join");
	await expect(page).toHaveURL("/join");
}

export async function goToNotes(page: Page) {
	await page.goto("/notes");
}

export async function goToNewNote(page: Page) {
	await page.goto("/notes/new");
	await expect(page).toHaveURL("/notes/new");
}

/**
 * Authentication helpers
 */

export async function loginUser(page: Page, email: string, password: string) {
	await goToLogin(page);
	await page.getByTestId("email").fill(email);
	await page.getByTestId("password").fill(password);
	await page.getByTestId("login").click();
	// Wait for navigation to complete
	await page.waitForURL("/notes");
}

export async function registerUser(
	page: Page,
	email: string,
	password: string,
) {
	await goToJoin(page);
	await page.getByTestId("email").fill(email);
	await page.getByTestId("password").fill(password);
	await page.getByTestId("create-account").click();
	// Wait for navigation to complete
	await page.waitForURL("/notes");
}

export async function logoutUser(page: Page) {
	await page.getByTestId("logout").click();
	// Wait for logout to complete
	await expect(page.getByTestId("login")).toBeVisible();
	await expect(page).toHaveURL("/");
}

/**
 * Note helpers
 */

export async function createNoteViaUI(
	page: Page,
	title: string,
	body: string,
): Promise<void> {
	// Navigate to new note page
	await page.getByRole("link", { name: /\+ new note/i }).click();
	await expect(page).toHaveURL("/notes/new");

	// Fill in note form
	await page.getByRole("textbox", { name: /title/i }).fill(title);
	await page.getByRole("textbox", { name: /body/i }).fill(body);

	// Submit form
	await page.getByRole("button", { name: /save/i }).click();

	// Wait for redirect to note detail page
	await page.waitForURL(/\/notes\/.+/);
}

export async function deleteNoteViaUI(page: Page): Promise<void> {
	// Assumes we're on the note detail page
	await page.getByRole("button", { name: /delete/i }).click();

	// Wait for redirect to notes list
	await page.waitForURL("/notes");
}

export async function getNoteFromList(
	page: Page,
	title: string,
): Promise<Locator> {
	// Note links have format "📝 {title}" in the UI
	// Escape special regex characters in the title
	const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return page.getByRole("link", {
		name: new RegExp(`📝\\s*${escapedTitle}`, "i"),
	});
}

export async function clickNoteInList(
	page: Page,
	title: string,
): Promise<void> {
	const noteLink = await getNoteFromList(page, title);
	await noteLink.click();
	await page.waitForURL(/\/notes\/.+/);
}

/**
 * Assertion helpers
 */

export async function expectToBeOnHomePage(page: Page) {
	await expect(page).toHaveURL("/");
	await expect(page.getByTestId("login")).toBeVisible();
}

export async function expectToBeOnLoginPage(page: Page) {
	await expect(page).toHaveURL("/login");
	await expect(page.getByTestId("email")).toBeVisible();
}

export async function expectToBeOnJoinPage(page: Page) {
	await expect(page).toHaveURL("/join");
	await expect(page.getByTestId("email")).toBeVisible();
}

export async function expectToBeOnNotesPage(page: Page) {
	await expect(page).toHaveURL("/notes");
}

export async function expectToBeOnNewNotePage(page: Page) {
	await expect(page).toHaveURL("/notes/new");
}

export async function expectEmptyNotesState(page: Page) {
	await expect(page.getByText("No notes yet")).toBeVisible();
}

export async function expectNoteInList(page: Page, title: string) {
	// Wait for navigation to complete and notes list to load
	await page.waitForLoadState("networkidle");
	// Wait for either the empty state OR the notes list to be visible
	await Promise.race([
		page
			.getByText("No notes yet")
			.waitFor({ state: "visible" })
			.catch(() => {}),
		page
			.locator("ol")
			.first()
			.waitFor({ state: "visible" })
			.catch(() => {}),
	]);
	const noteLink = await getNoteFromList(page, title);
	await expect(noteLink).toBeVisible();
}

export async function expectNoteNotInList(page: Page, title: string) {
	const noteLink = await getNoteFromList(page, title);
	await expect(noteLink).not.toBeVisible();
}

export async function expectValidationError(
	page: Page,
	errorText: string | RegExp,
) {
	await expect(page.getByText(errorText)).toBeVisible();
}

export async function expectEmailError(page: Page) {
	const emailError = page.locator("#email-error");
	await expect(emailError).toBeVisible();
}

export async function expectPasswordError(page: Page) {
	const passwordError = page.locator("#password-error");
	await expect(passwordError).toBeVisible();
}

export async function expectTitleError(page: Page) {
	const titleError = page.locator("#title-error");
	await expect(titleError).toBeVisible();
}

export async function expectBodyError(page: Page) {
	const bodyError = page.locator("#body-error");
	await expect(bodyError).toBeVisible();
}

/**
 * Wait helpers
 */

export async function waitForNote(page: Page, title: string) {
	const noteLink = await getNoteFromList(page, title);
	await expect(noteLink).toBeVisible();
}

export async function waitForLogout(page: Page) {
	await expect(page.getByTestId("login")).toBeVisible();
	await expect(page).toHaveURL("/");
}
