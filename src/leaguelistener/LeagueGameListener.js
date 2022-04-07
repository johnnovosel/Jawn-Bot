import Summoner from './Summoner.js';
import fetch from 'node-fetch';
import { Config } from "../Config.js";
import fs from 'fs';
import makeBraille from './braileconverter.js';

const playerArr = [
  new Summoner("4syrFzdJLlvBW920mWb0jhtyZ0hydmxHia1nhkVWjZvGr1S9q0iaBlBCID_bQSZgZTs1sUCVflD6kw", "Itkovi", "AtaRIHyOIWfo3h_mU9NR0i-yaTqplS4gMuOWZIT4yGoF7I8", "166687107073572864"),
  new Summoner("umkbzSZkpZfXuLtwvnwEtPSOzbQkmJTMq7q8-uCFTDrtALaU0AKElqwugPZLuONYpLAt4rBYJT7_KA", "Cuckologist", "65oX0mYOLrvVz9EzLN-5hD6LP2664buuv-x2x0-w9tzLlnU", "168216574052925440"),
  new Summoner("Yid1_4VUGDmpe3-G_UUx0zO3QTSuAJGe0Qa5WsOqNLhI99CYgGct7uYVDQ4TywcxYuu_ggEmIE4Ogg", "Ferdora", "JpIARXJ0o2cwrB6A18N2zZMFnpU_le73qRHKi8gX3zTzn08", "125385861117378563"),
  new Summoner("g_1vGduAkjuonCMStnDs1LJEcnweJakngrEV6VqJOormAwNh2XtGrerSz6nrNN48xaiKLZsanuu3tA", "Call Me Lesh", "3fJjX7CeHt27QGTDCQRNkTAM2xI7XBJir4H-jGflJUZeSWc", "174565240883642369"),
  new Summoner("_dxORv64WpvdgMg4XlrrYz5ez6I_osZP0cD7ivHFD2II8zA50j91CceYkQO0-YC8Wg0kgUdrt0M_Vw", "Itko", "ry5t2mMLTsuwDKyB44XJIIp4aXOQ5sSSqZtkX2kOyBji5Ls", "166687107073572864"),
  new Summoner("lgfveyF-_GFs8NAEhVk6f912fUialbyH7WCpjIlyP0Z4v6pC7JgkS_oyAnP0Jbo9GpiPrrYjGsfqmQ", "Fustran", "C2fY0ehvFXxQUaciOPC3VkqMAaQccchG0NEv14GEwaX7Mzo", "166687107073572864")
];

// initialize player objects with player information
export default async function initializePlayers(client) {
  let games = await Promise.all(playerArr.map(obj => getSummonerInfo(obj.summonerId)));

  for (let i = 0; i < playerArr.length; i++) {
    if (games[i] === undefined) continue;

    playerArr[i].wins = games[i].wins;
    playerArr[i].losses = games[i].losses;
    playerArr[i].currentRank = games[i].rank;
    playerArr[i].currentTier = games[i].tier;
    playerArr[i].lp = games[i].leaguePoints;
  }
  console.table(playerArr);

  let s = fs.readFileSync("src\\leaguelistener\\winlossmedia\\winresponses.txt", 'utf-8');
  let winResponses = s.split('\r\n');

  s = fs.readFileSync("src\\leaguelistener\\winlossmedia\\lossresponses.txt", 'utf-8');
  let lossResponses = s.split('\r\n');

  // start listening for any update in the players
  setInterval(async () => {

    games = await Promise.all(playerArr.map(obj => getSummonerInfo(obj.summonerId)));

    for (let i = 0; i < playerArr.length; i++) {
      if (games[i] === null || games[i] === undefined) continue; //this dude hasn't played any ranked 5v5 games this season OR THERE was an error on api call so we can just wait 30 more seconds
      // if (games[i].wins === playerArr[i].wins && games[i].losses === playerArr[i].losses) continue; // if there is no change in win loss

      // else we check the win loss and the div change
      checkWinLoss(games[i], playerArr[i], client, lossResponses, winResponses);
      // check tier / rank change
    }

  }, 1000 * 4); // 30 seconds
};

