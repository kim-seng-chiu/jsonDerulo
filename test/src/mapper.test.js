const mapper = require("../../src/mapper");
const { input1, input2, template } = require("../mocks/mapper/data.mock");
describe("mapper", () => {
  describe("When given an input object and a template to match", () => {
    it("Should map the input object the new template keys and return it as an object", () => {
      expect(mapper(input1, template)).toMatchObject({
        Title: "Catcher in the Rye",
        Author: "J.D. Salinger",
        YearPublished: "1951",
        IsFiction: true,
        NumberOfPages: 234
      });
    });
  });
});
