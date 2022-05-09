/** @format */

const get = require("lodash.get");

const mapValueRules = (mappingValueRules, originalValue) => {
  let newValue = originalValue;
  if (mappingValueRules) {
    const validMapRule = mappingValueRules.find((rule) =>
      rule.original.includes(originalValue)
    );
    if (validMapRule) {
      newValue = validMapRule.target;
    }
  }
  return newValue;
};
const getMapItems = (input, mapItems) => {
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
    let hasMapItems = false;

    if (value.staticValue) {
      mappedObject[key] = value.staticValue;
      continue;
    }

    if (value.mapItems) {
      mapItems = getMapItems(input, value.mapItems);
      hasMapItems = typeof mapItems !== "undefined";
    }

    if (dataType === "set" && hasMapItems) {
      resolvedValue = getSet(mapItems, value.properties);
    } else if (dataType === "tag" && hasMapItems) {
      resolvedValue = getTag(mapItems);
    } else {
      if (value.properties) {
        resolvedValue = hasMapItems
          ? mapper(mapItems, value.properties)
          : mapper(input, value.properties);
      } else {
        resolvedValue = hasMapItems
          ? mapValueRules(value.mappingValueRules, mapItems)
          : value.defaultValue;
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
