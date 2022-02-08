import { Client, Intents } from 'discord.js'
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import Summoner from './Summoner.js';
import { Config } from "./Config.js";

const playerObjArray = [
  new Summoner("4syrFzdJLlvBW920mWb0jhtyZ0hydmxHia1nhkVWjZvGr1S9q0iaBlBCID_bQSZgZTs1sUCVflD6kw", "Itkovi", "AtaRIHyOIWfo3h_mU9NR0i-yaTqplS4gMuOWZIT4yGoF7I8", "166687107073572864"),
  new Summoner("umkbzSZkpZfXuLtwvnwEtPSOzbQkmJTMq7q8-uCFTDrtALaU0AKElqwugPZLuONYpLAt4rBYJT7_KA", "Cuckologist", "65oX0mYOLrvVz9EzLN-5hD6LP2664buuv-x2x0-w9tzLlnU", "168216574052925440"),
  new Summoner("Yid1_4VUGDmpe3-G_UUx0zO3QTSuAJGe0Qa5WsOqNLhI99CYgGct7uYVDQ4TywcxYuu_ggEmIE4Ogg", "Ferdora", "JpIARXJ0o2cwrB6A18N2zZMFnpU_le73qRHKi8gX3zTzn08", "125385861117378563"),
  new Summoner("g_1vGduAkjuonCMStnDs1LJEcnweJakngrEV6VqJOormAwNh2XtGrerSz6nrNN48xaiKLZsanuu3tA", "Call Me Lesh", "3fJjX7CeHt27QGTDCQRNkTAM2xI7XBJir4H-jGflJUZeSWc", "174565240883642369"),
  new Summoner("_dxORv64WpvdgMg4XlrrYz5ez6I_osZP0cD7ivHFD2II8zA50j91CceYkQO0-YC8Wg0kgUdrt0M_Vw", "Itko", "ry5t2mMLTsuwDKyB44XJIIp4aXOQ5sSSqZtkX2kOyBji5Ls", "166687107073572864")];

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


// get ranked 5v5 information for the list of players 
async function initalizePlayers() {
  const games = await Promise.all(playerObjArray.map(obj => obj.getSummonerInfo()));

  for (let i = 0; i < playerObjArray.length; i++) {
    if(games[i] === undefined) continue; // skip if they have not played any ranked games

    playerObjArray[i].lp = games[i].leaguePoints;
    playerObjArray[i].wins = games[i].wins;
    playerObjArray[i].losses = games[i].losses;
    playerObjArray[i].currentRank = games[i].rank;
    playerObjArray[i].currentTier = games[i].tier;
  }
  console.log(playerObjArray)
}

async function getGames() {
  console.log("Checking for games")
  const games = await Promise.all(playerObjArray.map(obj => obj.getSummonerInfo()))
  for(let i = 0; i < playerObjArray.length; i++) {
    
    checkWinLoss(games[i], playerObjArray[i]);
  }
}

function checkWinLoss(game, player) {
  if(game === undefined) return; // skip if they have not played any ranked games
  if(player.wins === game.wins && player.losses === game.losses) return;

  if(game.wins > player.wins) {
    if(player.playerName === 'Itko') {
      client.channels.cache.get('125385898593484800').send(`You cannot hide from me Warren\n`);
    }
    console.log(`GAME WON BY ` + player.playerName + `\n` + `HOMIE GAINED ` + (game.leaguePoints - player.lp) + ` LP!!`);

    player.dailyGains = game.leaguePoints - player.lp;
    client.channels.cache.get('125385898593484800').send(`Thats a win for ${player.playerName} babyyyyyyy\nTotal daily gains: ${player.dailyGains} lp\nhttps://cdn.discordapp.com/attachments/125385898593484800/939006796817907733/half_of_a_rat.webm`);

    player.lp = game.leaguePoints;
    player.wins = game.wins;
    player.losses = game.losses;
  } else {
    console.log('GAME LOST BY ' + player.playerName + '\n' + "HOMIE LOST " + (player.lp - game.leaguePoints) + ' LP!!');
    if(player.playerName === 'Itko') {
      client.channels.cache.get('125385898593484800').send(`You cannot hide from me Warren\n`);
    }
    player.dailyGains = game.leaguePoints - player.lp;
    client.channels.cache.get('125385898593484800').send(`
             ┻-━━━━┻╮
    ┃╭╮╭╮┃
╭┫▕▎▕▎┣╮
 ╰┓┳╰╯┳┏╯ For You ${player.playerName}
 ╭┛╰━━╯┗━━━╮
┃┃    ┏━╭╰╯╮
 ┃┃    ┃┏┻━━┻┓
 ╰┫ ╭╮ ┃┃ ${game.leaguePoints - player.lp} lp      ┃
  ┃ ┃┃ ┃╰━━━━╯
 ╭┛ ┃┃ ┗-╮
    
    Total daily gains: ${player.dailyGains} lp`);

    player.lp = game.leaguePoints;
    player.wins = game.wins;
    player.losses = game.losses;
  }

  player.latestGame = game;
}