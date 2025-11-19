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
	expectTitleError,
	expectBodyError,
} from "../support/helpers";
import { deleteUser } from "../support/delete-user";
import { createAccount } from "../support/create-user";
import { getUserId } from "../support/get-user-id";
import { createNote } from "../support/create-note";

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

		// Should show title validation error
		await expectTitleError(page);
		// Should stay on new note page
		await expect(page).toHaveURL("/notes/new");
	});

	test("should show validation error when creating note without body", async ({
		authenticatedUser,
	}) => {
		const { page } = authenticatedUser;
		const title = faker.lorem.words(3);

		await page.goto("/notes/new");
		await page.getByRole("textbox", { name: /title/i }).fill(title);
		await page.getByRole("button", { name: /save/i }).click();

		// Should show body validation error
		await expectBodyError(page);
		// Should stay on new note page
		await expect(page).toHaveURL("/notes/new");
	});

	test.skip("should show note in list and hide empty state after first note", async ({
		authenticatedUser,
		noteData,
	}) => {
		const { page } = authenticatedUser;

		// Verify empty state first
		await page.goto("/notes");
		await expectEmptyNotesState(page);

		// Create note
		await createNoteViaUI(page, noteData.title, noteData.body);

		// Navigate back to list
		await page.goto("/notes");

		// Note should be visible in list (with emoji prefix)
		await expectNoteInList(page, noteData.title);

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

	test("should display notes list with multiple notes", async ({
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

	test("should navigate to note detail when clicking note in list", async ({
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

		// Verify content (notes are read-only, displayed as heading and text)
		await expect(
			page.getByRole("heading", { name: notes[0].title }),
		).toBeVisible();
		await expect(page.getByText(notes[0].body)).toBeVisible();

		// Cleanup
		await logoutUser(page);
	});

	test("should display note title and body correctly", async ({
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

	test("should show delete button on note detail", async ({
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
	test("should display note title and body on detail page", async ({
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
	test("should delete note from detail view", async ({
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

	test("should remove note from list after deletion", async ({
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

	test("should handle deleting multiple notes sequentially", async ({
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
	test("should only show user's own notes", async ({
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

	test("should not show other users' notes", async ({ page }) => {
		// Create first user with note (programmatically)
		const user1Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user1Password = faker.internet.password({ length: 12 });
		const user1Note = {
			title: faker.lorem.words(3) + " USER1",
			body: faker.lorem.paragraphs(1),
		};

		await createAccount(user1Email, user1Password);
		const user1Id = await getUserId(user1Email);
		await createNote(user1Id, user1Note);

		// Login as user 1 and verify note exists
		await loginUser(page, user1Email, user1Password);
		await page.goto("/notes");
		await expectNoteInList(page, user1Note.title);
		await logoutUser(page);

		// Create second user
		const user2Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user2Password = faker.internet.password({ length: 12 });
		await createAccount(user2Email, user2Password);

		// Login as user 2
		await loginUser(page, user2Email, user2Password);
		await page.goto("/notes");

		// User 2 should see empty notes
		await expectEmptyNotesState(page);

		// User 1's note should NOT be visible
		await expectNoteNotInList(page, user1Note.title);

		// Cleanup
		await logoutUser(page);
		await deleteUser(user1Email);
		await deleteUser(user2Email);
	});

	test("should not allow accessing other users' notes via URL", async ({
		page,
	}) => {
		// Create user 1 with a note (programmatically)
		const user1Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user1Password = faker.internet.password({ length: 12 });
		const noteData = {
			title: faker.lorem.words(3),
			body: faker.lorem.paragraphs(1),
		};

		await createAccount(user1Email, user1Password);
		const user1Id = await getUserId(user1Email);
		const note = await createNote(user1Id, noteData);
		const noteUrl = `/notes/${note.id}`; // Construct the note URL

		// Create and login as user 2
		const user2Email = faker.internet.email({ provider: "example.com" }).toLowerCase();
		const user2Password = faker.internet.password({ length: 12 });
		await createAccount(user2Email, user2Password);
		await loginUser(page, user2Email, user2Password);

		// Try to access user 1's note URL
		await page.goto(noteUrl);

		// User 1's note title should not be visible
		await expect(
			page.getByRole("heading", { name: noteData.title }),
		).not.toBeVisible();

		// User 1's note body should not be visible
		await expect(page.getByText(noteData.body)).not.toBeVisible();

		// Cleanup
		await logoutUser(page);
		await deleteUser(user1Email);
		await deleteUser(user2Email);
	});
});
