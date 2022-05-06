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

const getSet = (input, schemaValue) => {
  if (schemaValue.mapItems) {
    let inputs = getMapItem(input, schemaValue.mapItems);
    if (Array.isArray(inputs)) {
      let resolvedValues = [];
      inputs.forEach((input) => {
        resolvedValues.push(getSetItem(input, schemaValue));
      });
      return resolvedValues;
    }
  }
};

const getResolvedValue = (input, properties, schemaValue) => {
  if (properties.staticValue) {
    return properties.staticValue;
  } else if (properties.type === "set") {
    return getSet(input, properties);
  } else {
    let resolvedValue = getMapItem(input, properties.mapItems);
    if (typeof resolvedValue === "object" && properties.properties) {
      return getSetItem(resolvedValue, properties);
    } else {
      if (!resolvedValue) {
        resolvedValue = properties.defaultValue;
      }
      if (resolvedValue) {
        resolvedValue = mapValueRules(schemaValue, resolvedValue);
        return resolvedValue;
      }
    }
  }
};

const getSetItem = (input, schemaValue) => {
  const result = {};
  for (const key in schemaValue.properties) {
    const properties = schemaValue.properties[key];
    const resolvedValue = getResolvedValue(input, properties, schemaValue);
    if (resolvedValue) {
      result[key] = resolvedValue;
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
