const noKeys = (contents) => {
    const contentType = Array.isArray(contents) ? "array" : typeof contents;
    
    switch(contentType){
        case "string":
            return {
                0: contents
            };
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

module.exports = noKeys;