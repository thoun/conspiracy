/*declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

declare const board: HTMLDivElement;*/

const GUILD_IDS = [1,2,3,4,5];

const LORDS_IDS = [1,2,3,4,5,6];

const LOCATIONS_UNIQUE_IDS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
const LOCATIONS_GUILDS_IDS = [100,101];

const LORD_WIDTH = 207.26;
const LORD_HEIGHT = 207;

const LOCATION_WIDTH = 186.24;
const LOCATION_HEIGHT = 124;
    
function getUniqueId(type: number, guild: number): number {
    return type * 10 + guild;
}

function setupLordCards(lordStocks: Stock[]) {
    const cardsurl = `${g_gamethemeurl}img/lords.jpg`;

    lordStocks.forEach(lordStock => 
        GUILD_IDS.forEach((guild, guildIndex) => 
            LORDS_IDS.forEach((lordType, index) =>
                lordStock.addItemType(
                    this.getUniqueId(lordType, guild), 
                    0, 
                    cardsurl, 
                    1 + guildIndex * LORDS_IDS.length + index
                )
            )
        )
    );
}

function setupLocationCards(locationStocks: Stock[]) {
    const cardsurl = `${g_gamethemeurl}img/locations.jpg`;

    locationStocks.forEach(locationStock => {

        LOCATIONS_UNIQUE_IDS.forEach((id, index) =>
            locationStock.addItemType(
                getUniqueId(id, 0), 
                0, 
                cardsurl, 
                1 + index
            )
        );

        GUILD_IDS.forEach((guild, guildIndex) => 
            LOCATIONS_GUILDS_IDS.forEach((id, index) =>
                locationStock.addItemType(
                    getUniqueId(id, guild), 
                    0, 
                    cardsurl, 
                    15 + GUILD_IDS.length * index + guildIndex
                )
            )
        );
    });
}