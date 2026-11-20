import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";

// Isolate disk state BEFORE any application import.
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lh-claude-code-seed-"));
process.env.LH_DATA_DIR = path.join(directory, "data");
after(() => fs.rmSync(directory, { recursive: true, force: true }));

const { readSettings, seedClaudeCodeDefaults, writeSettings } = await import("../src/store/settings.ts");
const { slotsConfigured } = await import("../src/core/settings.ts");

test("first boot saves Claude Code as the provider and models, once", () => {
	assert.equal(readSettings(), null);
	assert.equal(seedClaudeCodeDefaults(), true);
	const saved = readSettings();
	assert.equal(saved?.claudeCode?.enabled, true);
	assert.ok(slotsConfigured(saved?.models));

	// The user's later choices stick: seeding never runs over an existing file.
	writeSettings({ ...saved, claudeCode: { enabled: false } });
	assert.equal(seedClaudeCodeDefaults(), false);
	assert.equal(readSettings()?.claudeCode?.enabled, false);
});
