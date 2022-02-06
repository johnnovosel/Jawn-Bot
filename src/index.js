import { Client, Intents } from 'discord.js'
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import Summoner from './Summoner.js';
import { Config } from "./Config.js";

const playerObjArray = [];

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

client.on("ready", async () => {
  console.log("Bot started");

  initalizePlayers();

  setInterval(getGames, 1000 * 30); // 30 seconds
});

client.login(Config.discordToken ?? "");

async function initalizePlayers() {
  playerObjArray.push(new Summoner("4syrFzdJLlvBW920mWb0jhtyZ0hydmxHia1nhkVWjZvGr1S9q0iaBlBCID_bQSZgZTs1sUCVflD6kw", "Itkovi", "AtaRIHyOIWfo3h_mU9NR0i-yaTqplS4gMuOWZIT4yGoF7I8", "166687107073572864"));
  playerObjArray.push(new Summoner("umkbzSZkpZfXuLtwvnwEtPSOzbQkmJTMq7q8-uCFTDrtALaU0AKElqwugPZLuONYpLAt4rBYJT7_KA", "Cuckologist", "65oX0mYOLrvVz9EzLN-5hD6LP2664buuv-x2x0-w9tzLlnU", "168216574052925440"));
  playerObjArray.push(new Summoner("Yid1_4VUGDmpe3-G_UUx0zO3QTSuAJGe0Qa5WsOqNLhI99CYgGct7uYVDQ4TywcxYuu_ggEmIE4Ogg", "Ferdora", "JpIARXJ0o2cwrB6A18N2zZMFnpU_le73qRHKi8gX3zTzn08", "125385861117378563"));
  playerObjArray.push(new Summoner("g_1vGduAkjuonCMStnDs1LJEcnweJakngrEV6VqJOormAwNh2XtGrerSz6nrNN48xaiKLZsanuu3tA", "Call Me Lesh", "3fJjX7CeHt27QGTDCQRNkTAM2xI7XBJir4H-jGflJUZeSWc", "174565240883642369"))
  
  const games = await Promise.all(playerObjArray.map(obj => obj.getSummonerInfo()));

  for (let i = 0; i < playerObjArray.length; i++) {
    if(games[i] === undefined) continue; //literally dont give a care

    playerObjArray[i].lp = games[i].leaguePoints;
    playerObjArray[i].wins = games[i].wins;
    playerObjArray[i].losses = games[i].losses;
  }
  console.log(playerObjArray)
}

async function getGames() {
  console.log("Checking for games")
  const games = await Promise.all(playerObjArray.map(obj => obj.getSummonerInfo()))
  for(let i = 0; i < playerObjArray.length; i++) {
    if(games[i] === undefined) continue;
    if(playerObjArray[i].wins === games[i].wins && playerObjArray[i].losses === games[i].losses) continue;
    
    if(games[i].wins > playerObjArray[i].wins) {
      console.log(`GAME WON BY ` + playerObjArray[i].playerName + `\n` + `HOMIE GAINED ` + (games[i].leaguePoints - playerObjArray[i].lp) + ` LP!!`);

      playerObjArray[i].dailyGains = games[i].leaguePoints - playerObjArray[i].lp;
      // client.channels.cache.get('125385898593484800').send(`${playerObjArray[i].playerName} HARD FUCKING CARRIED  HES SO FUCKING GOOD AHHHHHHHHHH \nand won ` + (games[i].leaguePoints - playerObjArray[i].lp) + ` LP!!` + `\nTotal daily gains: ${playerObjArray[i].dailyGains}`);
      client.channels.cache.get('125385898593484800').send(`Thats a win for ${playerObjArray[i].playerName} babyyyyyyy\nTotal daily gains: ${playerObjArray[i].dailyGains} lp\n\nhttps://cdn.discordapp.com/attachments/125385898593484800/939006796817907733/half_of_a_rat.webm`);

      playerObjArray[i].lp = games[i].leaguePoints;
      playerObjArray[i].wins = games[i].wins;
      playerObjArray[i].losses = games[i].losses;
    } else {
      console.log('GAME LOST BY ' + playerObjArray[i].playerName + '\n' + "HOMIE LOST " + (playerObjArray[i].lp - games[i].leaguePoints) + ' LP!!');

      playerObjArray[i].dailyGains = games[i].leaguePoints - playerObjArray[i].lp;
      client.channels.cache.get('125385898593484800').send(`
             ┻-━━━━┻╮
       ┃╭╮╭╮┃
      ╭┫▕▎▕▎┣╮
      ╰┓┳╰╯┳┏╯ For You ${playerObjArray[i].playerName}
      ╭┛╰━━╯┗━━━╮
      ┃┃    ┏━╭╰╯╮
      ┃┃    ┃┏┻━━┻┓
      ╰┫ ╭╮ ┃┃ ${games[i].leaguePoints - playerObjArray[i].lp} lp        ┃
       ┃ ┃┃ ┃╰━━━━╯
      ╭┛ ┃┃ ┗-╮
      
      Total daily gains: ${playerObjArray[i].dailyGains} lp`);

      playerObjArray[i].lp = games[i].leaguePoints;
      playerObjArray[i].wins = games[i].wins;
      playerObjArray[i].losses = games[i].losses;
    }

    playerObjArray[i].latestGame = games[i];
  }
}