const specifiedKeys = (keys, contents) => {
    let results = [];
    if (keys === undefined || contents === undefined) {
        throw new Error({
            error: "Input",
            message: "Keys or contents were undefined"
        })
    };
    if (!Array.isArray(keys)) {
        throw new Error({
            error: "Input",
            message: "Given keys were not in an array"
        })
    };
    if (!Array.isArray(contents[0])) {
        throw new Error({
            error: "Input",
            message: "Content is not in an array"
        })
    };
    if (keys.length != contents[0].length) {
        throw new Error({
            error: 1,
            message: "Number of keys does not align with length of each content array"
        });
    };
    contents.map(content => {
        let jsonObject = {};
        keys.forEach(key => {
            jsonObject[key] = content[keys.indexOf(key)];
        });
        results.push(jsonObject);
    })
    return results;
}

module.exports = specifiedKeys;