/** @format */

const get = require("lodash.get");

const mapValueRules = (schemaValue, resolvedValue) => {
  if (schemaValue.mappingValueRules) {
    const validMapRule = schemaValue.mappingValueRules.find((rule) =>
      rule.original.includes(resolvedValue)
    );
    if (validMapRule) {
      resolvedValue = validMapRule.target;
    }
  }
  return resolvedValue;
};
const getMapItem = (input, mapItems) => {
  let value;
  if (Array.isArray(mapItems)) {
    for (const item of mapItems) {
      value = get(input, item);
      if (value !== undefined) {
        break;
      }
    }
  }
  //return the value for the first mapped item found
  return value;
};

const getSet = (input, schemaValue) => {
  if (schemaValue.mapItems) {
    let inputValues = getMapItem(input, schemaValue.mapItems);
    if (Array.isArray(inputValues)) {
      let resolvedValues = [];
      inputValues.forEach((inputValue) => {
        resolvedValues.push(getSetItem(inputValue, schemaValue));
      });
      return resolvedValues;
    }
  }
};

const getSetItem = (inputValue, schemaValue) => {
  let resolvedValue = {};
  let result = {};
  for (const ruleKey in schemaValue.properties) {
    const ruleValue = schemaValue.properties[ruleKey];
    if (ruleValue.staticValue) {
      result[ruleKey] = ruleValue.staticValue;
    } else if (ruleValue.type === "set") {
      const mapSet = getSet(inputValue, ruleValue);
      if (mapSet) {
        result[ruleKey] = mapSet;
      }
    } else {
      resolvedValue = getMapItem(inputValue, ruleValue.mapItems);
      if (typeof resolvedValue === "object" && ruleValue.properties) {
        result[ruleKey] = getSetItem(resolvedValue, ruleValue);
      } else {
        if (!resolvedValue) {
          resolvedValue = ruleValue.defaultValue;
        }
        if (resolvedValue) {
          resolvedValue = mapValueRules(schemaValue, resolvedValue);
          result[ruleKey] = resolvedValue;
        }
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
        resolvedValue = mapValueRules(schemaValue, resolvedValue);
        mappedObject[schemaKey] = resolvedValue;
        return;
      case "object":
        mappedObject[schemaKey] = mapper(input, schemaValue.properties);
        return;
      case "set":
        mappedObject[schemaKey] = getSet(input, schemaValue);
        return;
    }
  });

  return mappedObject;
};

module.exports = mapper;
