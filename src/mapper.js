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

const getResolvedValue = (input, properties, schemaValue) => {
  if (properties.staticValue) {
    return properties.staticValue;
  } else if (properties.type === "set") {
    return getSet(input, properties);
  } else if (properties.type === "tag") {
    return getTag(input, properties);
  } else if (properties.type === "aobject") {
    return mapper(resolvedValue, properties);
  } else {
    let resolvedValue = getMapItem(input, properties.mapItems);
    if (typeof resolvedValue === "object" && properties.properties) {
      return getSetItem(resolvedValue, properties);
    } else {
      if (typeof resolvedValue === "undefined") {
        resolvedValue = properties.defaultValue;
      }
      if (typeof resolvedValue !== "undefined") {
        resolvedValue = mapValueRules(schemaValue, resolvedValue);
        return resolvedValue;
      }
    }
  }
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

// const mapper2 = (input, schema) => {
//   const mappedObject = {};
//   Object.keys(schema).forEach((schemaKey) => {
//     const schemaValue = schema[schemaKey];
//     const dataType = schemaValue.type;
//     const mapItems = schemaValue.mapItems;
//     const defaultValue = schemaValue.defaultValue ?? null;

//     switch (dataType) {
//       case "string":
//       case "number":
//       case "boolean":
//       case "array":
//         resolvedValue = getResolvedValue(input, schemaValue, schemaValue);

//         if (resolvedValue) {
//           mappedObject[schemaKey] = resolvedValue;
//         }
//         return;
//       case "object":
//         mappedObject[schemaKey] = mapper(input, schemaValue.properties);
//         return;
//       case "set":
//         mappedObject[schemaKey] = getSet(input, schemaValue);
//         return;
//     }
//   });
const getSetItem = (input, value) => {
  const result = {};
  for (const key in value.properties) {
    const properties = value.properties[key];
    const resolvedValue = getResolvedValue(input, properties, value);
    if (typeof resolvedValue !== "undefined") {
      result[key] = resolvedValue;
    }
  }
  return result;
};

const getSet = (input, value) => {
  if (value.mapItems) {
    let inputs = getMapItem(input, value.mapItems);
    if (Array.isArray(inputs)) {
      let resolvedValues = [];
      inputs.forEach((input) => {
        resolvedValues.push(getSetItem(input, value));
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
    const defaultValue = value.defaultValue ?? null;
    if (value.staticValue) {
      mappedObject[key] = value.staticValue;
      continue;
    }
    if (value.mapItems) {
      mapItems = getMapItem(input, value.mapItems);
    }
    if (dataType === "set" && mapItems) {
      mappedObject[key] = getSet(input, value);
      break;
    }

    if (value.properties) {
      if (typeof mapItems === "undefined") {
        mappedObject[key] = mapper(input, value.properties);
      } else {
        mappedObject[key] = mapper(mapItems, value.properties);
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
        mappedObject[key] = defaultValue;
      } else {
        mapItems = mapValueRules(value, mapItems);
        mappedObject[key] = mapItems;
      }
    }
  }

  return mappedObject;
};

module.exports = mapper;
