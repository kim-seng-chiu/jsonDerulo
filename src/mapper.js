function getFromPath(obj, path) {
  let result = null;
  if (path.split(".").length > 1) {
    const pathList = path.split(".");
    if (!Object.keys(obj).includes(pathList[0])) {
      return result;
    }
    pathList.find()
    pathList.forEach((item) => {
      pathList.splice(pathList.indexOf(item), 1);
      if(!result) {
        result = getFromPath(obj[item], pathList.join("."));
      }
      return result;
    });
  } else if (obj[path]) {
    result = obj[path];
  }
  return result;
}

function mapper(input, schema) {
  const mappedObject = {};
  Object.keys(schema).forEach((schemaKey) => {
    console.log(schemaKey)
    const dataType = schema[schemaKey].type;
    const mapItems = schema[schemaKey].mapItems;
    switch (dataType) {
      case "string":
      case "number":
      case "boolean":
      case "array":
        const resolvedPath = mapItems.find((mapItem) => getFromPath(input, mapItem) !== null)
        mappedObject[schemaKey] = resolvedPath ? getFromPath(input, resolvedPath) : null;
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
