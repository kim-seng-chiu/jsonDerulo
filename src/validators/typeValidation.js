module.exports = function typeValidation(input, type) {
    if(typeof input !== type) {
        //switch
        switch(type) {
            case "number":
                const result = parseFloat(input);
                if(result != input) { console.log("error")}
                return result;
            case "string":
                break;
            default:
                // error handle
                break;
        }
    }
    return input
}