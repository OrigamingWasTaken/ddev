import pino from 'pino';

/** Pino logger instance, usable in the entire application */
export const plogger = pino({
	level: process.env.LOG_LEVEL || 'debug',
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
});
