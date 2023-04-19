/** @format */

const get = require("lodash.get");
const isPrimitive = require("is-primitive");
const { usePlugins, registerPlugins } = require("./plugin");

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

const getPrimitivesSet = (sourceValues, paths) => {
  if (Array.isArray(paths)) {
    let resolvedValues = [];
    if (Array.isArray(sourceValues)) {
      sourceValues.forEach((sourceValue) => {
        for (const item in paths) {
          if (paths[item]) {
            if (get(sourceValue, paths[item])) {
              // assume if source is array or object, it requires remapping
              // please raise a bug if this is not the case
              resolvedValues.push(get(sourceValue, paths[item]));
              break;
            }
          } else {
            if (isPrimitive(sourceValue)) {
              resolvedValues.push(sourceValue);
            }
          }
        }
      });
      return resolvedValues;
    } else {
      // standalone primitive value to be mapped into an array
      resolvedValues.push(sourceValues);
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

function Mapper(options) {
  this.opt = options ? options : {};
  this.registeredPlugins = registerPlugins(this.opt.plugins);

  this.map = (input, schema) => {
    const mappedObject = {};
    for (const key in schema) {
      let mapItems;
      let resolvedValue;
      let hasMapItems = false;

      const value = schema[key];
      const dataType = value.type;
      const plugins = usePlugins(this.registeredPlugins, value.plugins);

      if (value.oneOf) {
        const mainKey = key;
        const results = value.oneOf.map((item) => {
          let modularSchema = { [mainKey]: item };
          const mappedValue = this.map(input, modularSchema);
          return mappedValue;
        });
        /**
         * oneOf means that only one of the attributes
         * should be defined from the data source
         */
        resolvedValue = results.filter((item) => item)[0][mainKey];
      } else {
        if (value.staticValue !== undefined) {
          mappedObject[key] = value.staticValue;
          continue;
        }

        if (value.mapItems !== undefined) {
          mapItems = getMapItems(input, value.mapItems);
          hasMapItems = typeof mapItems !== "undefined";
        }

        if (value.filter !== undefined) {
          filteredValue = filterSource(input, value);
          mapItems = getMapItems(filteredValue, value.mapItems);
          hasMapItems = typeof mapItems !== "undefined" || null;
        }

        // apply beforeMapping plugins
        if (plugins) {
          mapItems = plugins.beforeMapping(mapItems);
        }

        if (hasMapItems) {
          switch (dataType) {
            case "set":
              if (Array.isArray(mapItems)) {
                resolvedValue = mapItems.reduce(
                  (prev, input) => [...prev, this.map(input, value.properties)],
                  []
                );
              }
              break;
            case "tag":
              resolvedValue = getTag(mapItems);
              break;
            case "set(strings)":
              resolvedValue = getPrimitivesSet(
                mapItems,
                value.properties.mapItems
              );
              break;
            case "boolean":
              resolvedValue = mapValueRules(value.mappingValueRules, mapItems);
              if (resolvedValue === "true") {
                resolvedValue = true;
              }
              if (resolvedValue === "false") {
                resolvedValue = false;
              }
              break;
            case "number":
              resolvedValue = mapValueRules(value.mappingValueRules, mapItems);
              if (!isNaN(resolvedValue)) {
                resolvedValue = +resolvedValue;
              }
              break;
            default:
              resolvedValue = value.properties
                ? this.map(mapItems, value.properties)
                : mapValueRules(value.mappingValueRules, mapItems);
              break;
          }
        } else {
          resolvedValue = value.properties && value.type === "object"
            ? this.map(input, value.properties)
            : value.defaultValue;
        }
      }

      // apply afterMapping plugins
      if (plugins) {
        resolvedValue = plugins.afterMapping(resolvedValue);
      }

      if (typeof resolvedValue !== "undefined") {
        mappedObject[key] = resolvedValue;
      }
    }

    if (!isEmpty(mappedObject)) {
      return mappedObject;
    }
  };
}

module.exports = Mapper;
