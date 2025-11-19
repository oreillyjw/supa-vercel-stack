import { test, expect } from "../support/fixtures";
import { faker } from "@faker-js/faker";
import {
	loginUser,
	logoutUser,
	createNoteViaUI,
	deleteNoteViaUI,
	clickNoteInList,
	expectEmptyNotesState,
	expectNoteInList,
	expectNoteNotInList,
} from "../support/helpers";
import { deleteUser } from "../support/delete-user";

test.describe("Note Creation", () => {
	test("should create note with title and body", async ({
		authenticatedUser,
		noteData,
	}) => {
		const { page } = authenticatedUser;

		await createNoteViaUI(page, noteData.title, noteData.body);

		// Should be on note detail page
		await expect(page).toHaveURL(/\/notes\/.+/);

		// Verify content is displayed as heading and text
		await expect(
			page.getByRole("heading", { name: noteData.title }),
		).toBeVisible();
		await expect(page.getByText(noteData.body)).toBeVisible();

		// Go back to notes list and verify note appears
		await page.goto("/notes");
		await expectNoteInList(page, noteData.title);
	});

	test("should show validation error when creating note without title", async ({
		authenticatedUser,
	}) => {
		const { page } = authenticatedUser;
		const body = faker.lorem.paragraphs(2);

		await page.goto("/notes/new");
		await page.getByRole("textbox", { name: /body/i }).fill(body);
		await page.getByRole("button", { name: /save/i }).click();

		// Should stay on new note page with validation error
		await expect(page).toHaveURL("/notes/new");
		// Should show error message
		await expect(page.getByText(/require/i)).toBeVisible();
	});

	test("should show validation error when creating note without body", async ({
		authenticatedUser,
	}) => {
		const { page } = authenticatedUser;
		const title = faker.lorem.words(3);

		await page.goto("/notes/new");
		await page.getByRole("textbox", { name: /title/i }).fill(title);
		await page.getByRole("button", { name: /save/i }).click();

		// Should stay on new note page with validation error
		await expect(page).toHaveURL("/notes/new");
		// Should show error message
		await expect(page.getByText(/require/i)).toBeVisible();
	});

	test.skip("should show note in list and hide empty state after first note", async ({
		authenticatedUser,
		noteData,
	}) => {
		const { page } = authenticatedUser;

		// Verify empty state first
		await page.goto("/notes");
		await expectEmptyNotesState(page);

		// Create note via UI (this navigates to new page, fills form, saves)
		await page.getByRole("link", { name: /\+ new note/i }).click();
		await expect(page).toHaveURL("/notes/new");
		await page.getByRole("textbox", { name: /title/i }).fill(noteData.title);
		await page.getByRole("textbox", { name: /body/i }).fill(noteData.body);
		await page.getByRole("button", { name: /save/i }).click();

		// Wait for redirect to note detail
		await page.waitForURL(/\/notes\/.+/);

		// Navigate back to list
		await page.goto("/notes");
		await page.waitForLoadState("networkidle");

		// Note should be visible in list
		await expect(
			page.getByRole("link", { name: new RegExp(noteData.title, "i") }),
		).toBeVisible();

		// Empty state should not be visible
		await expect(page.getByText("No notes yet")).not.toBeVisible();
	});
});

test.describe("Note Reading", () => {
	test("should display empty state for new user", async ({
		authenticatedUser,
	}) => {
		const { page } = authenticatedUser;

		await page.goto("/notes");
		await expectEmptyNotesState(page);
		await expect(page.getByText("No notes yet")).toBeVisible();
	});

	test.skip("should display notes list with multiple notes", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// All notes should be visible in the list
		for (const note of notes) {
			await expectNoteInList(page, note.title);
		}

		// Cleanup
		await logoutUser(page);
	});

	test.skip("should navigate to note detail when clicking note in list", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Click first note
		await clickNoteInList(page, notes[0].title);

		// Should be on note detail page
		await expect(page).toHaveURL(/\/notes\/.+/);

		// Verify content
		await expect(
			page.getByRole("textbox", { name: /title/i }),
		).toHaveValue(notes[0].title);

		// Cleanup
		await logoutUser(page);
	});

	test.skip("should display note title and body correctly", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Click a note
		await clickNoteInList(page, notes[0].title);

		// Verify title is displayed as heading
		await expect(
			page.getByRole("heading", { name: notes[0].title }),
		).toBeVisible();

		// Verify body is displayed
		await expect(page.getByText(notes[0].body)).toBeVisible();

		// Cleanup
		await logoutUser(page);
	});

	test.skip("should show delete button on note detail", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Click a note
		await clickNoteInList(page, notes[0].title);

		// Verify delete button exists
		await expect(
			page.getByRole("button", { name: /delete/i }),
		).toBeVisible();

		// Cleanup
		await logoutUser(page);
	});
});

test.describe("Note Display", () => {
	test.skip("should display note title and body on detail page", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Open note
		await clickNoteInList(page, notes[0].title);

		// Verify title is displayed (as h3 heading)
		await expect(
			page.getByRole("heading", { name: notes[0].title }),
		).toBeVisible();

		// Verify body is displayed
		await expect(page.getByText(notes[0].body)).toBeVisible();

		// Cleanup
		await logoutUser(page);
	});
});

