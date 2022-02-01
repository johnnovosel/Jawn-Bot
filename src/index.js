import { Client, Intents } from 'discord.js'
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import Summoner from './Summoner.js';
import { Config } from "./Config.js";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

client.on("ready", async () => {
  console.log("Bot started");
  var summoner = new Summoner("umkbzSZkpZfXuLtwvnwEtPSOzbQkmJTMq7q8-uCFTDrtALaU0AKElqwugPZLuONYpLAt4rBYJT7_KA")
  await summoner.getLastestGame();
  console.log(summoner.latestGame)

});

client.on("message", msg => {
  console.log(msg);
});


client.login(Config.discordToken ?? "");

// async function getUser() {
//     try {
//         const response = await fetch('https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/pKpJUczkiZbxotDYNAvs_29P35zuvZfuy5YxwDThQUj0098CBjRoNPY3--FiE-4rSb2IcibzS41S8Q', {
//         headers: {
//             "X-Riot-Token": ""
//         }
//     })
//     let data = await response.json();
//     console.log(data)
//       } catch (error) {
//         console.error(error);
//       }
// }