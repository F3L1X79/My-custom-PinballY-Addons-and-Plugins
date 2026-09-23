// ============================================================
// Shared error guard for event handlers, timer callbacks and async menu
// commands. main.js only protects each script's init(), so an uncaught
// error in a handler would otherwise escape to the engine or become an
// unhandled promise rejection. Wrapped handlers
// log the error to logfile.log as "[<ScriptName>] ..." and never rethrow.
// ============================================================

/**
 * Writes an error caught in a handler to the PinballY log, tagged with the
 * name of the script it came from, including the stack trace when one exists.
 * @param {string} scriptName - Name of the script that owns the failing handler.
 * @param {unknown} error - The thrown value or rejection reason (not always an Error).
 * @returns {void}
 */
export function logHandlerError(scriptName, error) {
    let details;
    try {
        if (error instanceof Error) {
            // The stack already starts with "<Name>: <message>" in the engine,
            // so only fall back to the message when no stack is available.
            details = error.stack || error.message;
        } else {
            details = String(error);
        }
    } catch (formatError) {
        // A thrown value whose toString() itself throws must still be reported.
        details = "(unprintable error value)";
    }

    try {
        logfile.log(`[${scriptName}] ERROR in handler: ${details}`);
    } catch (logError) {
        // Last resort when logfile is unavailable, so the error is never lost.
        console.log(`[${scriptName}] ERROR in handler: ${details}`);
    }
}

/**
 * Wraps a handler so that a synchronous throw or an async rejection is
 * logged under the given script name instead of propagating. The event
 * argument(s), `this` and the return value are passed through unchanged, so
 * handlers relying on ev.preventDefault() or on returning a value still work.
 * @template {(...args: any[]) => any} T
 * @param {string} scriptName - Name used as the log prefix, e.g. "RatingPrompt".
 * @param {T} handler - The event handler, timer callback or async command to protect.
 * @returns {T} A handler with the same signature that never throws.
 */
export function safeHandler(scriptName, handler) {
    /**
     * Calls the wrapped handler and routes any failure to the log.
     * @this {unknown}
     * @param {...any} args - Arguments forwarded as-is to the wrapped handler.
     * @returns {any} Whatever the wrapped handler returned, or undefined if it threw.
     */
    function guardedHandler(...args) {
        let result;
        try {
            result = handler.apply(this, args);
        } catch (error) {
            logHandlerError(scriptName, error);
            return undefined;
        }

        // Attach a rejection handler but return the ORIGINAL promise, so callers
        // that inspect the return value see exactly what the handler produced.
        if (result && typeof result.then === "function") {
            result.then(undefined, error => logHandlerError(scriptName, error));
        }
        return result;
    }

    return /** @type {T} */ (/** @type {unknown} */ (guardedHandler));
}
