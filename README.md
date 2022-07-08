# JSON Derulo

This is still a work in progress, I apologise if the documentation does not make much sense.

This package takes in data and returns it as a JSON object. Kind of like how Jason Derulo sings his name in every song.

I am not sure if the name of this package infringes on anything.

## `noKeys`
This method can be used when the keys for the object are not important. It will determine the data type that is passed to the function.

*Example*
```javascript
const jd = require("jsonDerulo");
const sentence = "Please put this in an object";
const returnObject = jd.noKeys(sentence);
console.log(returnObject);
// console prints 
// { 0: "Please put this in an object" }
```

## `specifiedKeys`
*Example*
```javascript
const jd = require("jsonDerulo");
const keys = ["id", "name", "age"];
const data = [[1, "Bethany", 23], [2, "Mike", 35], [3, "Daniel", 31]];
const toDatabase = jd.specifiedKeys(keys, data);
console.log(toDatabase);
// prints
// [{"id":1,"name":"Bethany","age":23},{"id":2,"name":"Mike","age":35},{"id":3,"name":"Daniel","age":31}]
```

## `mapper`
The idea is for this function to be used with a large dataset of objects that require to be mapped to a new schema.

The main function `mapper` takes two arguments, currently.
* `input` is the "raw" or original data.
* `schema` is the defined schema that the original data requires to be mapped to. This is defined [here](#schema-for-mapper).
* `inputKeys` is to get the parent levels keys from the input data.

`mapper` loops over the defined schema to find and match the corresponding values from the input.

### Schema for mapper
* The template should be a JSON object
* Each `key` should have an object with the following attributes
* Refer to [JSON data types](https://datatracker.ietf.org/doc/html/rfc7159#:~:text=JSON%20can%20represent%20four%20primitive%20types%20(strings%2C%20numbers%2C%20booleans%2C%0A%20%20%20and%20null)%20and%20two%20structured%20types%20(objects%20and%20arrays).)

| attribute | data type | required | values |
| --------- | --------- | -------- | ------ |
| type | string | yes | "string", "number", "boolean", "datetime", "object", "array", "set", "tags", "set(strings)" |
| mapItems | array(strings) | no | - |
| description | string | no | - |
| properties | object | yes for data type object | - |

### Data types for `mapper`
(documentation WIP)
| data type | description of usage |
| --------- | -------------------- |
| string | |
| number | |
| boolean | |
| datetime | |
| object | |
| array | |
| set | |
| tags | |
| set(strings) | |

### Filtering an array to extract particular values (WIP)

### Roadmap for `mapper`
* Refactor for consistent variable names
* `getPrimitivesSet` to be used for set(strings | numbers)
* Filtering source data that is an array with multiple conditions
