let result;

const noKeys = (contents) => {
    const contentType = Array.isArray(contents) ? "array" : typeof contents;
    
    switch(contentType){
        case "string":
            result = {
                0: contents
            };
            return result;
        case "array":
            let object = {};
            let count = 0;
            contents.map(content => {
                object[count] = content;
                count++;
            });
            return object;
        case "object":
            console.info("It is already an object");
            return contents;
        default:
            return {
                status: "Not run",
                message: "Unable to identify content type"
            }
    }
}

const specifiedKeys = (keys, contents) => {
    console.time("specifiedKeys");
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
    console.timeEnd("specifiedKeys");
    return JSON.stringify(results);
}

module.exports = {
    noKeys,
    specifiedKeys
};
