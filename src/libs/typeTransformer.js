module.exports = function typeTransformer(dataType) {
    switch(dataType) {
        case "string":
        case "number":
        case "boolean":
        case "dateandtime":
            //
            return;
        case "object":
            return;
        case "array":
        default:
            throw new Error({
                message: "Data type not recognised"
            })
    }
}