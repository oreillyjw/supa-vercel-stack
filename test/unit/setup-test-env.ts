import "@testing-library/jest-dom/vitest";
import { server } from "mocks";

process.env.SUPABASE_JWT_SECRET = "super-duper-s3cret";
process.env.SUPABASE_SERVICE_ROLE_KEY = "{SERVICE_ROLE}";
process.env.SUPABASE_ANON_KEY = "{ANON_PUBLIC}";
process.env.SUPABASE_URL = "https://supabase-project.supabase.co";
process.env.SERVER_URL = "http://localhost:3000";

if (typeof window !== "undefined") {
	// @ts-expect-error missing vitest type
	window.happyDOM.settings.enableFileSystemHttpRequests = true;
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
