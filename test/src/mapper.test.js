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
  describe("GIVEN set(strings) has been configured", () => {
    const schemaSetStrings = {
      configuration: {
        type: "object",
        properties: {
          Name: {
            type: "string",
            mapItems: ["configuration.name"],
          },
          Subnets: {
            type: "set(strings)",
            mapItems: ["configuration.subnets"],
            properties: {
              mapItems: ["reference", ""],
            },
          },
        },
      },
    };
    describe("WHEN an array of objects is provided as input", () => {
      const testData1 = {
        configuration: {
          name: "Test1",
          subnets: [
            {
              reference: "aws_subnet.example1",
              aws_subnet: [],
            },
            {
              reference: "aws_subnet.example2",
              aws_subnet: [],
            },
          ],
        },
      };
      it("SHOULD map a single value from each object", () => {
        expect(mapper(testData1, schemaSetStrings)).toMatchObject({
          configuration: {
            Name: "Test1",
            Subnets: ["aws_subnet.example1", "aws_subnet.example2"],
          },
        });
      });
    });
    describe("WHEN an array of strings is provided as input", () => {
      const testData2 = {
        configuration: {
          name: "Test2",
          subnets: ["198.0.1.15/1", "20.0.1.23/1"],
        },
      };
      it("SHOULD return the array of strings", () => {
        expect(mapper(testData2, schemaSetStrings)).toMatchObject({
          configuration: {
            Name: "Test2",
            Subnets: ["198.0.1.15/1", "20.0.1.23/1"],
          },
        });
      });
    });
  });
  describe("GIVEN a key-value pair needs to be destructured", () => {
    const schema = {
      LoadBalancerAttributes: {
        type: "object",
        properties: {
          DeletionProtectionEnabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "deletion_protection.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          S3AccessLogsEnabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "access_logs.s3.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          S3AccessLogsBucket: {
            type: "string",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "access_logs.s3.bucket",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
          },
          S3AccessLogsPrefix: {
            type: "string",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "access_logs.s3.prefix",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
          },
          Ipv6DenyAllIgwTraffic: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "ipv6.deny_all_igw_traffic",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          IdleTimeoutSeconds: {
            type: "number",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "idle_timeout.timeout_seconds",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
          },
          RoutingHttpDesyncMitigationMode: {
            type: "string",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "routing.http.desync_mitigation_mode",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
          },
          RoutingHttpDropInvalidHeaderFieldsEnabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "routing.http.drop_invalid_header_fields.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          RoutingHttpXAmznTlsVersionAndCipherSuiteEnabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "routing.http.x_amzn_tls_version_and_cipher_suite.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          RoutingHttpXffClientPortEnabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "routing.http.xff_client_port.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          RoutingHttpXffHeaderProcessingMode: {
            type: "string",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "routing.http.xff_header_processing.mode",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          RoutingHttp2Enabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "routing.http2.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          WafFailOpenEnabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "waf.fail_open.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
          LoadBalancingCrossZoneEnabled: {
            type: "boolean",
            mapItems: ["Value"],
            filter: {
              filterType: "object",
              Key: "Key",
              Value: "load_balancing.cross_zone.enabled",
              sourceAttribute: "configuration.LoadBalancerAttributes",
            },
            mappingValueRules: [
              {
                original: ["true", true],
                target: true,
              },
              {
                original: ["false", false],
                target: false,
              },
            ],
          },
        },
      },
    };
    const original = {
      configuration: {
        LoadBalancerAttributes: [
          {
            Key: "deletion_protection.enabled",
            Value: true,
          },
          {
            Key: "access_logs.s3.enabled",
            Value: "false",
          },
          {
            Key: "access_logs.s3.bucket",
            Value: "bucket-name-20220701",
          },
          {
            Key: "access_logs.s3.prefix",
            Value: "test-",
          },
          {
            Key: "ipv6.deny_all_igw_traffic",
            Value: true,
          },
          {
            Key: "idle_timeout.timeout_seconds",
            Value: 30,
          },
          {
            Key: "routing.http.desync_mitigation_mode",
            Value: "strictest",
          },
          {
            Key: "routing.http.drop_invalid_header_fields.enabled",
            Value: false,
          },
          {
            Key: "routing.http.preserve_host_header.enabled",
            Value: true,
          },
          {
            Key: "routing.http.x_amzn_tls_version_and_cipher_suite.enabled",
            Value: false,
          },
          {
            Key: "routing.http.xff_client_port.enabled",
            Value: "true",
          },
          {
            Key: "routing.http.xff_header_processing.mode",
            Value: "preserve",
          },
          {
            Key: "routing.http2.enabled",
            Value: false,
          },
          {
            Key: "waf.fail_open.enabled",
            Value: true,
          },
          {
            Key: "load_balancing.cross_zone.enabled",
            Value: false,
          },
        ],
      },
    };
    const result = {
      LoadBalancerAttributes: {
        DeletionProtectionEnabled: true,
        S3AccessLogsEnabled: false,
        S3AccessLogsBucket: "bucket-name-20220701",
        S3AccessLogsPrefix: "test-",
        Ipv6DenyAllIgwTraffic: true,
        IdleTimeoutSeconds: 30,
        RoutingHttpDesyncMitigationMode: "strictest",
        RoutingHttpDropInvalidHeaderFieldsEnabled: false,
        RoutingHttpXAmznTlsVersionAndCipherSuiteEnabled: false,
        RoutingHttpXffClientPortEnabled: true,
        RoutingHttpXffHeaderProcessingMode: "preserve",
        RoutingHttp2Enabled: false,
        WafFailOpenEnabled: true,
        LoadBalancingCrossZoneEnabled: false,
      },
    };
    it("SHOULD return each value attached to its relevant attribute", () => {
      expect(mapper(original, schema)).toMatchObject(result);
    });
  });
  describe("GIVEN an attribute that can be mapped from two different sources", () => {
    it("SHOULD map the attribute for the first option", () => {
      const schema = {
        CannedProfile: {
          description: "A list of access control grants for the user",
          oneOf: [
            {
              type: "array",
              mapItems: ["profile"],
              mappingValueRules: [
                {
                  original: ["admin"],
                  target: [
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "Owner",
                      },
                      Permissions: "FullControls",
                    },
                    {
                      Grantee: {
                        ID: "abxd",
                        Name: "Owner",
                      },
                      Permissions: "Delete",
                    },
                  ],
                },
                {
                  original: ["hr"],
                  target: [
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "Manager",
                      },
                      Permissions: "FullRead",
                    },
                  ],
                },
                {
                  original: ["research"],
                  target: [
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "User",
                      },
                      Permissions: "Read",
                    },
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "User",
                      },
                      Permissions: "Write",
                    },
                  ],
                },
              ],
            },
            {
              type: "set",
              mapItems: ["full_profile.role"],
              properties: {
                Grantee: {
                  type: "object",
                  properties: {
                    ID: {
                      type: "string",
                      mapItems: ["Grantee.ID"],
                    },
                    Name: {
                      type: "string",
                      mapItems: ["Grantee.Name"],
                    },
                  },
                },
                Permissions: {
                  type: "string",
                  mapItems: ["Permissions"],
                },
              },
            },
          ],
        },
        Name: {
          type: "string",
          mapItems: ["name"],
        },
      };
      const data = {
        profile: "hr",
        name: "Phil",
      };
      const result = mapper(data, schema);
      const expected = {
        CannedProfile: [
          {
            Grantee: {
              ID: "axcd",
              Name: "Manager",
            },
            Permissions: "FullRead",
          },
        ],
        Name: "Phil",
      };
      expect(result).toStrictEqual(expected);
    });
    it("SHOULD map the attribute for the second option", () => {
      const schema = {
        CannedProfile: {
          description: "A list of access control grants for the user",
          oneOf: [
            {
              type: "array",
              mapItems: ["profile"],
              mappingValueRules: [
                {
                  original: ["admin"],
                  target: [
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "Owner",
                      },
                      Permissions: "FullControls",
                    },
                    {
                      Grantee: {
                        ID: "abxd",
                        Name: "Owner",
                      },
                      Permissions: "Delete",
                    },
                  ],
                },
                {
                  original: ["hr"],
                  target: [
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "Manager",
                      },
                      Permissions: "FullRead",
                    },
                  ],
                },
                {
                  original: ["research"],
                  target: [
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "User",
                      },
                      Permissions: "Read",
                    },
                    {
                      Grantee: {
                        ID: "axcd",
                        Name: "User",
                      },
                      Permissions: "Write",
                    },
                  ],
                },
              ],
            },
            {
              type: "set",
              mapItems: ["full_profile.role"],
              properties: {
                Grantee: {
                  type: "object",
                  properties: {
                    ID: {
                      type: "string",
                      mapItems: ["Grantee.ID"],
                    },
                    Name: {
                      type: "string",
                      mapItems: ["Grantee.Name"],
                    },
                  },
                },
                Permissions: {
                  type: "string",
                  mapItems: ["Permissions"],
                },
              },
            },
          ],
        },
        Name: {
          type: "string",
          mapItems: ["first_name", "name"],
        },
      };
      const data = {
        full_profile: {
          role: [
            {
              Grantee: {
                ID: "a",
                Name: "a",
              },
              Permissions: "a",
            },
            {
              Grantee: {
                ID: "b",
                Name: "b",
              },
              Permissions: "b",
            },
          ],
        },
        first_name: "Gloria",
      };
      const result = mapper(data, schema);
      const expected = {
        CannedProfile: [
          {
            Grantee: {
              ID: "a",
              Name: "a",
            },
            Permissions: "a",
          },
          {
            Grantee: {
              ID: "b",
              Name: "b",
            },
            Permissions: "b",
          },
        ],
        Name: "Gloria",
      };
      expect(result).toStrictEqual(expected);
    });
    describe("WHEN both map options are defined", () => {
      it("SHOULD map the attribute for the first option", () => {
        const schema = {
          CannedProfile: {
            description: "A list of access control grants for the user",
            oneOf: [
              {
                type: "array",
                mapItems: ["profile"],
                mappingValueRules: [
                  {
                    original: ["admin"],
                    target: [
                      {
                        Grantee: {
                          ID: "axcd",
                          Name: "Owner",
                        },
                        Permissions: "FullControls",
                      },
                      {
                        Grantee: {
                          ID: "abxd",
                          Name: "Owner",
                        },
                        Permissions: "Delete",
                      },
                    ],
                  },
                  {
                    original: ["hr"],
                    target: [
                      {
                        Grantee: {
                          ID: "axcd",
                          Name: "Manager",
                        },
                        Permissions: "FullRead",
                      },
                    ],
                  },
                  {
                    original: ["research"],
                    target: [
                      {
                        Grantee: {
                          ID: "axcd",
                          Name: "User",
                        },
                        Permissions: "Read",
                      },
                      {
                        Grantee: {
                          ID: "axcd",
                          Name: "User",
                        },
                        Permissions: "Write",
                      },
                    ],
                  },
                ],
              },
              {
                type: "set",
                mapItems: ["full_profile.role"],
                properties: {
                  Grantee: {
                    type: "object",
                    properties: {
                      ID: {
                        type: "string",
                        mapItems: ["Grantee.ID"],
                      },
                      Name: {
                        type: "string",
                        mapItems: ["Grantee.Name"],
                      },
                    },
                  },
                  Permissions: {
                    type: "string",
                    mapItems: ["Permissions"],
                  },
                },
              },
            ],
          },
          Name: {
            type: "string",
            mapItems: ["first_name", "name"],
          },
        };
        const data = {
          profile: "admin",
          full_profile: {
            role: [
              {
                Grantee: {
                  ID: "a",
                  Name: "a",
                },
                Permissions: "a",
              },
              {
                Grantee: {
                  ID: "b",
                  Name: "b",
                },
                Permissions: "b",
              },
            ],
          },
          first_name: "Gloria",
        };
        const result = mapper(data, schema);
        const expected = {
          CannedProfile: [
            {
              Grantee: {
                ID: "axcd",
                Name: "Owner",
              },
              Permissions: "FullControls",
            },
            {
              Grantee: {
                ID: "abxd",
                Name: "Owner",
              },
              Permissions: "Delete",
            },
          ],
          Name: "Gloria",
        };
        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe("GIVEN expected attribute type is a boolean", () => {
    describe("WHEN input is string 'true' or 'false'", () => {
      it("SHOULD convert the string to boolean", () => {
        const template = {
          configuration: {
            type: "object",
            properties: {
              ObjectLockConfiguration: {
                type: "object",
                properties: {
                  MakeMeABoolean: {
                    type: "boolean",
                    mapItems: ["configuration.make_me_a_boolean"],
                  },
                },
              },
            },
          },
        };

        const input = {
          configuration: { make_me_a_boolean: "true" },
        };

        const result = mapper(input, template);
        const expected = {
          MakeMeABoolean: true,
        };
        expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
          expected
        );
        const input2 = {
          configuration: { make_me_a_boolean: "false" },
        };
        const result2 = mapper(input, template);
        const expected2 = {
          MakeMeABoolean: false,
        };
        expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
          expected
        );
      });
    });
    describe("WHEN input is not a string 'true' or 'false'", () => {
      it("SHOULD not convert to boolean", () => {
        const template = {
          configuration: {
            type: "object",
            properties: {
              ObjectLockConfiguration: {
                type: "object",
                properties: {
                  DontMakeMeABoolean: {
                    type: "boolean",
                    mapItems: ["configuration.dont_make_me_a_boolean"]
                    
                  },
                },
              },
            },
          },
        };

        const input = {
          configuration: { dont_make_me_a_boolean: "1" },
        };

        const result = mapper(input, template);
        const expected = {
          DontMakeMeABoolean: "1",
        };
        expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
          expected
        );
      });
    });
    describe("WHEN mappingValueRules have been set", () => {
      it("SHOULD honour mappingValueRules override ", () => {
        const template = {
          configuration: {
            type: "object",
            properties: {
              ObjectLockConfiguration: {
                type: "object",
                properties: {
                  DontMakeMeABoolean: {
                    type: "boolean",
                    mapItems: ["configuration.dont_make_me_a_boolean"],
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
          configuration: { dont_make_me_a_boolean: "true" },
        };

        const result = mapper(input, template);
        const expected = {
          DontMakeMeABoolean: "Enabled",
        };
        expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
          expected
        );
      });
    });
  });
  describe("GIVEN expected attribute type is a number", () => {
    describe("WHEN input is a number wrapped in a quotes", () => {
      it("SHOULD convert the string to number", () => {
        const template = {
          configuration: {
            type: "object",
            properties: {
              ObjectLockConfiguration: {
                type: "object",
                properties: {
                  MakeMeANumber: {
                    type: "number",
                    mapItems: ["configuration.make_me_a_number"],
                  },
                },
              },
            },
          },
        };

        const input = {
          configuration: { make_me_a_number: "128" },
        };

        const result = mapper(input, template);
        const expected = {
          MakeMeANumber: 128,
        };
        expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
          expected
        );
      });
    });
    describe("WHEN input is not a number wrapped in a quotes", () => {
      it("SHOULD convert the string to number", () => {
        const template = {
          configuration: {
            type: "object",
            properties: {
              ObjectLockConfiguration: {
                type: "object",
                properties: {
                  DontMakeMeANumber: {
                    type: "number",
                    mapItems: ["configuration.dont_make_me_a_number"],
                  },
                },
              },
            },
          },
        };

        const input = {
          configuration: { dont_make_me_a_number: "the128" },
        };

        const result = mapper(input, template);
        const expected = {
          DontMakeMeANumber: "the128",
        };
        expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
          expected
        );
      });
    });

    describe("WHEN mappingValueRules have been set", () => {
      it("SHOULD honour mappingValueRules override ", () => {
        const template = {
          configuration: {
            type: "object",
            properties: {
              ObjectLockConfiguration: {
                type: "object",
                properties: {
                  DontMakeMeANumber: {
                    type: "number",
                    mapItems: ["configuration.dont_make_me_a_number"],
                    mappingValueRules: [
                      {
                        original: ["128", "256"],
                        target: "Standard",
                      },
                    ],
                  },
                },
              },
            },
          },
        };

        const input = {
          configuration: { dont_make_me_a_number: "128" },
        };

        const result = mapper(input, template);
        const expected = {
          DontMakeMeANumber: "Standard",
        };
        expect(result.configuration.ObjectLockConfiguration).toStrictEqual(
          expected
        );
      });
    });
  });
});
