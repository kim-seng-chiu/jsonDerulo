const get = require("lodash.get");

function mapper(input, schema) {
  const mappedObject = {};
  Object.keys(schema).forEach((schemaKey) => {
    const dataType = schema[schemaKey].type;
    const mapItems = schema[schemaKey].mapItems;
    const defaultValue = schema[schemaKey].defaultValue ?? null;
    switch (dataType) {
      case "string":
      case "number":
      case "boolean":
      case "array":
        if(schema[schemaKey].staticValue) {
          mappedObject[schemaKey] = schema[schemaKey].staticValue;
          return;
        }
        const resolvedPath = mapItems ? mapItems.find(mapItem => get(input, mapItem) !== undefined) : false;
        let resolvedValued = resolvedPath ? get(input, resolvedPath) : defaultValue;
        if(schema[schemaKey].mappingValueRules) {
          const validMapRule = schema[schemaKey].mappingValueRules.find(rule => rule.original.includes(resolvedValued));
          if(validMapRule) {
            resolvedValue = validMapRule.target;
          }
        }
        mappedObject[schemaKey] = resolvedValue;
        return;
      case "object":
        mappedObject[schemaKey] = mapper(
          input,
          schema[schemaKey].properties
        );
        return;
      // case "array(objects)":
    }
  });
  return mappedObject;
}
module.exports = mapper;
