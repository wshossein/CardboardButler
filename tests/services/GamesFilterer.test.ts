import "@testing-library/jest-dom/extend-expect";
import { GamesFilterer } from "../../src/services/GamesFilterer";
import { alchemists, alchemistsTheKing, sevenWonders, smallWorld } from "./model/TestGames";
import { GameInfo } from "../../src/models/GameInfo";
import * as fetchMock from "fetch-mock";
import { getHugeCollection } from "./BggGameService.test";

describe("Filtering games", () => {
    const testGame1 = alchemists();
    const testGame2 = alchemistsTheKing();
    const testGame3 = sevenWonders();
    const testGame4 = smallWorld();
    const testCollection = [testGame1, testGame2, testGame3, testGame4];
    const filterer = new GamesFilterer();

    describe("default", () => {
        it("does not filter", () => {
            const result = filterer.filter(testCollection);
            expect(result.length).toEqual(testCollection.length);
        });

    });


    describe("games time filtering", () => {


        it("filters pesimisticly, games must be without the set time limit", () => {
            const filterOptions = {
                playtime: {
                    minimum: 30,
                    maximum: 60
                }
            };
            const result = filterer.filter(testCollection, filterOptions);
            expect(result).toHaveLength(1);
            expect(result).toEqual([testGame3]);
        });

        it("can handle infinite bounds maximum  ", () => {
            const filterOptions = {
                playtime: {
                    minimum: 60
                }
            };
            const filterer = new GamesFilterer();
            const result = filterer.filter(testCollection, filterOptions);
            expect(result).toHaveLength(2);
            expect(result).toEqual([testGame1, testGame2]);
        });

        it("can handle infinite bounds minimum  ", () => {
            const filterOptions = {
                playtime: {
                    maximum: 90
                }
            };
            const result = filterer.filter(testCollection, filterOptions);
            expect(result).toHaveLength(2);
            expect(result).toEqual([testGame3, testGame4]);
        });

        it("can handle if game has missing limits", () => {
            const fakeGame: GameInfo = {
                name: "FakeGame",
                thumbnailUrl: "Url",
                yearPublished: 2012,
                families: [],
                averagerating: 8,
                id: 2323,
                minPlaytime: 60,
                imageUrl: "ImageUrl"
            };
            const fakeCollection = [fakeGame];
            const filterOptions = {
                playtime: {
                    minimum: 30
                }
            };
            const result = filterer.filter(fakeCollection, filterOptions);
            expect(result).toHaveLength(1);
        });
        it("can handle if game has no limit", () => {
            const fakeGame: GameInfo = {
                name: "FakeGame",
                thumbnailUrl: "Url",
                yearPublished: 2012,
                families: [],
                averagerating: 8,
                id: 2323,
                imageUrl: "ImageUrl"
            };
            const fakeCollection = [fakeGame];
            const filterOptions = {
                playtime: {
                    maximum: 90
                }
            };
            const result = filterer.filter(fakeCollection, filterOptions);
            expect(result).toHaveLength(0);
        });
    });

    describe("player count time filtering", () => {
        it("filters on player count", () => {
            const result = filterer.filter(testCollection, {
                playerCount: 5
            });
            expect(result).toEqual([testGame3, testGame4]);
        });
    });

    describe("filtering large collections", () => {
        it("filter large collections", async () => {
            const largeCollection = await getHugeCollection();
            expect(largeCollection).toHaveLength(360);
            if (Array.isArray(largeCollection)) {
                const result = filterer.filter(largeCollection, {
                    playerCount: 5,
                    playtime: { minimum: 30, maximum: 80 }
                });
                expect(result).toHaveLength(100);
                expect(result).toMatchSnapshot();
            }
        });
    });

    describe("sorting", () => {
        it("sorts by name by default", () => {
            const onOrdered = [testGame2, testGame3, testGame1, testGame4];
            const nameOrdered = [testGame3, testGame1, testGame2, testGame4];
            const result = filterer.filter(onOrdered);
            expect(result.map((r) => r.name)).toEqual(nameOrdered.map((r) => r.name));
        });
        it("can sort by bggranking", () => {
            const onOrdered = [testGame1, testGame2, testGame3, testGame4];
            const rankordering = [testGame2, testGame3, testGame1, testGame4];
            const result = filterer.filter(onOrdered, { sortOption: "bggrating" });
            expect(result.map((r) => r.averagerating)).toEqual(rankordering.map((r) => r.averagerating));
        });
    });
});
