module.exports = function mapper(input, schema) {
  const mappedObject = {};
  const inputKeys = Object.keys(input);
  Object.keys(schema).forEach((schemaKey) => {
    const dataType = schema[schemaKey].type;
    switch(dataType) {
      case "string":
      case "number":
      case "datetime":
        //
        return;
      case "object":
        //
        return;
      case "array":
        //
        return;
    }
    const mapItems = schema[schemaKey].mapItems;
    let matchingKey;
    inputKeys.some((inputKey) => {
      if (mapItems.includes(inputKey)) {
        matchingKey = inputKey;
        return mapItems.includes(inputKey)
      }
    });
    // before setting to mapped object, validate data is correct
    mappedObject[schemaKey] = input[matchingKey]
  });
  return mappedObject;
}
