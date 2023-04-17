# Plugin System

We added the plugin system for the Mapper to make it easier for you to deal with some complex situation. The plugins can be used as source data pre-process or resolved value converter.

Although, we can use plugins to re-create the whole customized mapping system. But we still recommend that only use the plugins for resolved value conversion or when you have to use it.

## Define your plugin:
*An example plugin should have structure as below:*
```javascript
{
  id: "...",    
  beforeMapping: (mapItems) => { // before mapping hook function 
    ...
    return newMapItems;
  },
  afterMapping: (resolvedValue) => { // after mapping hook function
    ...
    return newResolvedValue;
  }
}
```
Now, we provide 2 hook functions: `beforeMapping` and `afterMapping` to implement. A plugin should have `id` and either `beforeMapping` or `afterMapping`, or both of them. 

### id
Required. The unique id with register, this id will be used in data schema to declare the using of the plugins.

**Be careful:** 
If a plugin has already been registered, the following registration for the plugins with same "id" will be ignored. So, don't use the id which has already been used for [built-in plugins](#the-built-in-plugins).

### beforeMapping

The before mapping hook function, which will be invoked before resolving `mapItem`s' value, its return value will be used as the mapItems in resolving. 

`beforeMapping` is usually used to re-organize the input data, and transform them into the shape that you can apply your mapping rules on easier.

### afterMapping

The after mapping hook function, which will be invoked after resolving `mapItem`s' value, its return value will be used as resolved value. 

`afterMapping` is usually used to convert the resolved value into the format that you want.

## Register you plugin when create a Mapper:
Now, we add an `options` parameter when we create an instance of `Mapper`. In `options` parameter you can register your plugins with the `plugins` field:

*Example*
```javascript
// require the jsonderulo module
const { Mapper } = require('@kim-seng-chiu/jsonderulo');

...

// define your plugin
const pluginMultipleAThousand = {
  id: "divide_by_1000", // the unique id with register
  afterMapping: (value) => { // the after mapping hook function, which will add 1 to the resolved value 
    if (typeof value === 'number')
        return Math.round(value / 1000)
    
    if (typeof value === 'string' && !isNaN(Number(value))) 
        return Math.round(Number(value) / 1000)

    return value
  }
}

...

// register plugins when create a Mapper instance
const mapper = new Mapper({
    plugins: [pluginMultipleAThousand],
    ...
})

mapper.map(data, mySchema)

...

```

## The "built-in" plugins

We have added some built-in plugins which can implement common data conversion. i.e. the length of array.
The built-in plugins doesn't need to register, they will be registered by default.
More built-in plugins will be added.
See [src/built-in-plugins.js](src/built-in-plugins.js).

## Use plugins in your schema

To use the plugins in the schema, you just need defined a plugins field for the property you want to apply to. 

*Example*
```json
...

"TimeInSeconds": {
    "type": "number",
    "description": "Time displays as seconds",
    "mapItems": ["time_value_in_milliseconds"],
    "plugins": "divide_by_1000"
},

...
```

### Use multiple plugins

Multiple plugins can be separated by the "|" sign.
If more than one plugin are used, the invocation order will be from left to right. Each plugins return value will be used as the input value of the next plugin. You can imagine its behavior like a pipe line.

*Example*
```json
...

"PriceAbove100": {
    "type": "number",
    "description": "The number of books whose price is above 100",
    "mapItems": ["books"],
    "plugins": "price_filter | length"
},

...
```
### See [more documents](README.md)