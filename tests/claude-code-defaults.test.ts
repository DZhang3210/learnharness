import assert from "node:assert/strict";
import { test } from "node:test";
import { CLAUDE_CODE_PROVIDER } from "../src/core/contracts/claude-code.ts";
import { CURRENT_SETTINGS_VERSION, slotsConfigured, withClaudeCodeDefaults } from "../src/core/settings.ts";

test("first boot runs on Claude Code with every slot filled", () => {
	const s = withClaudeCodeDefaults(null);
	assert.equal(s.version, CURRENT_SETTINGS_VERSION);
	assert.equal(s.claudeCode?.enabled, true);
	assert.ok(slotsConfigured(s.models));
	assert.deepEqual(s.models?.strong?.model, { provider: CLAUDE_CODE_PROVIDER, id: "sonnet" });
	assert.deepEqual(s.models?.cheap?.model, { provider: CLAUDE_CODE_PROVIDER, id: "haiku" });
	assert.deepEqual(s.models?.vision?.model, { provider: CLAUDE_CODE_PROVIDER, id: "sonnet" });
});

test("models the user picked are kept; only empty slots are filled", () => {
	const picked = { provider: "anthropic", id: "claude-opus-5-5" };
	const s = withClaudeCodeDefaults({ version: 1, models: { strong: { model: picked, thinkingLevel: "high" }, cheap: { thinkingLevel: "low" } } });
	assert.deepEqual(s.models?.strong, { model: picked, thinkingLevel: "high" });
	assert.deepEqual(s.models?.cheap, { thinkingLevel: "low", model: { provider: CLAUDE_CODE_PROVIDER, id: "haiku" } });
});

test("an explicit opt-out of Claude Code is respected", () => {
	const s = withClaudeCodeDefaults({ version: 1, claudeCode: { enabled: false } });
	assert.equal(s.claudeCode?.enabled, false);
	assert.equal(s.models, undefined);
});

test("the input record is not mutated", () => {
	const record = { version: 1, models: {} };
	withClaudeCodeDefaults(record);
	assert.deepEqual(record, { version: 1, models: {} });
});
