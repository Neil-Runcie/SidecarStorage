 
module.exports = {
    KeyValueStore: class KeyValueStore {

        // keys is an array of strings that will be used as keys to the table
        constructor(keys) {
            // Cannot proceed with invalid keys
            if (!creationKeysAreValid(keys))
                throw new TypeError("Invalid keys were provided. Expected array of non-empty strings");

            this.keys = keys;
            this.map = new Map();
        }


        // Add new data to store based on keys object
        // Will only add new data and skip if data is already present for keys
        // returns false if no addition of data occured and true otherwise
        add(keys, data) {
            if (data == undefined)
                throw new TypeError("The add function does not accept undefined data");
            if (!areKeysValid(keys, this.keys))
                throw new Error("The provided keys are not valid for this KeyValueStore object");

            let keyString;
            try {
                keyString = createCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                throw new Error("The provided keys are not valid for this KeyValueStore object");
            }

            if (this.map.has(keyString))
                return false;

            let dataDeepCopy = JSON.parse(JSON.stringify(data));
            this.map.set(keyString, dataDeepCopy);
            return true;
        }

        // Read data from store based on keys object
        // If data does not exist return undefined 
        // returns data from map associated with provided keys
        read(keys) {
            if (!areKeysValid(keys, this.keys))
                throw new Error("The provided keys are not valid for this KeyValueStore object");

            let keyString;
            try {
                keyString = createCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                throw new Error("The provided keys are not valid for this KeyValueStore object");
            }

            if (!this.map.has(keyString))
                return undefined;

            return this.map.get(keyString);
        }

        // Return all data from store as an array
        readAll() {
            return Array.from(this.map.values());
        }

        // Update data to store based on keys object
        // Will only update existing data and skip if data is not already present for keys
        // returns false if no update of data occured and true otherwise
        update(keys, data) {
            if (data == undefined)
                throw new TypeError("The update function does not accept undefined data");
            if (!areKeysValid(keys, this.keys))
                throw new Error("The provided keys are not valid for this KeyValueStore object");

            let keyString;
            try {
                keyString = createCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                throw new Error("The provided keys are not valid for this KeyValueStore object");
            }

            if (!this.map.has(keyString))
                return false;

            let dataDeepCopy = JSON.parse(JSON.stringify(data));
            this.map.set(keyString, dataDeepCopy);
            return true;
        }

        // Add or update data based on keys object
        // Will add or update data depending on whether data is present for associated keys or not
        // returns false if no update of data occured and true otherwise
        addOrUpdate(keys, data) {
            if (data == undefined)
                throw new TypeError("The addOrUpdate function does not accept undefined data");
            if (!areKeysValid(keys, this.keys))
                throw new Error("The provided keys are not valid for this KeyValueStore object");

            let keyString;
            try {
                keyString = createCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                throw new Error("The provided keys are not valid for this KeyValueStore object");
            }

            let dataDeepCopy = JSON.parse(JSON.stringify(data));
            this.map.set(keyString, dataDeepCopy);
            return true;
        }

        // Delete data and associated keys based on keys object
        // Returns true if deleted, false if it does not exist
        delete(keys) {
            if (!areKeysValid(keys, this.keys))
                throw new Error("The provided keys are not valid for this KeyValueStore object");

            let keyString;
            try {
                keyString = createCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                throw new Error("The provided keys are not valid for this KeyValueStore object");
            }

            if (this.map.has(keyString))
                return this.map.delete(keyString);
        }

        // Read data from store by calling passed searchCondition function on each data element
        // If data cannot be found due to it not existing or due to an error, return empty array.
        // Otherwise return data corresponding to data that returned true from searchCondition function
        conditionalRead(searchCondition) {
            if (typeof searchCondition !== "function")
                throw new TypeError("The conditionalRead function can only accept a function that returns a boolean value as a parameter");

            let searchResult = [];
            
            let providedKeys = this.map.keys();
            for (const key of providedKeys) {
                try {
                    if (searchCondition(this.map.get(key))) {
                        searchResult.push(this.map.get(key));  
                    }
                }
                catch {
                    return [];
                }
            }

            return searchResult;
        }

        // Delete data from store by calling passed searchCondition function on each data element
        // If data cannot be found due to it not existing or due to an error, return 0.
        // Otherwise delete data corresponding to data that returned true from searchCondition function and return the number of records deleted
        conditionalDelete(searchCondition) {
            if (typeof searchCondition !== "function")
                throw new TypeError("The conditionalRead function can only accept a function that returns a boolean value as a parameter");

            let numberOfRecordsDeleted = 0;

            let providedKeys = this.map.keys();
            for (const key of providedKeys) {
                try {
                    if (searchCondition(this.map.get(key))) {
                        this.map.delete(key);
                        numberOfRecordsDeleted++;
                    }
                }
                catch {
                    return 0;
                }
            }

            return numberOfRecordsDeleted;
        }

        getNumberOfEntries() {
            return this.map.size;
        }
    }
}



///////////// Private functions for KeyValueStore class

// Uses providedKeys object and expectedKeys array to see if provided keys are valid
// Returns false if not valid and true otherwise
function areKeysValid(providedKeys, expectedKeys) {
    if (typeof providedKeys !== "object")
        return false;

    for (let key of expectedKeys) {
        if (providedKeys[key] === undefined)
            return false;
        if ((typeof providedKeys[key]) != "string" || providedKeys[key] == "") {
            return false;
        }
    }

    return true;
}

// Uses providedKeys object and expectedKeys array to build a string of comma separated key
// Returns the comma separated key string and throws an error if it cannot be done
function createCommaSeparatedKeyString(providedKeys, expectedKeys) {
    let keyString = "";

    for (let i = 0; i < expectedKeys.length; i++) {
        if (providedKeys[expectedKeys[i]] === undefined) 
            throw new Error(`key ${expectedKeys[i]} was not provided`);

        keyString += providedKeys[expectedKeys[i]];
        if (i != expectedKeys.length - 1)
            keyString += ",";
    }

    return keyString;
}

// Validate if passed keys array parameter is an array containing only non-empty strings
// Returns false if keys array is not valid and true otherwise
function creationKeysAreValid(keys) {
    if (!Array.isArray(keys) || keys.length == 0) {
        return false;
    }
    for (let key of keys) {
        if (typeof key != "string" || key == "") {
            return false;
        }
    }

    return true;
}