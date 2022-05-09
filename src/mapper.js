/** @format */

const get = require("lodash.get");

const mapValueRules = (schemaValue, originalValue) => {
  let newValue = originalValue;
  if (schemaValue.mappingValueRules) {
    const validMapRule = schemaValue.mappingValueRules.find((rule) =>
      rule.original.includes(originalValue)
    );
    if (validMapRule) {
      newValue = validMapRule.target;
    }
  }
  return newValue;
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

const getTag = (input, schemaValue) => {
  const result = [];
  let resolvedValue = getMapItem(input, schemaValue.mapItems);
  for (const Key in resolvedValue) {
    const Value = resolvedValue[Key];
    result.push({ Key, Value });
  }
  if (result.length) {
    return result;
  }
};

const isEmpty = (obj) => {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) return false;
  }

  return true;
};

const getSet = (input, value) => {
  if (value.mapItems) {
    let inputs = getMapItem(input, value.mapItems);
    if (Array.isArray(inputs)) {
      let resolvedValues = [];
      inputs.forEach((input) => {
        resolvedValues.push(mapper(input, value.properties));
      });
      return resolvedValues;
    }
  }
};

const mapper = (input, schema) => {
  const mappedObject = {};
  for (const key in schema) {
    const value = schema[key];
    const dataType = value.type;
    let mapItems;
    let resolvedValue;

    if (value.staticValue) {
      mappedObject[key] = value.staticValue;
      continue;
    }
    if (value.mapItems) {
      mapItems = getMapItem(input, value.mapItems);
    }
    if (dataType === "set" && mapItems) {
      resolvedValue = getSet(input, value);
      if (typeof resolvedValue !== "undefined") {
        mappedObject[key] = resolvedValue;
      }
      continue;
    }
    if (dataType === "tag" && mapItems) {
      resolvedValue = getTag(input, value);
      if (typeof resolvedValue !== "undefined") {
        mappedObject[key] = resolvedValue;
      }
      continue;
    }

    if (value.properties) {
      if (typeof mapItems === "undefined") {
        resolvedValue = mapper(input, value.properties);
      } else {
        resolvedValue = mapper(mapItems, value.properties);
      }
      // switch (dataType) {
      //   case "object":
      //     mappedObject[key] = mapper(input, value.properties);
      //     break;
      //   // case "set":
      //   //   mappedObject[key] = getSet(input, value);
      //   //   break;

      // }
    } else {
      if (typeof mapItems === "undefined") {
        if (typeof value.defaultValue !== "undefined") {
          resolvedValue = value.defaultValue;
        }
      } else {
        mapItems = mapValueRules(value, mapItems);
        resolvedValue = mapItems;
      }
    }
    if (typeof resolvedValue !== "undefined") {
      mappedObject[key] = resolvedValue;
    }
  }

  if (!isEmpty(mappedObject)) {
    return mappedObject;
  }
};

module.exports = mapper;
