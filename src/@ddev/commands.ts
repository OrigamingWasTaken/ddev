import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { PinoLogger } from '@ddev';
import {
	type ChatInputCommandInteraction,
	type Client,
	Collection,
	REST,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
	type SlashCommandBuilder,
} from 'discord.js';
import { glob } from 'glob';

export interface Command {
	/** Command data */
	data: SlashCommandBuilder;
	/** Async function to execute when the command is used */
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
	options?: {
		/** Only register the command in these guilds */
		guilds?: string[];
		/** Only allow the command to be used in DMs */
		cooldown?: number;
	};
}

export type CommandCollection = Collection<any, Command>;

// Commands collection
const commands: CommandCollection = new Collection();

/** Register a slash command */
export async function registerCommand(cmd: Command) {
	commands.set(cmd.data.name, cmd);
}

/** Deploy all slash commands */
export async function deploy(client: Client) {
	await importCommands();
	client.commands = commands;

	// Commands are the same as last deploy
	if (areCommandsCached(commands)) {
		PinoLogger.info('Deploy skipped because current commands are identical as last deploy.');
		return;
	}

	PinoLogger.info(`Deploying ${client.commands.size} total commands:`);
	for (const cmd of client.commands) {
		PinoLogger.info(`	- ${cmd[1].data.name}`);
	}

	const rest = new REST().setToken(Bun.env.BOT_TOKEN);

	const globalCommands = client.commands
		.filter((cmd) => !cmd.options?.guilds)
		.map((c) => c.data.toJSON());
	PinoLogger.info(`Deploying ${globalCommands.length} global commands.`);
	const data = (await rest.put(Routes.applicationCommands(Bun.env.APPLICATION_ID.toString()), {
		body: globalCommands,
	})) as Array<any>;
	PinoLogger.info(`Successfully deployed ${data.length} global commands.`);

	// We first get all guilds so old commands will also be removed

	const guildCommands = client.commands.filter((cmd) => cmd.options?.guilds).map((c) => c);
	const guilds: Collection<string, RESTPostAPIChatInputApplicationCommandsJSONBody[]> =
		new Collection();
	for (const command of guildCommands) {
		if (!command.options?.guilds) continue;
		// biome-ignore lint: command.options.guilds cannot be undefined here
		for (const guild of command.options?.guilds) {
			if (!guilds.has(guild)) {
				guilds.set(guild, []);
			}
			guilds.get(guild)?.push(command.data.toJSON());
		}
	}

	for (const guild of guilds) {
		const data = (await rest.put(
			Routes.applicationGuildCommands(Bun.env.APPLICATION_ID.toString(), guild[0]),
			{ body: [...new Set(guild[1])] }
		)) as { length: number };
		PinoLogger.info(
			`Successfully deployed ${data.length} commands for the '${guild[0]}' guild.`
		);
	}
}

/** Import every typescript file in the commands folder */
async function importCommands() {
	const commandsPath = resolve('src/commands');

	const commandFiles = await glob('**/*.cmd.ts', { cwd: commandsPath });

	for (const file of commandFiles) {
		await import(join(commandsPath, file));
	}
}

function deepEqual(obj1: any, obj2: any): boolean {
	if (obj1 === obj2) return true;

	if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
		return obj1 === obj2;
	}

	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) return false;

	for (const key of keys1) {
		if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
			return false;
		}
	}

	return true;
}

/** Check to see if the command data has changed, and if yes, then cache */
function areCommandsCached(commandCollection: CommandCollection): boolean {
	// We stringify and parse to remove any non-json property
	const commands = JSON.parse(JSON.stringify(commandCollection.map((c) => c)));
	const cachePath = resolve('src/@ddev/.cache.json');
	if (!existsSync(cachePath)) {
		writeFileSync(cachePath, '[]', 'utf-8');
	}
	const cacheJson = JSON.parse(readFileSync(cachePath, 'utf-8'));

	if (deepEqual(commands, cacheJson)) {
		return true;
	}

	writeFileSync(cachePath, JSON.stringify(commands), 'utf-8');
	return false;
}
