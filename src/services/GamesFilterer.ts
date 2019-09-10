import { GameInfo } from "../models/GameInfo";
import { FilterOptions } from "../models/FilterOptions";



export class GamesFilterer {



    filter(outerCollection: GameInfo[], options?: FilterOptions): GameInfo[] {
        let collection = [...outerCollection];
        if (!options) {
            return collection;
        }
        const { playtime, playerCount } = options;
        if (playtime) {
            collection = this.filterOnTime(collection, playtime);
        }
        if (playerCount) {
            collection = this.filterOnPlayerCount(collection, playerCount);
        }
        return collection;
    }

    private filterOnTime(collection: GameInfo[], playtime: { minimum?: number; maximum?: number; }) {
        const { minimum = 0, maximum = 99999999 } = playtime;
        collection = collection.filter((game) =>
            (game.minPlaytime === playtime.minimum || minimum <= game.minPlaytime)
            &&
            (game.maxPlaytime === playtime.maximum || game.maxPlaytime <= maximum));
        return collection;
    }

    private filterOnPlayerCount(collection: GameInfo[], playerCount: number) {
        return collection.filter((game) => game.minPlayers <= playerCount && playerCount <= game.maxPlayers);
    }
}