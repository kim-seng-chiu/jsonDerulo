/** @format */

const get = require("lodash.get");
const isPrimitive = require("is-primitive");

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

const getPrimitivesSet = (sourceValues, paths) => {
  if (Array.isArray(paths)) {
    let resolvedValues = [];
    if (Array.isArray(sourceValues)) {
      sourceValues.forEach((sourceValue) => {
        for (const item in paths) {
          if (paths[item]) {
            if (get(sourceValue, paths[item])) {
              resolvedValues.push(get(sourceValue, paths[item]));
              break;
            }
          } else {
            if (!isPrimitive(sourceValue)) {
              // assume if source is array or object, it requires remapping
              // please raise a bug if this is not the case
              resolvedValues.push(sourceValue);
            }
          }
        }
      });
      return resolvedValues;
    }
  }
};

const filterSource = (input, mapContext) => {
  // const pathItem = mapContext.filter.sourceAttribute?.find(mapItem => Array.isArray(get(input, mapItem)));
  if (mapContext.filter.sourceAttribute) {
    const pathItem = Array.isArray(
      get(input, mapContext.filter.sourceAttribute)
    )
      ? mapContext.filter.sourceAttribute
      : null;
    const sourceValue = get(input, pathItem);
    if (!sourceValue) {
      console.info("Could not find and get the source of arrays to filter.");
      return null;
    }
    if (mapContext.filter.filterType === "object") {
      if (!mapContext.filter.Key && !mapContext.filter.Value) {
        console.error(
          `Unable to filter OBJECTS for ${pathItem} due to incomplete schema definition.`
        );
        return null;
      }
      return sourceValue.find(
        (item) => item[mapContext.filter.Key] === mapContext.filter.Value
      );
    }
    console.log("Awaiting implementation of filtering primitives");
    return null;
  }
  console.info(
    "Unable to filter without a path to the source. Please provide a sourceAttribute in the filter object."
  );
  return null;
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

    if (value.filter) {
      filteredValue = filterSource(input, schema[key]);
      mapItems = getMapItems(filteredValue, value.mapItems);
      hasMapItems = typeof mapItems !== "undefined" || null;
    }

    if (hasMapItems) {
      if (dataType === "set") {
        resolvedValue = getSet(mapItems, value.properties);
      } else if (dataType === "tag") {
        resolvedValue = getTag(mapItems);
      } else if (dataType === "set(strings)") {
        resolvedValue = getPrimitivesSet(mapItems, value.properties.mapItems);
      } else {
        resolvedValue = value.properties
          ? mapper(mapItems, value.properties)
          : mapValueRules(value.mappingValueRules, mapItems);
      }
    } else {
      resolvedValue = value.properties
        ? mapper(input, value.properties)
        : value.defaultValue;
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
