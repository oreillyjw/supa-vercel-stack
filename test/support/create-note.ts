// Use this to programmatically create notes for test fixtures
// This bypasses the UI and creates notes directly in the database

import { installGlobals } from "@remix-run/node";

import { db } from "~/database";
import type { NoteData } from "./types";

installGlobals();

export async function createNote(
	userId: string,
	noteData: NoteData,
): Promise<{ id: string; title: string; body: string }> {
	if (!userId) {
		throw new Error("userId required to create note");
	}
	if (!noteData.title || !noteData.body) {
		throw new Error("title and body required to create note");
	}

	try {
		const note = await db.note.create({
			data: {
				title: noteData.title,
				body: noteData.body,
				user: {
					connect: {
						id: userId,
					},
				},
			},
		});

		if (!note) {
			throw new Error("Prisma note.create returned null/undefined");
		}

		return note;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Failed to create test note for user ${userId}: ${errorMessage}`,
		);
	}
}
