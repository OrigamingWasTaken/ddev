import { RegisterEvent } from '@ddev';
import { codeBlock } from 'discord.js';

RegisterEvent({
	name: 'interactionCreate',
	listener(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				interaction.reply(
					codeBlock(`The command "${interaction.commandName}" wasn't found.`)
				);
				return;
			}
			command.execute(interaction);
		}
	},
});
