import { Context, RegisterSlashCommand } from '@ddev';
import { SlashCommandBuilder } from 'discord.js';

RegisterSlashCommand({
	data: new SlashCommandBuilder()
		.setName('user_command')
		.setDescription('A user app test command'),
	execute(interaction) {
		interaction.reply({ content: 'Hello world!', ephemeral: true });
	},
	options: {
		userApp: {
			contexts: [Context.Guild, Context.Private, Context.User],
		},
	},
});
