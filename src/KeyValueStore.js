 
module.exports = {
    KeyValueStore: class KeyValueStore {

        // keys is an array of strings that will be used as keys to the table
        constructor(keys) {
            // Cannot proceed with invalid keys
            if (!CreationKeysAreValid(keys));
                throw new Error("Invalid keys were provided. Expected array of non-empty strings");

            this.keys = keys;
            this.map = new Map();
            this.modifiedSinceLastSave = true;
            this.toBeSaved = true;
        }


        // Add new data to store based on keys object
        // Will only add new data and skip if data is already present for keys
        // returns false if no addition of data occured and true otherwise
        Add(keys, data) {
            if (!AreKeysValid(keys, this.keys))
                return false;

            let keyString;
            try {
                keyString = CreateCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                return false;
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
        Read(keys) {
            if (!AreKeysValid(keys, this.keys))
                return undefined;

            let keyString;
            try {
                keyString = CreateCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                return undefined;
            }

            if (!this.map.has(keyString))
                return undefined;

            return this.map.get(keyString);
        }

        // Return all data from store as an array
        ReadAll() {
            return this.map.values().toArray();
        }

        // Update data to store based on keys object
        // Will only update existing data and skip if data is not already present for keys
        // returns false if no update of data occured and true otherwise
        Update(keys, data) {
            if (!AreKeysValid(keys, this.keys))
                return false;

            let keyString;
            try {
                keyString = CreateCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                return false;
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
        AddOrUpdate(keys, data) {
            if (!AreKeysValid(keys, this.keys))
                return false;

            let keyString;
            try {
                keyString = CreateCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                return false;
            }

            let dataDeepCopy = JSON.parse(JSON.stringify(data));
            this.map.set(keyString, dataDeepCopy);
            return true;
        }

        // Delete data and associated keys based on keys object
        // Returns true if deleted, false if it does not exist
        Delete(keys) {
            if (!AreKeysValid(keys, this.keys))
                return false;

            let keyString;
            try {
                keyString = CreateCommaSeparatedKeyString(keys, this.keys);
            }
            catch {
                return false;
            }

            if (this.map.has(keyString))
                return this.map.delete(keyString);
        }

        // Read data from store by calling passed searchCondition function on each data element
        // If data cannot be found due to it not existing or due to an error, return empty array.
        // Otherwise return data corresponding to data that returned true from searchCondition function
        conditionalRead(searchCondition) {
            if (typeof searchCondition !== "function")
                return [];

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
                return 0;

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

        // Store saving logic
        needsToBeSaved() {
            return (this.toBeSaved && this.modifiedSinceLastSave);
        }

        setSavedFlag() {
            this.modifiedSinceLastSave = false;
        }

        // status should be true or false
        setSaveStatus(status) {
            if ((typeof name) != "boolean")
                return;

            this.toBeSaved = status;
        }

    }
}



///////////// Private functions for KeyValueStore class

function AreKeysValid(providedKeys, expectedKeys) {
    if (typeof providedKeys !== "object")
        return false;

    let providedKeys = Object.keys(keys);
    if (expectedKeys.length > providedKeys.length)
        return false;

    return true;
}

function CreateCommaSeparatedKeyString(providedKeys, expectedKeys) {
    let keyString = "";

    for (let i = 0; i < expectedKeys.length; i++) {
        if (providedKeys[expectedKeys[i]] === undefined)
            throw new Error(`key ${expectedKeys} was not provided`);

        keyString += providedKeys[expectedKeys[i]];
        if (i != expectedKeys.length - 1)
            keyString += ",";
    }

    return keyString;
}

// Validate if passed keys parameter is an array containing only non-empty strings
function CreationKeysAreValid(keys) {
    if (!Array.isArray(keys) || keys.length == 0) {
        return false;
    }
    for (let key of keys) {
        if ((typeof key) != "string" || key == "") {
            return false;
        }
    }
    return true;
}