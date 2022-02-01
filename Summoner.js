const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import { Config } from "./Config.js";

export default class Summoner {
    puuid;
    latestGame;
    constructor(puuid) {
        this.puuid = puuid;
    }

    async getLastestGame() {
        let data;
        try {
            const response = await fetch('https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/' + this.puuid +  '/ids?start=0&count=1', {
            headers: {
                "X-Riot-Token": Config.riotToken
            }
        })
        data = await response.json();
          } catch (error) {
            console.error(error);
        }
        this.latestGame = data[0]
    }
}