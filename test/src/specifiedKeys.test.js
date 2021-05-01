const specifiedKeys = require("../../src/specifiedKeys");

describe("For specifiedKeys", () => {
    describe("If I give it an array of keys and an array of data", () => {
        it("should return an array of JSON objects", () => {
            const keys = ["id", "name", "type"];
            const values = [[1, "beans", "canned_foods"], [2, "apricots", "fresh_fruit"], [3, "bread", "bakery"]];
            expect(specifiedKeys(keys, values)).toStrictEqual([
                {
                    id: 1,
                    name: "beans",
                    type: "canned_foods"
                },
                {
                    id: 2,
                    name: "apricots",
                    type: "fresh_fruit"
                },
                {
                    id: 3,
                    name: "bread",
                    type: "bakery"
                }
            ])
        })
    })
})