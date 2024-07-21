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

            this.modifiedSinceLastSave = true;
            this.toBeSaved = true;
        }

        //////// Creation of stores

        // keys must be an object
        createKeyValueStore(name, keys) {
            if ((typeof name) != "string")
                return;
            if ((typeof keys) != "object")
                return;

            this.keyValueStores.set(name, new StoreMgmtWrapper(new keyValueStore.KeyValueStore(keys)));
            this.numberOfKVStores++;
        }

        createTextSearchStore(name) {
            if ((typeof name) != "string")
                return;

            this.textSearchStores.set(name, new StoreMgmtWrapper(new textSearchStore.TextSearchStore()));
            this.numberOfTSStores++;
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
            if ((typeof name) != "string")
                return;

            return this.keyValueStores.get(name).store;
        }

        getTextSearchStore(name) {
            if ((typeof name) != "string")
                return;

            return this.textSearchStores.get(name).store;
        }

        //////// Deletion of available store objects by name

        deleteKeyValueStore(name) {
            if ((typeof name) != "string")
                return;

            if (this.keyValueStores.has(name)) {
                this.keyValueStores.delete(name);
                this.KVstoresToBeDeleted.add(name);
            }
        }


        deleteTextSearchStore(name) {
            if ((typeof name) != "string")
                return;

            if (this.textSearchStores.has(name)) {
                this.textSearchStores.delete(name);
                this.TSstoresToBeDeleted.add(name);
            }
        }


        // Database saving logic
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

class StoreMgmtWrapper {

    constructor(store) {
        this.store = store;
    }
}