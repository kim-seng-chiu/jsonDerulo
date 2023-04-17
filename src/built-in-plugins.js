const builtinPlugins = {
  length: {
    id: "length",
    afterMapping: (data) => {
      if (Array.isArray) {
        return data.length;
      } else if (typeof data === "object" && data !== null) {
        return 1;
      } else if (typeof data === "number" && !isNaN(data)) {
        return Math.floor(data);
      } else if (typeof data === "string") {
        const parsedNumber = Number(data);

        if (!isNaN(parsedNumber)) {
          return Math.floor(parsedNumber);
        }
      }

      return 0;
    },
  },
};

module.exports = { builtinPlugins }; 