test.describe("Note Deletion", () => {
	test.skip("should delete note from detail view", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Open note
		await clickNoteInList(page, notes[0].title);

		// Delete note
		await deleteNoteViaUI(page);

		// Should redirect to notes list
		await expect(page).toHaveURL("/notes");

		// Note should not be in list
		await expectNoteNotInList(page, notes[0].title);

		// Cleanup
		await logoutUser(page);
	});

	test.skip("should remove note from list after deletion", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Verify note exists
		await expectNoteInList(page, notes[0].title);

		// Open and delete note
		await clickNoteInList(page, notes[0].title);
		await deleteNoteViaUI(page);

		// Verify note removed from list
		await expectNoteNotInList(page, notes[0].title);

		// Other notes should still be there
		await expectNoteInList(page, notes[1].title);
		await expectNoteInList(page, notes[2].title);

		// Cleanup
		await logoutUser(page);
	});

	test("should show empty state after deleting last note", async ({
		authenticatedUser,
		noteData,
	}) => {
		const { page } = authenticatedUser;

		// Create one note
		await createNoteViaUI(page, noteData.title, noteData.body);

		// Delete it
		await deleteNoteViaUI(page);

		// Should show empty state
		await expectEmptyNotesState(page);
		await expect(page.getByText("No notes yet")).toBeVisible();
	});

	test.skip("should handle deleting multiple notes sequentially", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Delete first note
		await clickNoteInList(page, notes[0].title);
		await deleteNoteViaUI(page);
		await expectNoteNotInList(page, notes[0].title);

		// Delete second note
		await clickNoteInList(page, notes[1].title);
		await deleteNoteViaUI(page);
		await expectNoteNotInList(page, notes[1].title);

		// Only third note should remain
		await expectNoteInList(page, notes[2].title);

		// Cleanup
		await logoutUser(page);
	});
});

test.describe("Data Isolation", () => {
	test.skip("should only show user's own notes", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;

		// Login as user with notes
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Verify user's notes are visible
		for (const note of notes) {
			await expectNoteInList(page, note.title);
		}

		// Logout
		await logoutUser(page);
	});

	test.skip("should not show other users' notes", async ({ page }) => {
		// Create first user with notes
		const user1Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user1Password = faker.internet.password({ length: 12 });
		const user1Note = {
			title: faker.lorem.words(3) + " USER1",
			body: faker.lorem.paragraphs(1),
		};

		// Register and create note as user 1
		await page.goto("/join");
		await page.getByTestId("email").fill(user1Email);
		await page.getByTestId("password").fill(user1Password);
		await page.getByTestId("create-account").click();
		await page.waitForURL("/notes");

		await createNoteViaUI(page, user1Note.title, user1Note.body);
		await page.goto("/notes");
		await expectNoteInList(page, user1Note.title);
		await logoutUser(page);

		// Create second user
		const user2Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user2Password = faker.internet.password({ length: 12 });

		await page.goto("/join");
		await page.getByTestId("email").fill(user2Email);
		await page.getByTestId("password").fill(user2Password);
		await page.getByTestId("create-account").click();
		await page.waitForURL("/notes");

		// User 2 should see empty notes
		await expectEmptyNotesState(page);

		// User 1's note should NOT be visible
		await expectNoteNotInList(page, user1Note.title);

		// Cleanup both users
		await logoutUser(page);

		// Clean up both users
		await deleteUser(user1Email);
		await deleteUser(user2Email);
	});

	test.skip("should not allow accessing other users' notes via URL", async ({
		page,
	}) => {
		// Create user 1 with a note
		const user1Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user1Password = faker.internet.password({ length: 12 });
		const noteTitle = faker.lorem.words(3);

		await page.goto("/join");
		await page.getByTestId("email").fill(user1Email);
		await page.getByTestId("password").fill(user1Password);
		await page.getByTestId("create-account").click();
		await page.waitForURL("/notes");

		await createNoteViaUI(page, noteTitle, faker.lorem.paragraphs(1));
		const noteUrl = page.url(); // Capture the note URL
		await logoutUser(page);

		// Create and login as user 2
		const user2Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user2Password = faker.internet.password({ length: 12 });

		await page.goto("/join");
		await page.getByTestId("email").fill(user2Email);
		await page.getByTestId("password").fill(user2Password);
		await page.getByTestId("create-account").click();
		await page.waitForURL("/notes");

		// Try to access user 1's note URL
		await page.goto(noteUrl);

		// Should show 404 error or redirect to user 2's notes
		// At minimum, should not show user 1's note content
		const titleHeading = page.getByRole("heading", { name: noteTitle });

		// User 1's note title should not be visible
		await expect(titleHeading).not.toBeVisible();

		// Should see either error message or be redirected to notes list
		const isError = await page.getByText(/not found/i).isVisible();
		const isNotesList = page.url().endsWith("/notes");

		expect(isError || isNotesList).toBeTruthy();

		// Cleanup
		await logoutUser(page);
		await deleteUser(user1Email);
		await deleteUser(user2Email);
	});
});
