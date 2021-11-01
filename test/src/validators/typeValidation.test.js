const {typeValidation} = require("../../../src/validators");

describe("typeValidation", () => {
    describe("When it is passed an input number value with a type to match", () => {
        it("Should ensure the input is returned as a number type", () => {
            const input = 3;
            const type = "number";
            expect(typeValidation(input, type)).toEqual(3);
        })
    })
    describe("When it is passed an input number value as a string with a type to match", () => {
        it("Should ensure the input is returned as a number type", () => {
            const input2 = "3";
            const type2 = "number";
            expect(typeValidation(input2, type2)).toEqual(3);
        })
    })
})