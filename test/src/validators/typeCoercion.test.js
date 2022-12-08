const { typeCoercion } = require("../../../src/validators");

describe("typeCoercion", () => {
  describe("When it is passed an input number value with a type to match", () => {
    it("Should ensure the input is returned as a number type", () => {
      const input = 3;
      const type = "number";
      expect(typeCoercion(input, type)).toEqual(3);
    });
  });
  describe("When it is passed an input number value as a string with a type to match", () => {
    it("Should ensure the input is returned as a number type", () => {
      const input2 = "3";
      const type2 = "number";
      expect(typeCoercion(input2, type2)).toEqual(3);
    });
  });
  describe("When it is passed a mixed value as a string with a type to match", () => {
    it("Should ensure the input as is with a warning logged", () => {
      const input2 = "3x";
      const type2 = "number";
      expect(typeCoercion(input2, type2)).toEqual("3x");
    });
  });
  describe("When it is passed a boolean and a type to match", () => {
    it("Should return the value without manipulation", () => {
      const input = true;
      const type = "boolean";
      expect(typeCoercion(input, type)).toEqual(true);
    });
  });
  describe("When it is passed a boolean in a string with a type of boolean", () => {
    it("Should return the value as a boolean", () => {
      const input = "false";
      const type = "boolean";
      expect(typeCoercion(input, type)).toEqual(false);
    });
  });
});
