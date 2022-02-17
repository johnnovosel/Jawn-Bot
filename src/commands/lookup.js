import { SlashCommandBuilder } from'@discordjs/builders';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import { Config } from "../Config.js";

let last;
let combo = 0;

let data = new SlashCommandBuilder()
		.setName('lookup')
		.setDescription('Replies with ranked 5v5 information')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username to lookup')
                .setRequired(true))

async function execute(interaction) {
    const now = +new Date();
    if (now - last > 10000) { // 5 seconds
        last = +new Date();
        
        lookUpPlayer(interaction.options.getString('username'), interaction);

        combo = 0;
    } else {
        combo++;
        if(combo > 3) {
            await interaction.reply('Stop trying to break my bot you slut');
            return;
        } else if (combo > 5) {
            await interaction.reply('I HAVE A RATE LIMIT REEEEEEEEEEEE');
            return;
        }
        last = +new Date();
        await interaction.reply('Please wait 10 seconds inbetween requests');
    }
}

async function lookUpPlayer(username, interaction) {
    // get the summonerid
    console.log(username)
    let userData = null;
    let rankData = null;
    try {
        const response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + username, {
          headers: {
            "X-Riot-Token": Config.riotToken
          }
        });
        userData = await response.json();
      } catch (error) {
        console.error(error);
        interaction.reply('Shieeeet there was an error');
      }

      const summonerId = userData.id;

    // lookup profile based on that summoner id
    try {
        const response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summonerId, {
          headers: {
            "X-Riot-Token": Config.riotToken
          }
        });
        //return data[0]?.queueType === 'RANKED_SOLO_5x5' ? data[0] : data[1];
        rankData = await response.json();
      } catch (error) {
        console.error(error);
        interaction.reply('Shieeeet there was an error');
      }
      let ranked5v5Data = rankData[0]?.queueType === 'RANKED_SOLO_5x5' ? rankData[0] : rankData[1];

      if(ranked5v5Data === undefined) {
        interaction.reply("This player has not played any ranked 5v5 games")
        return;
      }

      interaction.reply(`
      Ranked information for ${username}:
      lp: ${ranked5v5Data.leaguePoints}
      tier: ${ranked5v5Data.tier}
      rank: ${ranked5v5Data.rank}
      wins: ${ranked5v5Data.wins}
      losses: ${ranked5v5Data.losses}
      more than 100 games at current rank: ${ranked5v5Data.veteran}
      `)
}

// solution for starting the timer for now
function startTimer() {
    last = +new Date();
}

export { data, execute, startTimer }