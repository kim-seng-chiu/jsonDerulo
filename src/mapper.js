/** @format */

const get = require("lodash.get");

const getMapItem = (input, mapItems) => {
  let value;
  if (Array.isArray(mapItems)) {
    mapItems.forEach((item) => {
      value = get(input, item);
      if (value !== undefined) {
        //return the value for the first mapped item found
        return value;
      }
    });
  }
  return value;
};

const getSet = (inputValue, schemaValue) => {
  let resolvedValue = {};
  let result = {};
  for (const ruleKey in schemaValue.properties) {
    const ruleValue = schemaValue.properties[ruleKey];
    resolvedValue = getMapItem(inputValue, ruleValue.mapItems);
    if (typeof resolvedValue === "object") {
      if (typeof ruleValue.properties === "object") {
        result[ruleKey] = getSet(resolvedValue, ruleValue);
      }
    } else {
      if (resolvedValue) {
        result[ruleKey] = resolvedValue;
      }
    }
  }
  return result;
};

const mapper = (input, schema) => {
  const mappedObject = {};
  Object.keys(schema).forEach((schemaKey) => {
    const schemaValue = schema[schemaKey];
    const dataType = schemaValue.type;
    const mapItems = schemaValue.mapItems;
    const defaultValue = schemaValue.defaultValue ?? null;

    switch (dataType) {
      case "string":
      case "number":
      case "boolean":
      case "array":
        if (schemaValue.staticValue) {
          mappedObject[schemaKey] = schemaValue.staticValue;
          return;
        }
        const resolvedPath = mapItems
          ? mapItems.find((mapItem) => get(input, mapItem) !== undefined)
          : false;
        let resolvedValue = resolvedPath
          ? get(input, resolvedPath)
          : defaultValue;
        if (schemaValue.mappingValueRules) {
          const validMapRule = schema[
            schemaKey
          ].mappingValueRules.find((rule) =>
            rule.original.includes(resolvedValue)
          );
          if (validMapRule) {
            resolvedValue = validMapRule.target;
          }
        }
        mappedObject[schemaKey] = resolvedValue;
        return;
      case "object":
        mappedObject[schemaKey] = mapper(input, schemaValue.properties);
        return;
      case "set":
        if (schemaValue.mapItems) {
          let inputValues = getMapItem(input, schemaValue.mapItems);
          let resolvedValues = [];
          inputValues.forEach((inputValue) => {
            resolvedValues.push(getSet(inputValue, schemaValue));
          });
          mappedObject[schemaKey] = resolvedValues;
        }

        return;
    }
  });
  return mappedObject;
};

module.exports = mapper;
