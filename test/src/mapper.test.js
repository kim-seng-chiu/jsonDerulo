const mapper = require("../../src/mapper");
const { input1, input2, input3 } = require("../mocks/mapper/data.mock");
const {bookTemplate} = require("../mocks/mapper/template.mock");
describe("mapper", () => {
  describe("When given an input object and a template to match", () => {
    it("Should map the input object the new template keys and return it as an object", () => {
      expect(mapper(input1, bookTemplate)).toMatchObject({
        OverallRating: null,
        AdditionalInfo: { Genre: null, Publisher: null },
        Title: "Catcher in the Rye",
        Author: { Name: "J.D. Salinger", Origin: null },
        YearPublished: "1951",
        IsFiction: true,
        NumberOfPages: 234,
      });
    });
    it("Should map the input object to new template keys with the desired data structure", () => {
      expect(mapper(input2, bookTemplate)).toMatchObject({
        OverallRating: null,
        AdditionalInfo: {
          Genre: null,
          Publisher: null,
        },
        Title: "Nineteen Eighty-Four",
        Author: { Name: "George Orwell", Origin: "England" },
        YearPublished: "1949",
        IsFiction: true,
        NumberOfPages: 328,
      });
    });
    it("Should map the input object to new template keys with the desired data structure", () => {
      expect(mapper(input3, bookTemplate)).toMatchObject({
        OverallRating: 95,
        AdditionalInfo: {
          Genre: "Business & Commerce",
          Publisher: "Penguin Publishing Group",
        },
        Title: "Atomic Habits",
        Author: { Name: "James Clear", Origin: "USA" },
        YearPublished: 2018,
        IsFiction: null,
        NumberOfPages: 320,
      });
    });
  });
});
