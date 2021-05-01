const noKeys = require("../../src/noKeys");

describe("For noKeys", () => {
    describe("When I pass a string data type", () => {
        it("should return a basic JSON object with the value set to a key of zero", () => {
            const sentence = "I am a string";
            const result = noKeys(sentence);
            expect(result).toStrictEqual({
                0: "I am a string"
            });
            expect(typeof result).toBe("object");
        });
    });

    describe("When I pass an array data type", () => {
        it("should set each value of the array to a numerical key in a JSON object", () => {
            const data = ["Each", "thing", "should", "be", "a", "value", 5];
            expect(noKeys(data)).toStrictEqual({
                0: "Each",
                1: "thing",
                2: "should",
                3: "be",
                4: "a",
                5: "value",
                6: 5
            });
        })
    });

    describe("When I pass an object data type", () => {
        it("should log that it is already an object and return it unchanged", () => {
            const obj = {
                0: "Hello",
                "id": "Object"
            };
            expect(noKeys(obj)).toStrictEqual(obj);
        })
    });

    describe("When I pass undefined", () => {
        it("should return an object describing the issue", () => {
            expect(noKeys(undefined)).toStrictEqual({
                status: "Not run",
                message: "Unable to identify content type"
            })
        })
    })
});