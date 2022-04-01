export default class Summoner {
    puuid;
    summonerId;
    latestGame;
    playerName;
    wins;
    losses;
    lp;
    discordID;
    dailyGains;  // Cumulitive LP
    currentTier; //"PLAT"
    currentRank; //"IV"
    streak;
    constructor(puuid, name, id, did) {
        this.puuid = puuid;
        this.playerName = name;
        this.summonerId = id;
        this.wins = 0;
        this.losses = 0;
        this.lp = 0;
        this.dailyGains = 0;
        this.discordID = did;
        this.currentRank = "IV";
        this.currentTier = "IRON"
        this.latestGame = null;
        this.streak = 0;
    }
}