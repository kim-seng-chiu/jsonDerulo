const get = require("lodash.get");

function mapper(input, schema) {
  const mappedObject = {};
  Object.keys(schema).forEach((schemaKey) => {
    const dataType = schema[schemaKey].type;
    const mapItems = schema[schemaKey].mapItems;
    switch (dataType) {
      case "string":
      case "number":
      case "boolean":
      case "array":
        const resolvedPath = mapItems.find(mapItem => get(input, mapItem) !== undefined)
        mappedObject[schemaKey] = resolvedPath ? get(input, resolvedPath) : undefined;
        return;
      case "object":
        mappedObject[schemaKey] = mapper(
          input,
          schema[schemaKey].properties
        );
        return;
    }
  });
  return mappedObject;
}
module.exports = mapper;
