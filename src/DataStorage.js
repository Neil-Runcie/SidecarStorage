import { DatabaseFileHandler } from './DatabaseFileHandler.js';
import { Database } from './Database.js';
import { storageConfig } from './config.js';

var allowedStorageMethods = ["LOCALDISK"];

export
// The DataStorage class encapsulates the saving and loading of database data 
// to avoid changes in the DatabaseManager classwhen underlying storage implementations changes
    class DataStorage {

    // storageMethod is a string
    constructor(storageMethod = "LOCALDISK") {
        // setting up logic for future expecation of having multiple storage options
        if (typeof storageMethod != "string")
            storageMethod = "LOCALDISK";
        else if (!allowedStorageMethods.includes(storageMethod))
            storageMethod = "LOCALDISK";


        if (storageMethod == "LOCALDISK")
            this.storageHandler = new DatabaseFileHandler(storageConfig.StorageLocation);
        this.allowedExtensions = storageConfig.Extensions;
    }

    saveDatabases(mapOfDatabases) {
        // database[0] is the database name. database[1] is the object.
        for (let database of mapOfDatabases) {
            if (database[1].needsToBeSaved()) {
                this.saveDatabase(database[0], database[1]);
            }
        }
    }

    saveDatabase(name, database) {
        this.storageHandler.saveDatabase(name);

        // Stores are a map. store[0] is the store name. store[1] is the object. 
        // Save key values stores to associated database
        for (let store of database.keyValueStores) {
            this.saveStore(name, store[0], this.allowedExtensions.KeyValueStoreExtension, store[1]);
        }
        // Save text search stores to associated database
        for (let store of database.textSearchStores) {
            this.saveStore(name, store[0], this.allowedExtensions.TextSearchStoreExtension, store[1]);
        }
    }

    deleteDatabases(arrayOfDatabases) {
        for (let dbToBeDeleted of arrayOfDatabases) {
            this.deleteDatabase(dbToBeDeleted);
        }
    }

    deleteStore(databaseName, storeName, extension) {
        this.storageHandler.deleteStore(databaseName, storeName, extension);
    }

    saveStore(databaseName, storeName, extension, store) {
        this.storageHandler.saveStore(databaseName, storeName, extension, store);
    }

    loadDatabases() {
        let dbMap = new Map();
        let nameArray = this.storageHandler.loadDatabaseNames();

        for (let dbName of nameArray) {
            let newDatabase = new Database(dbName);
            dbMap.set(dbName, newDatabase);

            let kvObjects = this.storageHandler.loadStores(dbName, this.allowedExtensions.KeyValueStoreExtension);

            for (let obj of kvObjects) {
                newDatabase.createKeyValueStore(obj.name, obj.fileData.keys);
                Object.assign(newDatabase.getKeyValueStore(obj.name), obj.fileData);
            }

            let tsObjects = this.storageHandler.loadStores(dbName, this.allowedExtensions.TextSearchStoreExtension);
            for (let obj of tsObjects) {
                newDatabase.createTextSearchStore(obj.name);
                Object.assign(newDatabase.getTextSearchStore(obj.name), obj.fileData);
            }
        }

        return dbMap;
    }

    loadStores(extension) {
        this.storageHandler.loadStores(databaseName, extension);
    }

    storageExists() {
        return this.storageHandler.storageExists()
    }

    deleteAllStorage() {
        this.storageHandler.deleteAllStorage();
    }

}
