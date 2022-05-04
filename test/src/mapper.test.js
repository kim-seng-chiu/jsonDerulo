/** @format */

const mapper = require("../../src/mapper");
const { input1, input2, input3 } = require("../mocks/mapper/data.mock");
const { bookTemplate } = require("../mocks/mapper/template.mock");
describe("mapper", () => {
  describe("When given an input object and a template to match", () => {
    it("Should map the input object the new template keys and return it as an object", () => {
      expect(mapper(input1, bookTemplate)).toMatchObject({
        OverallRating: null,
        AdditionalInfo: { Genre: null, Publisher: null },
        Title: "Catcher in the Rye",
        Author: { Name: "J.D. Salinger", Origin: "USA" },
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
        IsFiction: false,
        NumberOfPages: 320,
      });
    });
  });

  describe("GIVEN an object of arrays", () => {
    const template = {
      configuration: {
        type: "object",
        properties: {
          LifecycleConfiguration: {
            type: "object",
            properties: {
              Rules: {
                type: "set",
                mapItems: ["configuration.lifecycle_rule"],
                properties: {
                  AbortIncompleteMultipartUpload: {
                    type: "object",
                    mapItems: ["abort_incomplete_multipart_upload[0]"],
                    properties: {
                      DaysAfterInitiation: {
                        type: "number",
                        mapItems: ["days_after_initiation"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    describe("AND one lifecycle_rule as input", () => {
      it("SHOULD add it to Rules", () => {
        const input = {
          configuration: {
            lifecycle_rule: [
              {
                abort_incomplete_multipart_upload: [
                  {
                    days_after_initiation: 2,
                  },
                ],
              },
            ],
          },
        };

        const result = mapper(input, template);
        const expected = {
          Rules: [
            {
              AbortIncompleteMultipartUpload: {
                DaysAfterInitiation: 2,
              },
            },
          ],
        };
        expect(result.configuration.LifecycleConfiguration).toStrictEqual(
          expected
        );
      });
      describe("AND more than one lifecycle_rule as input", () => {
        it("SHOULD add each to Rules", () => {
          const input = {
            configuration: {
              lifecycle_rule: [
                {
                  abort_incomplete_multipart_upload: [
                    {
                      days_after_initiation: 30,
                    },
                  ],
                },
                {
                  abort_incomplete_multipart_upload: [
                    {
                      days_after_initiation: 2,
                    },
                  ],
                },
              ],
            },
          };

          const result = mapper(input, template);
          const expected = {
            Rules: [
              {
                AbortIncompleteMultipartUpload: {
                  DaysAfterInitiation: 30,
                },
              },
              {
                AbortIncompleteMultipartUpload: {
                  DaysAfterInitiation: 2,
                },
              },
            ],
          };
          expect(result.configuration.LifecycleConfiguration).toStrictEqual(
            expected
          );
        });
      });
    });
  });
});
