/** Plugins use the documented per-server initialization hook. A plugin failure
 * must not prevent access to existing learning data or teaching/practice. */
export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		// Fork: first boot runs on Claude Code (no API keys needed).
		const { seedClaudeCodeDefaults } = await import("./src/store/settings.ts");
		try { seedClaudeCodeDefaults(); }
		catch (error) { console.error("[settings] Could not save the Claude Code defaults:", error); }
		const { initializePlugins } = await import("./src/server/plugins.ts");
		try { await initializePlugins(); }
		catch (error) { console.error("[plugins] Initialization failed; plugin management will report the error:", error); }
	}
}
