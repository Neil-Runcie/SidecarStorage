const keyValueStore = require('./KeyValueStore.js');
const textSearchStore = require('./TextSearchStore.js');


module.exports = {
    // Database-like wrapper for organizing stores and organizing data to be saved
    Database: class DataBase {

        constructor(name) {
            this.name = name;

            this.keyValueStores = new Map();
            this.KVstoresToBeDeleted = new Set();

            this.textSearchStores = new Map();
            this.TSstoresToBeDeleted = new Set();

            this.toBeSaved = true;
        }

        //////// Creation of stores

        // keys must be an object
        createKeyValueStore(name, keys) {
            if ((typeof name) != "string" || name == "")
                throw new TypeError("The createKeyValueStore function expects a non-empty string as the first parameter");
            if (this.keyValueStores.has(name))
                throw new Error("A Key Value Store with this name has already been created in this database");

            // Type checking of keys handled by KeyValueStore
            this.keyValueStores.set(name, new keyValueStore.KeyValueStore(keys));

            return this.keyValueStores.get(name);
        }

        createTextSearchStore(name) {
            if ((typeof name) != "string" || name == "")
                throw new TypeError("The createTextSearchStore function expects a non-empty string as the parameter");
            if (this.textSearchStores.has(name))
                throw new Error("A Text Search Store with this name has already been created in this database");

            this.textSearchStores.set(name, new textSearchStore.TextSearchStore());

            return this.textSearchStores.get(name);
        }


        //////// Retrieval of available store names as arrays

        getKeyValueStoreNames() {
            let names = [];
            for (let name of this.keyValueStores)
                names.push(name[0]);
            return names;
        }

        getTextSearchStoreNames() {
            let names = [];
            for (let name of this.textSearchStores)
                names.push(name[0]);
            return names;
        }

        getAllStoreNames() {
            let names = [];

            for (let name of this.keyValueStores)
                names.push(name[0]);

            for (let name of this.textSearchStores)
                names.push(name[0]);

            return names;
        }


        //////// Retrieval of available store objects by name

        getKeyValueStore(name) {
            if ((typeof name) != "string" || name == "")
                throw new TypeError("The getKeyValueStore function expects a non-empty string as the parameter");

            return this.keyValueStores.get(name);
        }

        getTextSearchStore(name) {
            if ((typeof name) != "string" || name == "")
                throw new TypeError("The getTextSearchStore function expects a non-empty string as the parameter");

            return this.textSearchStores.get(name);
        }

        //////// Deletion of available store objects by name

        // return true if a value has been deleted and false otherwise
        deleteKeyValueStore(name) {
            if ((typeof name) != "string" || name == "")
                throw new TypeError("The deleteKeyValueStore function expects a non-empty string as the parameter");

            if (this.keyValueStores.has(name)) {
                this.KVstoresToBeDeleted.add(name);
                return this.keyValueStores.delete(name);
            }
            return false;
        }

        // return true if a value has been deleted and false otherwise
        deleteTextSearchStore(name) {
            if ((typeof name) != "string" || name == "")
                throw new TypeError("The deleteTextSearchStore function expects a non-empty string as the parameter");

            if (this.textSearchStores.has(name)) {
                this.TSstoresToBeDeleted.add(name);
                return this.textSearchStores.delete(name);
            }
            return false;
        }

        // Database saving logic
        needsToBeSaved() {
            return this.toBeSaved;
        }

        // status should be true or false
        setSaveStatus(status) {
            if ((typeof status) != "boolean")
                throw new TypeError("The setSaveStatus function expects a boolean value as the parameter");

            this.toBeSaved = status;
        }
    }
}