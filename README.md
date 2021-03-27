# JSON Derulo (WIP)

This is still a work in progress, I apologise if the documentation does not make much sense.

This package takes in data and returns it as a JSON object. Kind of like how Jason Derulo sings his name in every song.

I am not sure if the name of this package infringes on anything.

# `noKeys`
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

# `specifiedKeys`
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