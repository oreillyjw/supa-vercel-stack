import path from "path";

async function main() {
	const chunks = [];
	for await (const chunk of process.stdin) {
		chunks.push(chunk);
	}
	const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

	// readPath is the path to the file that Claude is trying to read
	const readPath =
		toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";

	// ensure Claude isn't trying to read the .env file
	const normalized = path.normalize(readPath);
	if (normalized.includes(".env") && !normalized.endsWith(".env.example")) {
		console.error("You cannot read .env file");
		process.exit(2);
	}
}

main();
