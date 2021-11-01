module.exports = function mapper(input, schema) {
  const mappedObject = {};
  const inputKeys = Object.keys(input);
  Object.keys(schema).forEach((schemaKey) => {
    const mapItems = schema[schemaKey].mapItems;
    let foundKey;
    inputKeys.some((inputKey) => {
      if (mapItems.includes(inputKey)) {
        foundKey = inputKey;
        return mapItems.includes(inputKey)
      }
    });
    mappedObject[schemaKey] = input[foundKey]
  });
  return mappedObject;
}