// check if a player has played a game by checking if losses or wins in ranked 5v5 have increased
function checkWinLoss(game, player, client, lossResponses, winResponses) {

  game.wins -= 1;
  const channel = client.channels.cache.get(Config.testChannel);

  let LPDiff = game.leaguePoints - player.lp;

  if (game.wins > player.wins) {

    if (player.streak > 0) {
      player.streak++;
    } else {
      player.streak = 1;
    }

    // rank up
    if (game.leaguePoints < player.lp) {
      let difference = 100 - player.lp;
      LPDiff = difference + game.leaguePoints;
    }
    
    player.dailyGains += LPDiff;

    channel.send(`Thats a win for <@${player.discordID}> babyyyyyyy\nTotal gains: ${player.dailyGains} lp\nhttps://cdn.discordapp.com/attachments/125385898593484800/939006796817907733/half_of_a_rat.webm\n\nWin streak: ${player.streak}`);

    console.log(`GAME WON BY ` + player.playerName + `\n` + `HOMIE GAINED ` + (game.leaguePoints - player.lp) + ` LP!!`);
  } else {

    if (player.streak < 0) {
      player.streak--;
    } else {
      player.streak = -1;
    }

    // ranked down
    if (game.leaguePoints > player.lp) {
      let difference = 100 - game.leaguePoints;
      LPDiff = player.lp + difference;
      LPDiff *= -1; // need to change to negative number for below to work
    }

    player.dailyGains += LPDiff;

    let positiveStreak = player.streak * -1;
    
    let lossMessage = null;

    let statMessage = `\n\nTotal gains: ${player.dailyGains} lp\nLoss streak: ${positiveStreak}`;

    let chance = Math.random();

    if (chance < 0.22) {
      lossMessage = `
      ⠀⠀⠀
      ⠀⠀┻-━━━━━━━━━┻╮
       ┃╭╮╭╮┃
      ╭┫▕▎▕▎┣╮
      ╰┓┳╰╯┳┏╯    For You <@${player.discordID}>
      ╭┛╰━━╯┗━━━╮
      ┃┃    ┏━╭╰╯╮
      ┃┃    ┃┏┻━━┻┓
      ╰┫ ╭╮ ┃┃ ${game.leaguePoints - player.lp} lp       ┃
       ┃ ┃┃ ┃╰━━━━╯
      ╭┛ ┃┃ ┗-╮`;
    } else if (chance < .33) {
      lossMessage =  `<@${player.discordID}> Try looking at your map more! This should help your blind ass...\n`;
      lossMessage += makeBraille(lossResponses[(Math.floor(Math.random() * lossResponses.length))]) + `\n`;
      lossMessage += makeBraille(`Total gains: ${player.dailyGains} lp`) + `\n`;
      lossMessage += makeBraille(`Loss streak: ${positiveStreak}`) + `\n`;
      lossMessage += makeBraille(`-${game.leaguePoints - player.lp} lp`);
    } 
    else {
      lossMessage =  `<@${player.discordID}> `
      lossMessage += lossResponses[(Math.floor(Math.random() * lossResponses.length))];
      lossMessage += `\n\n-${game.leaguePoints - player.lp} lp`;
      lossMessage += statMessage;
    }

    channel.send(`${lossMessage}`);

    console.log('GAME LOST BY ' + player.playerName + '\n' + "HOMIE LOST " + (player.lp - game.leaguePoints) + ' LP!!');
  }

  player.lp = game.leaguePoints;
  player.wins = game.wins;
  player.losses = game.losses;
}

function checkTierRank() {

}




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
    console.log("Caused by ", error.cause)
    return null;
  }
}