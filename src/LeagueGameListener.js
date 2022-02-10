import Summoner from './Summoner.js';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import { Config } from "./Config.js";

let client = null;

const playerArr = [
  new Summoner("4syrFzdJLlvBW920mWb0jhtyZ0hydmxHia1nhkVWjZvGr1S9q0iaBlBCID_bQSZgZTs1sUCVflD6kw", "Itkovi", "AtaRIHyOIWfo3h_mU9NR0i-yaTqplS4gMuOWZIT4yGoF7I8", "166687107073572864"),
  // new Summoner("umkbzSZkpZfXuLtwvnwEtPSOzbQkmJTMq7q8-uCFTDrtALaU0AKElqwugPZLuONYpLAt4rBYJT7_KA", "Cuckologist", "65oX0mYOLrvVz9EzLN-5hD6LP2664buuv-x2x0-w9tzLlnU", "168216574052925440"),
  // new Summoner("Yid1_4VUGDmpe3-G_UUx0zO3QTSuAJGe0Qa5WsOqNLhI99CYgGct7uYVDQ4TywcxYuu_ggEmIE4Ogg", "Ferdora", "JpIARXJ0o2cwrB6A18N2zZMFnpU_le73qRHKi8gX3zTzn08", "125385861117378563"),
  // new Summoner("g_1vGduAkjuonCMStnDs1LJEcnweJakngrEV6VqJOormAwNh2XtGrerSz6nrNN48xaiKLZsanuu3tA", "Call Me Lesh", "3fJjX7CeHt27QGTDCQRNkTAM2xI7XBJir4H-jGflJUZeSWc", "174565240883642369"),
  // new Summoner("_dxORv64WpvdgMg4XlrrYz5ez6I_osZP0cD7ivHFD2II8zA50j91CceYkQO0-YC8Wg0kgUdrt0M_Vw", "Itko", "ry5t2mMLTsuwDKyB44XJIIp4aXOQ5sSSqZtkX2kOyBji5Ls", "166687107073572864")
];

// initialize player objects with player information
export default async function initializePlayers(clientPass) {
  const games = await Promise.all(playerArr.map(obj => getSummonerInfo(obj.summonerId)));
  
  for (let i = 0; i < playerArr.length; i++) {
    if(games[i] === undefined) continue;

    playerArr[i].wins = games[i].wins;
    playerArr[i].losses = games[i].losses;
    playerArr[i].currentRank = games[i].rank;
    playerArr[i].currentTier = games[i].tier;
    playerArr[i].lp = games[i].leaguePoints;
  }
  console.log(playerArr)

  client = clientPass

  // start listening for any update in the players
  setInterval(updatePlayerStats, 1000 * 5); // 30 seconds
};

// grab player information
async function getSummonerInfo(summonerId) {
  try {
    const response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summonerId, {
      headers: {
        "X-Riot-Token": Config.riotToken
      }
    });
    let data = await response.json();
    return data[0]?.queueType === 'RANKED_SOLO_5x5' ? data[0] : data[1];
  } catch (error) {
    console.error(error);
    return null;
  }
}

// check every 30 seconds and compare to current player data
// if there is a change take appropriate action
async function updatePlayerStats() {
  console.log("Checking for games");
  const games = await Promise.all(playerArr.map(obj => getSummonerInfo(obj.summonerId)));
  for(let i = 0; i < playerArr.length; i++) {
    if(games[i] === undefined) continue; //this dude hasn't played any ranked 5v5 games this season
    checkWinLoss(games[i], playerArr[i]);
  }
}

// check if a player has played a game by checking if losses or wins in ranked 5v5 have increased
function checkWinLoss(game, player) {
  game.wins = 80;
  game.leaguePoints = 99;
    if(player.wins === game.wins && player.losses === game.losses) return; // has not played a game

    const channel = client.channels.cache.get("931418680074596455");

    if(game.wins > player.wins) {
      console.log(`GAME WON BY ` + player.playerName + `\n` + `HOMIE GAINED ` + (game.leaguePoints - player.lp) + ` LP!!`);

      player.dailyGains = game.leaguePoints - player.lp;
      channel.send(`Thats a win for ${player.playerName} babyyyyyyy\nTotal daily gains: ${player.dailyGains} lp\nhttps://cdn.discordapp.com/attachments/125385898593484800/939006796817907733/half_of_a_rat.webm`);

    } else {
      console.log('GAME LOST BY ' + player.playerName + '\n' + "HOMIE LOST " + (player.lp - game.leaguePoints) + ' LP!!');

      player.dailyGains = game.leaguePoints - player.lp;
      channel.send(`
      ⠀⠀⠀
      ⠀⠀┻-━━━━━━━━━┻╮
       ┃╭╮╭╮┃
      ╭┫▕▎▕▎┣╮
      ╰┓┳╰╯┳┏╯    For You ${player.playerName}
      ╭┛╰━━╯┗━━━╮
      ┃┃    ┏━╭╰╯╮
      ┃┃    ┃┏┻━━┻┓
      ╰┫ ╭╮ ┃┃ ${game.leaguePoints - player.lp} lp     ┃
       ┃ ┃┃ ┃╰━━━━╯
      ╭┛ ┃┃ ┗-╮

      Total daily gains: ${player.dailyGains} lp`);
    }

    player.lp = game.leaguePoints;
    player.wins = game.wins;
    player.losses = game.losses;
}