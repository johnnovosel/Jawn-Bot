import { Client, Intents } from 'discord.js'
import { Config } from "./Config.js";
import LeagueListener from './LeagueGameListener.js'

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

client.on("ready", async () => {
  console.log("Bot started");

  LeagueListener(client);
});

client.login(Config.discordToken ?? "");

export default { client };