module.exports = function typeCoercion(input, type) {
    if(typeof input !== type) {
        switch(type) {
            case "number":
                const result = parseInt(input);
                if (result != input) {
                    console.warn("Unable to convert to number, returning user input.")
                    return input;
                }
                return parseInt(input);
            case "boolean":
                if(input === "true") {
                    return true
                } else if (input === "false") {
                    return false
                } else {
                    console.warn("Did not find a match for a boolean, returning user input.");
                    return input;
                }
            default:
                return input;
        }
    }
    return input;
}