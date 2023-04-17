const { builtinPlugins } = require("./built-in-plugins");

const registerPlugins = (plugins) => {
  const registeredPlugins = { ...builtinPlugins };

  if (!plugins) {
    return registeredPlugins;
  }

  plugins.forEach((plugin, index) => {
    if (typeof plugin === "object" && plugin.id) {
      if (
        (plugin.beforeMapping && typeof plugin.beforeMapping === "function") ||
        (plugin.afterMapping && typeof plugin.afterMapping === "function")
      ) {
        if (registeredPlugins[plugin.id.toString()]) {
          return;
        }

        registeredPlugins[plugin.id.toString()] = plugin;
      } else {
        console.error(
          "Register plugin error at index: " +
            index +
            ". id: \"" +
            plugin.id +
            "\". Plugin's structure is not correct."
        );
      }
    } else {
      console.error("Register plugin error at index: " + index + ". id is required.");
    }
  });

  return registeredPlugins;
};

const usePlugins = (registeredPlugins, plugins) => {
  if (typeof plugins !== "string") {
    return null;
  }

  // plugins can be streamed with "|" character, the executing order is from left to right
  const pipeline = plugins.split("|").map((item) => item.trim());

  const beforeMappingCalls = [];
  const afterMappingCalls = [];

  pipeline.forEach((pluginName) => {
    const plugin = registeredPlugins[pluginName];

    if (plugin) {
      if (plugin.beforeMapping) {
        beforeMappingCalls.push(plugin.beforeMapping);
      }

      if (plugin.afterMapping) {
        afterMappingCalls.push(plugin.afterMapping);
      }
    } else {
      console.error("Can't find registered plugin: " + pluginName);
    }
  });

  return {
    beforeMapping: (data) =>
      beforeMappingCalls.reduce(
        (prevVal, curFunc) => curFunc.apply(null, [prevVal]),
        data
      ),
    afterMapping: (data) =>
      afterMappingCalls.reduce(
        (prevVal, curFunc) => curFunc.apply(null, [prevVal]),
        data
      ),
  };
};

module.exports = { registerPlugins, usePlugins };
