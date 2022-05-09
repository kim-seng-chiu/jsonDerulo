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

const getTag = (mapItems) => {
  const result = [];
  for (const Key in mapItems) {
    const Value = mapItems[Key];
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

const getSet = (mapItems, properties) => {
  if (Array.isArray(mapItems)) {
    let resolvedValues = [];
    mapItems.forEach((input) => {
      resolvedValues.push(mapper(input, properties));
    });
    return resolvedValues;
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
      resolvedValue = getSet(mapItems, value.properties);
    } else if (dataType === "tag" && mapItems) {
      resolvedValue = getTag(mapItems);
    } else {
      if (value.properties) {
        if (typeof mapItems === "undefined") {
          resolvedValue = mapper(input, value.properties);
        } else {
          resolvedValue = mapper(mapItems, value.properties);
        }
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
