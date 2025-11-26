-- Enable RLS for core tables and apply security policies
-- This migration secures the note, and user tables

-- ============================================================================
-- USER TABLE - Authenticated only access
-- ============================================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON "User"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Allow authenticated users to insert (for new user creation)
CREATE POLICY "Allow authenticated insert" ON "User"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- ============================================================================
-- NOTE TABLE - Authenticated only access (personal notes)
-- ============================================================================
ALTER TABLE "Note" ENABLE ROW LEVEL SECURITY;

-- Users can read their own notes
CREATE POLICY "Users can read own notes" ON "Note"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = "Note"."userId"
      AND "User".id = auth.uid()::text
    )
  );

-- Users can insert their own notes
CREATE POLICY "Users can insert own notes" ON "Note"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = "Note"."userId"
      AND "User".id = auth.uid()::text
    )
  );

-- Users can update their own notes
CREATE POLICY "Users can update own notes" ON "Note"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = "Note"."userId"
      AND "User".id = auth.uid()::text
    )
  );

-- Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON "Note"
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id = "Note"."userId"
      AND "User".id = auth.uid()::text
    )
  );