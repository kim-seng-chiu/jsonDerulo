/** @format */

const mapper = require("../../src/mapper");
const { input1, input2, input3 } = require("../mocks/mapper/data.mock");
const { bookTemplate } = require("../mocks/mapper/template.mock");
describe("mapper", () => {
  describe("When given an input object and a template to match", () => {
    it("Should map the input object the new template keys and return it as an object", () => {
      expect(mapper(input1, bookTemplate)).toMatchObject({
        Title: "Catcher in the Rye",
        Author: { Name: "J.D. Salinger", Origin: "USA" },
        YearPublished: "1951",
        IsFiction: true,
        NumberOfPages: 234,
      });
    });
    it("Should map the input object to new template keys with the desired data structure", () => {
      expect(mapper(input2, bookTemplate)).toMatchObject({
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

  describe("GIVEN key is mapped to a static value", () => {
    it("SHOULD add the key to the output, even if it is not in the input", () => {
      const template = {
        provider: {
          type: "string",
          staticValue: "aws",
        },
        configuration: {},
      };
      const input = {
        configuration: {},
      };

      const result = mapper(input, template);
      const expected = { provider: "aws" };
      expect(result).toStrictEqual(expected);
    });
  });

  describe("GIVEN mappingValueRules is configured", () => {
    it("SHOULD replace mappingValueRules.original with .target in the input", () => {
      const template = {
        configuration: {
          type: "object",
          properties: {
            ObjectLockConfiguration: {
              type: "object",
              properties: {
                ObjectLockEnabled: {
                  type: "boolean",
                  defaultValue: "Disabled",
                  description: "",
                  mapItems: [
                    "configuration.object_lock_enabled",
                    "configuration.object_lock_configuration[0].object_lock_enabled",
                  ],
                  mappingValueRules: [
                    {
                      original: ["Enabled", "true", true],
                      target: "Enabled",
                    },
                  ],
                },
              },
            },
          },
        },
      };

      const input = {
        configuration: { object_lock_enabled: true },
      };

      const result = mapper(input, template);
      const expected = {
        ObjectLockEnabled: "Enabled",
      };
      expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
        expected
      );
    });
  });
  describe("GIVEN a schema of type 'set'", () => {
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
                  Status: {
                    type: "string",
                    mapItems: ["status"],
                    defaultValue: "Disabled",
                  },
                  Transitions: {
                    type: "set",
                    mapItems: ["transition"],
                    properties: {
                      StorageClass: {
                        type: "string",
                        enum: [
                          "DEEP_ARCHIVE",
                          "GLACIER",
                          "GLACIER_IR",
                          "INTELLIGENT_TIERING",
                          "ONEZONE_IA",
                          "STANDARD_IA",
                        ],
                        mapItems: ["storage_class"],
                      },
                      TransitionDate: {
                        type: "string",
                        mapItems: ["date"],
                      },
                      TransitionInDays: {
                        type: "number",
                        mapItems: ["days"],
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
              Status: "Disabled",
            },
          ],
        };
        expect(result.configuration.LifecycleConfiguration).toStrictEqual(
          expected
        );
      });
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
                Status: "Disabled",
              },
              {
                abort_incomplete_multipart_upload: [
                  {
                    days_after_initiation: 2,
                  },
                ],
                Status: "Disabled",
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
              Status: "Disabled",
            },
            {
              AbortIncompleteMultipartUpload: {
                DaysAfterInitiation: 2,
              },
              Status: "Disabled",
            },
          ],
        };
        expect(result.configuration.LifecycleConfiguration).toStrictEqual(
          expected
        );
      });
    });
    describe("AND nested sets", () => {
      it("SHOULD calculate the nested sets", () => {
        const input = {
          configuration: {
            lifecycle_rule: [
              {
                id: "GlacierRule",
                transition: [
                  {
                    days: 1,
                    storage_class: "GLACIER",
                  },
                  {
                    days: 30,
                    storage_class: "STANDARD_IA",
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
              Status: "Disabled",
              Transitions: [
                {
                  StorageClass: "GLACIER",
                  TransitionInDays: 1,
                },
                {
                  StorageClass: "STANDARD_IA",
                  TransitionInDays: 30,
                },
              ],
            },
          ],
        };
        expect(result.configuration.LifecycleConfiguration).toStrictEqual(
          expected
        );
      });
    });
    describe("AND input is populated and is mapped to a default value", () => {
      it("SHOULD set the input with the populated value", () => {
        const input = {
          configuration: {
            lifecycle_rule: [
              {
                id: "GlacierRule",
                status: "Enabled",
              },
            ],
          },
        };

        const result = mapper(input, template);
        const expected = {
          Rules: [
            {
              Status: "Enabled",
            },
          ],
        };
        expect(result.configuration.LifecycleConfiguration).toStrictEqual(
          expected
        );
      });
    });
    describe("AND input is empty and is mapped to a default value", () => {
      it("SHOULD set the input with the default value", () => {
        const input = {
          configuration: {
            lifecycle_rule: [
              {
                id: "GlacierRule",
              },
            ],
          },
        };

        const result = mapper(input, template);
        const expected = {
          Rules: [
            {
              Status: "Disabled",
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
