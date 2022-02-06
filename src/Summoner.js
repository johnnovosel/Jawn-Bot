const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import { Config } from "./Config.js";

export default class Summoner {
    puuid;
    summonerId;
    latestGame;
    playerName;
    wins;
    losses;
    lp;
    discordID;
    dailyGains;
    constructor(puuid, name, id, did) {
        this.puuid = puuid;
        this.playerName = name;
        this.summonerId = id;
        this.wins = 0;
        this.losses = 0;
        this.lp = 0;
        this.discordID = did;
        this.dailyGains = 0;
    }

    async getSummonerInfo() {
        let data;
        try {
            const response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + this.summonerId, {
            headers: {
                "X-Riot-Token": Config.riotToken
            }
        });
        data = await response.json();
        } catch (error) {
            console.error(error);
        }
        return data[0]?.queueType === 'RANKED_SOLO_5x5' ? data[0] : data[1];
    }
}