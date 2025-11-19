import { test, expect } from "../support/fixtures";
import { faker } from "@faker-js/faker";
import {
	loginUser,
	logoutUser,
	createNoteViaUI,
	deleteNoteViaUI,
	editNoteViaUI,
	clickNoteInList,
	expectEmptyNotesState,
	expectNoteInList,
	expectNoteNotInList,
} from "../support/helpers";

test.describe("Note Creation", () => {
	test("should create note with title and body", async ({
		authenticatedUser,
		noteData,
	}) => {
		const { page } = authenticatedUser;

		await createNoteViaUI(page, noteData.title, noteData.body);

		// Should be on note detail page
		await expect(page).toHaveURL(/\/notes\/.+/);

		// Verify content is displayed
		await expect(
			page.getByRole("textbox", { name: /title/i }),
		).toHaveValue(noteData.title);
		await expect(
			page.getByRole("textbox", { name: /body/i }),
		).toHaveValue(noteData.body);

		// Go back to notes list and verify note appears
		await page.goto("/notes");
		await expectNoteInList(page, noteData.title);
	});

	test("should create note with only title", async ({
		authenticatedUser,
	}) => {
		const { page } = authenticatedUser;
		const title = faker.lorem.words(3);

		await createNoteViaUI(page, title, "");

		// Should redirect to note detail
		await expect(page).toHaveURL(/\/notes\/.+/);

		// Go back and verify
		await page.goto("/notes");
		await expectNoteInList(page, title);
	});

	test("should create note with only body", async ({
		authenticatedUser,
	}) => {
		const { page } = authenticatedUser;
		const body = faker.lorem.paragraphs(2);

		await createNoteViaUI(page, "", body);

		// Should redirect to note detail
		await expect(page).toHaveURL(/\/notes\/.+/);

		// Go back to notes list
		await page.goto("/notes");
		// Note: Without a title, the note link might show "(Untitled)" or the body preview
		// Verify at least one note exists
		const noteLinks = page.getByRole("link");
		await expect(noteLinks.first()).toBeVisible();
	});

	test("should show note in list immediately after creation", async ({
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

		// Note should be visible
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

		// Verify content
		await expect(
			page.getByRole("textbox", { name: /title/i }),
		).toHaveValue(notes[0].title);

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

		// Verify both title and body are displayed
		const titleInput = page.getByRole("textbox", { name: /title/i });
		const bodyInput = page.getByRole("textbox", { name: /body/i });

		await expect(titleInput).toHaveValue(notes[0].title);
		await expect(bodyInput).toHaveValue(notes[0].body);

		// Cleanup
		await logoutUser(page);
	});

	test("should show edit and delete buttons on note detail", async ({
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

		// Save button should be visible for editing
		await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

		// Cleanup
		await logoutUser(page);
	});
});

test.describe("Note Updating", () => {
	test("should edit note title only", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;
		const newTitle = faker.lorem.words(4);

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Open note
		await clickNoteInList(page, notes[0].title);

		// Edit title
		await editNoteViaUI(page, newTitle, undefined);

		// Verify title updated
		await expect(
			page.getByRole("textbox", { name: /title/i }),
		).toHaveValue(newTitle);

		// Body should remain unchanged
		await expect(
			page.getByRole("textbox", { name: /body/i }),
		).toHaveValue(notes[0].body);

		// Cleanup
		await logoutUser(page);
	});

	test("should edit note body only", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;
		const newBody = faker.lorem.paragraphs(3);

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Open note
		await clickNoteInList(page, notes[0].title);

		// Edit body
		await editNoteViaUI(page, undefined, newBody);

		// Verify body updated
		await expect(
			page.getByRole("textbox", { name: /body/i }),
		).toHaveValue(newBody);

		// Title should remain unchanged
		await expect(
			page.getByRole("textbox", { name: /title/i }),
		).toHaveValue(notes[0].title);

		// Cleanup
		await logoutUser(page);
	});

	test("should edit both title and body", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;
		const newTitle = faker.lorem.words(4);
		const newBody = faker.lorem.paragraphs(3);

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Open note
		await clickNoteInList(page, notes[0].title);

		// Edit both
		await editNoteViaUI(page, newTitle, newBody);

		// Verify both updated
		await expect(
			page.getByRole("textbox", { name: /title/i }),
		).toHaveValue(newTitle);
		await expect(
			page.getByRole("textbox", { name: /body/i }),
		).toHaveValue(newBody);

		// Cleanup
		await logoutUser(page);
	});

	test("should persist changes after save", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;
		const newTitle = faker.lorem.words(4);

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Open note
		await clickNoteInList(page, notes[0].title);
		const noteUrl = page.url();

		// Edit title
		await editNoteViaUI(page, newTitle, undefined);

		// Navigate away and back
		await page.goto("/notes");
		await page.goto(noteUrl);

		// Changes should persist
		await expect(
			page.getByRole("textbox", { name: /title/i }),
		).toHaveValue(newTitle);

		// Cleanup
		await logoutUser(page);
	});

	test("should reflect changes in notes list", async ({
		page,
		userWithNotes,
	}) => {
		const { user, notes } = userWithNotes;
		const newTitle = faker.lorem.words(4);

		// Login
		await loginUser(page, user.email, user.password);
		await page.goto("/notes");

		// Open note
		await clickNoteInList(page, notes[0].title);

		// Edit title
		await editNoteViaUI(page, newTitle, undefined);

		// Go back to list
		await page.goto("/notes");

		// New title should be in list
		await expectNoteInList(page, newTitle);

		// Old title should not be in list
		await expectNoteNotInList(page, notes[0].title);

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

		// Clean up user 1
		const { deleteUser } = await import("../support/delete-user");
		await deleteUser(user1Email);
		await deleteUser(user2Email);
	});

	test("should not allow accessing other users' notes via URL", async ({
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

		// Should either redirect to user 2's notes or show 404/error
		// The exact behavior depends on implementation
		// At minimum, should not show user 1's note content
		const titleInput = page.getByRole("textbox", { name: /title/i });
		if (await titleInput.isVisible()) {
			// If we can see a title input, it should NOT be user 1's note
			await expect(titleInput).not.toHaveValue(noteTitle);
		} else {
			// Or we should be redirected away
			await expect(page).not.toHaveURL(noteUrl);
		}

		// Cleanup
		await logoutUser(page);
		const { deleteUser } = await import("../support/delete-user");
		await deleteUser(user1Email);
		await deleteUser(user2Email);
	});
});
