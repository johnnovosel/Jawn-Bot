import { Client, Intents, Collection } from 'discord.js';
import { Config } from "./Config.js";
import LeagueListener from './LeagueGameListener.js';
import fs from 'fs';
import { startTimer } from './commands/lookup.js';
import startSearch from './wordleSolver.js';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = await import (`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client?.commands?.set(command?.data?.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction?.isCommand()) return;

	const command = client?.commands?.get(interaction?.commandName);

	if (!command) return;

	try {
		await command?.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction?.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on("ready", async () => {
  console.log("Bot started");

  LeagueListener(client);
  startTimer();
  startSearch(client);
});

client.login(Config.discordToken ?? "");

export default { client };