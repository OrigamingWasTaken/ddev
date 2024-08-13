import { $ } from 'bun';
import pino from 'pino';

const BINARY_NAME = 'ddev';

const start = performance.now();
const plogger = pino({
	transport: {
		target: 'pino-pretty',
	},
});
await $`rm -rf ./dist`;

const builds = {
	win64: [
		'bun',
		'build',
		'--compile',
		'--target=bun-linux-x64-baseline',
		'./src/index.ts',
		'--outfile',
		`dist/${BINARY_NAME}_win_x64.exe`,
	],
	linux64: [
		'bun',
		'build',
		'--compile',
		'--target=bun-linux-x64-baseline',
		'./src/index.ts',
		'--outfile',
		`dist/${BINARY_NAME}_linux_x64`,
	],
	linuxArm64: [
		'bun',
		'build',
		'--compile',
		'--target=bun-linux-arm64',
		'./src/index.ts',
		'--outfile',
		`dist/${BINARY_NAME}_linux_arm64`,
	],
	mac64: [
		'bun',
		'build',
		'--compile',
		'--target=bun-darwin-x64',
		'./src/index.ts',
		'--outfile',
		`dist/${BINARY_NAME}_macos_x64`,
	],
	macArm64: [
		'bun',
		'build',
		'--compile',
		'--target=bun-darwin-arm64',
		'./src/index.ts',
		'--outfile',
		`dist/${BINARY_NAME}_macos_arm64`,
	],
	default: ['bun', 'build', '--compile', './src/index.ts', '--outfile', `dist/${BINARY_NAME}`],
};

if (Bun.argv[2]) {
	switch (Bun.argv[2].slice(2)) {
		case 'windows':
			plogger.info('[1/1] Compiling app for win_x64');
			await Bun.spawn(builds.win64).exited;
			break;
		case 'linux':
			plogger.info('[1/2] Compiling app for linux_x64');
			await Bun.spawn(builds.linux64).exited;
			plogger.info('[2/2] Compiling app for linux_arm64');
			await Bun.spawn(builds.linuxArm64).exited;
			break;
		case 'macos':
			plogger.info('[1/2] Compiling app for mac_x64');
			await Bun.spawn(builds.mac64).exited;
			plogger.info('[2/2] Compiling app for mac_arm64');
			await Bun.spawn(builds.macArm64).exited;
			break;
		case 'all':
			plogger.info('[1/5] Compiling app for win_x64');
			await Bun.spawn(builds.win64).exited;
			plogger.info('[2/5] Compiling app for linux_x64');
			await Bun.spawn(builds.linux64).exited;
			plogger.info('[3/5] Compiling app for linux_arm64');
			await Bun.spawn(builds.linuxArm64).exited;
			plogger.info('[4/5] Compiling app for mac_x64');
			await Bun.spawn(builds.mac64).exited;
			plogger.info('[5/5] Compiling app for mac_arm64');
			await Bun.spawn(builds.macArm64).exited;
			break;
		default:
			plogger.info('[1/1] Compiling app...');
			await Bun.spawn(builds.default).exited;
	}
} else {
	plogger.info('[1/1] Compiling app...');
	await Bun.spawn(builds.default).exited;
}

plogger.info(`Build complete in ${(performance.now() - start).toFixed(2)}ms`);
await $`open dist`;
