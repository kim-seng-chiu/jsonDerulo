const { usePlugins, registerPlugins } = require("../../src/plugin");

describe("Test for registerPlugins", () => {
  describe("When no plugins to register", () => {
    const plugins = registerPlugins();
    it("Should return built-in plugins", () => {
      expect(Object.keys(plugins)).toContain("length");
      expect(typeof plugins.length.afterMapping).toBe("function");
      expect(plugins.length.beforeMapping).toBeUndefined();
    });
  });

  describe("When register a valid plugin", () => {
    const plugin = {
      id: "test_plugin",
      beforeMapping: (data) => data,
      afterMapping: (data) => data,
    };
    const plugins = registerPlugins([plugin]);
    it("Should return correct registered plugins", () => {
      expect(Object.keys(plugins)).toContain("test_plugin");
      expect(typeof plugins.test_plugin.beforeMapping).toBe("function");
      expect(typeof plugins.test_plugin.afterMapping).toBe("function");
    });
  });

  describe("When register an plugin without id", () => {
    const plugin = {
      beforeMapping: (data) => data,
      afterMapping: (data) => data,
    };

    it("Should not register invalid correct and return correct registered plugins", () => {
      const error = spyOn(global.console, "error");
      registerPlugins([plugin]);

      expect(error).toHaveBeenCalledWith("Register plugin error at index: 0. id is required.");
    });
  });

  describe("When register an plugin without hook functions", () => {
    const plugin = {
      id: "invalid plugin",
    };

    it("Should not register invalid correct and return correct registered plugins", () => {
      const error = spyOn(global.console, "error");
      registerPlugins([plugin]);

      expect(error).toHaveBeenCalledWith(
        "Register plugin error at index: 0. id: \"invalid plugin\". Plugin's structure is not correct."
      );
    });
  });
});

describe("Test for usePlugins", () => {
  let plugins = null;
  beforeAll(() => {
    const cusPlugins = [
      {
        id: "plugin1",
        beforeMapping: (data) => {
          console.log("plugin 1 before");
          return data;
        },
        afterMapping: (data) => {
          console.log("plugin 1 after");
          return data;
        },
      },
      {
        id: "plugin2",
        beforeMapping: (data) => {
          console.log("plugin 2 before");
          return data;
        },
        afterMapping: (data) => {
          console.log("plugin 2 after");
          return data;
        },
      },
    ];

    plugins = registerPlugins(cusPlugins);
  });

  describe("When plugin id can be found", () => {
    it("Should get correct callbacks", () => {
      const itemPlugins = usePlugins(plugins, "plugin1");

      const log = spyOn(global.console, "log");
      itemPlugins.beforeMapping("test1");
      expect(log).toHaveBeenCalledWith("plugin 1 before");

      itemPlugins.afterMapping("test1");
      expect(log).toHaveBeenCalledWith("plugin 1 after");
    });

    it("Should invoke callbacks in correct order", () => {
      const itemPlugins = usePlugins(plugins, "plugin2|plugin1");

      const log = spyOn(global.console, "log");
      itemPlugins.beforeMapping("test1");
      expect(log).toHaveBeenNthCalledWith(1, "plugin 2 before");
      expect(log).toHaveBeenNthCalledWith(2, "plugin 1 before");

      itemPlugins.afterMapping("test1");
      expect(log).toHaveBeenNthCalledWith(3, "plugin 2 after");
      expect(log).toHaveBeenNthCalledWith(4, "plugin 1 after");
    });
  });

  describe("When plugin id can't be found", () => {
    it("Should skip register and keep invoke callbacks in correct order", () => {
      const error = spyOn(global.console, "error");
      const itemPlugins = usePlugins(plugins, "plugin2|unknown|plugin1");
      expect(error).toHaveBeenCalledWith(
        "Can't find registered plugin: unknown"
      );

      const log = spyOn(global.console, "log");
      itemPlugins.beforeMapping("test1");
      expect(log).toHaveBeenNthCalledWith(1, "plugin 2 before");
      expect(log).toHaveBeenNthCalledWith(2, "plugin 1 before");

      itemPlugins.afterMapping("test1");
      expect(log).toHaveBeenNthCalledWith(3, "plugin 2 after");
      expect(log).toHaveBeenNthCalledWith(4, "plugin 1 after");
    });
  });
});
