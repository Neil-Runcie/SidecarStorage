const diskIO = require('./DatabaseFileHandler.js');
const dbs = require('./Database.js');
const config = require('./config.js');

var allowedStorageMethods = ["LOCALDISK"];

module.exports = {
    // The DataStorage class encapsulates the saving and loading of database data 
    // to avoid changes in the DatabaseManager classwhen underlying storage implementations changes
    DataStorage: class DataStorage {

        // storageMethod is a string
        constructor(storageMethod = "LOCALDISK") {
            // setting up logic for future expecation of having multiple storage options
            if (typeof storageMethod != "string")
                storageMethod = "LOCALDISK";
            else if (!allowedStorageMethods.includes(storageMethod))
                storageMethod = "LOCALDISK";


            if (storageMethod == "LOCALDISK")
                this.storageHandler = new diskIO.DatabaseFileHandler(config.storageConfig.StorageLocation);
            this.allowedExtensions = config.storageConfig.extensionObject;
        }

        saveDatabases(mapOfDatabases) {
            // database[0] is the database name. database[1] is the object.
            for (let database of mapOfDatabases) {
                if (database[1].isToBeSaved())
                    this.saveDatabase(database[0], database[1]);
            }
        }

        saveDatabase(name, database) {
            this.storageHandler.saveDatabase(name);

            // Stores are a map. store[0] is the store name. store[1] is the object. 
            // Save key values stores to associated database
            for (let store of database.keyValueStores) {
                if (store[1].isToBeSaved())
                    this.saveStore(name, store[0], this.allowedExtensions.KeyValueStoreExtension, store[1]);
            }
            // Save text search stores to associated database
            for (let store of database.textSearchStores) {
                if (store[1].isToBeSaved())
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
                let newDatabase = new dbs.Database(dbName);
                dbMap.set(dbName, newDatabase);

                let kvObjects = this.storageHandler.loadStores(dbName, this.allowedExtensions.KeyValueStoreExtension);
                for (let obj of kvObjects) {
                    newDatabase.createKeyValueStore(obj.name, {});
                    Object.assign(newDatabase.getKeyValueStore(obj.name), obj);
                }

                let tsObjects = this.storageHandler.loadStores(dbName, this.allowedExtensions.TextSearchStoreExtension);
                for (let obj of tsObjects) {
                    newDatabase.createTextSearchStore(obj.name);
                    Object.assign(newDatabase.getTextSearchStore(obj.name), obj);
                }
            }

            return dbMap;
        }

        loadStores(extension) {
            this.storageHandler.loadStores(databaseName, extension);
        }

    }
}