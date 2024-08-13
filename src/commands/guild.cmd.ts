import { RegisterSlashCommand } from '@ddev';
import { SlashCommandBuilder } from 'discord.js';

RegisterSlashCommand({
	data: new SlashCommandBuilder()
		.setName('guild_command')
		.setDescription('Just a test guild_command'),
	async execute(interaction) {
		await interaction.reply('Haii :3! 🫵 are cute >.<');
	},
	options: {
		guilds: ['1171557764703723611'],
	},
});
