import '@ddev/init';
import { DeploySlashCommands, LoadEvents, PinoLogger } from '@ddev';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.commands = new Collection();

client.once(Events.ClientReady, async (c) => {
	PinoLogger.info(`Ready! Logged in as ${c.user.tag}`);
	await DeploySlashCommands(c);
	PinoLogger.info('Finished deploying slash commands');
	await LoadEvents(c);
	PinoLogger.info('Finished loading events');
});

client.login(Bun.env.BOT_TOKEN);
