function mapper(input, schema) {
  const mappedObject = {};
  const inputKeys = Object.keys(input);
  Object.keys(schema).forEach((schemaKey) => {
    const dataType = schema[schemaKey].type;
    const mapItems = schema[schemaKey].mapItems;
    let matchingKey;
    switch(dataType) {
      case "string":
      case "number":
      case "boolean":
      case "datetime":
        inputKeys.some((inputKey) => {
        if (mapItems.includes(inputKey)) {
            matchingKey = inputKey;
            return mapItems.includes(inputKey)
          }
        });
        mappedObject[schemaKey] = input[matchingKey]
        return;
      case "object":
        inputKeys.some((inputKey) => {
          if (mapItems.includes(inputKey)) {
              matchingKey = inputKey;
              return mapItems.includes(inputKey)
            }
        });
        mappedObject[schemaKey] = mapper(input[matchingKey], schema[schemaKey].properties)
        return;
      case "array":
        //
        return;
    }
    
    // before setting to mapped object, validate data is correct
    
  });
  return mappedObject;
}
module.exports = mapper;