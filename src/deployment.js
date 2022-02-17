import fs from 'fs';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Config } from "./Config.js";

const commands = [
	new SlashCommandBuilder().setName('lookup').setDescription('Replies with ranked 5v5 information').addStringOption(option =>
		option.setName('username')
			.setDescription('The username to lookup')
			.setRequired(true))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(Config.discordToken);

rest.put(Routes.applicationGuildCommands(Config.clientId, Config.guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);


// const commands = [];
// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
// 	const command = require(`./commands/${file}`);
// 	commands.push(command.data.toJSON());
// }