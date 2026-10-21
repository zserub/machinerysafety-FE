/**
 * Logger utility with environment-based log levels.
 *
 * In dev mode: All log levels are enabled (debug and above)
 * In production: Controlled by VITE_LOG_LEVEL env variable
 *
 * Log levels:
 *   0 = none (silent)
 *   1 = error
 *   2 = warn
 *   3 = info
 *   4 = debug (verbose)
 */

type LogLevelName = "none" | "error" | "warn" | "info" | "debug";

const LEVELS: Record<LogLevelName, number> = {
	none: 0,
	error: 1,
	warn: 2,
	info: 3,
	debug: 4,
};

function getLogLevel(): number {
	// In dev mode, enable all logs
	if (import.meta.env.DEV) {
		return LEVELS.debug;
	}

	// In production, check VITE_LOG_LEVEL env variable
	const envLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevelName) || "warn";
	return LEVELS[envLevel] ?? LEVELS.warn;
}

function formatTimestamp(): string {
	return new Date().toISOString().substring(11, 23); // HH:mm:ss.SSS
}

function formatContext(context?: string): string {
	return context ? `[${context}]` : "";
}

/**
 * Logger with support for optional context tags.
 *
 * Usage:
 *   logger.debug('message');
 *   logger.debug('message', { data });
 *   logger.withContext('API').info('Request sent');
 */
export const logger = {
	/**
	 * Debug level - verbose logging for development
	 */
	debug(message: string, ...args: unknown[]): void {
		if (getLogLevel() >= LEVELS.debug) {
			console.debug(`[${formatTimestamp()}] [DEBUG]`, message, ...args);
		}
	},

	/**
	 * Info level - general information
	 */
	info(message: string, ...args: unknown[]): void {
		if (getLogLevel() >= LEVELS.info) {
			console.info(`[${formatTimestamp()}] [INFO]`, message, ...args);
		}
	},

	/**
	 * Warn level - non-critical issues
	 */
	warn(message: string, ...args: unknown[]): void {
		if (getLogLevel() >= LEVELS.warn) {
			console.warn(`[${formatTimestamp()}] [WARN]`, message, ...args);
		}
	},

	/**
	 * Error level - critical failures
	 */
	error(message: string, ...args: unknown[]): void {
		if (getLogLevel() >= LEVELS.error) {
			console.error(`[${formatTimestamp()}] [ERROR]`, message, ...args);
		}
	},

	/**
	 * Create a logger with a context prefix for easier identification.
	 *
	 * Usage:
	 *   const apiLogger = logger.withContext('API');
	 *   apiLogger.debug('Request sent');
	 *   // Output: [12:34:56.789] [DEBUG] [API] Request sent
	 */
	withContext(context: string) {
		const ctx = formatContext(context);
		return {
			debug: (message: string, ...args: unknown[]) => {
				if (getLogLevel() >= LEVELS.debug) {
					console.debug(`[${formatTimestamp()}] [DEBUG] ${ctx}`, message, ...args);
				}
			},
			info: (message: string, ...args: unknown[]) => {
				if (getLogLevel() >= LEVELS.info) {
					console.info(`[${formatTimestamp()}] [INFO] ${ctx}`, message, ...args);
				}
			},
			warn: (message: string, ...args: unknown[]) => {
				if (getLogLevel() >= LEVELS.warn) {
					console.warn(`[${formatTimestamp()}] [WARN] ${ctx}`, message, ...args);
				}
			},
			error: (message: string, ...args: unknown[]) => {
				if (getLogLevel() >= LEVELS.error) {
					console.error(`[${formatTimestamp()}] [ERROR] ${ctx}`, message, ...args);
				}
			},
		};
	},
};

// Pre-configured loggers for common contexts
export const apiLogger = logger.withContext("API");
export const authLogger = logger.withContext("Auth");
export const storeLogger = logger.withContext("Store");
export const uiLogger = logger.withContext("UI");
