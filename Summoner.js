const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
                "X-Riot-Token": "RGAPI-612d80c7-f928-4805-82f3-abb22aa04d23"
            }
        })
        data = await response.json();
          } catch (error) {
            console.error(error);
        }
        this.latestGame = data[0]
    }
}