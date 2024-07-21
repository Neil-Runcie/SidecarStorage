
// Enhancements to JSON functionality to support saving and loading of persistent data to and from files
module.exports = {

    ObjectToText(object) {
        return JSON.stringify(object, Replacer);
    }

    ,

    TextToObject(text) {
        return JSON.parse(text, Reviver);
    }
}

// JSON stringify enhancer to allow for serialization of es6 maps and sets
function Replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    }
    else if (value instanceof Set) {
        return {
            dataType: 'Set',
            value: Array.from(value.values()),
        };
    }
    else {
        return value;
    }
}

// JSON Parse enhancer to allow for parsing of  es6 maps and sets
function Reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
        else if (value.dataType === 'Set') {
            return new Set(value.value);
        }
    }
    return value;
}