import { Database } from './Database.js';
import { DataStorage } from './DataStorage.js';

let instance;

export class DatabaseManager {

    constructor() {
        // The DatabaseManager is a singleton class to avoid data handling errors
        if (instance !== null && instance !== undefined)
            throw new Error("Only one instance of the DatabaseManager should be created");
        instance = this;

        // databases currently loaded stored as <name, Database Object>
        this.databases = new Map();
        // names of databases to be deleted when databases are saved
        this.databasesToBeDeleted = new Set();
        // flag for enabling saving and loading of data
        this.saveAndLoadEnabled = false;
        // Object for handling database saving and loading
        this.storageHandler = {};
    }

        


    // creates a database object and maps it to databases class variable
    createDatabase(name) {
        if ((typeof name) != "string" || name == "")
            throw new TypeError("The createDatabase function expects a non-empty string as the parameter");
        if (this.databases.has(name))
            throw new Error("A database with this name has already been created in this database");

        this.databases.set(name, new Database(name));

        return this.databases.get(name);
    }

    // returns an array of database names
    getAllDatabaseNames() {
        let names = [];
        for (let database of this.databases)
            names.push(database[0]);
        return names;
    }

    // returns a database object given an existing database name
    getDatabase(name) {
        if ((typeof name) != "string" || name == "")
            throw new TypeError("The getDatabase function expects a non-empty string as the parameter");

        return this.databases.get(name);
    }

    // deletes a database object given an existing database name
    deleteDatabase(name) {
        if ((typeof name) != "string" || name == "")
            throw new TypeError("The deleteDatabase function expects a non-empty string as the parameter");

        if (this.databases.has(name)) {
            this.databases.delete(name);
            return this.databasesToBeDeleted.add(name);
        }
        return false;
    }


    // Sets storage object based on provided storageMethod string
    enableSavingAndLoading(storageMethod="LOCALDISK") {
        if ((typeof storageMethod) != "string" || storageMethod == "")
            throw new TypeError("The enableSavingAndLoading function expects a nonempty string as the parameter");

        if (!this.savingAndLoadingIsEnabled()) {
            this.saveAndLoadEnabled = true;
            // Parameter validation is handled by storage object
            this.storageHandler = new DataStorage(storageMethod);
        }
    }

    disableSavingAndLoading() {
        this.saveAndLoadEnabled = false;
        this.storageHandler = {};
    }

    savingAndLoadingIsEnabled() {
        if (this.saveAndLoadEnabled == true && JSON.stringify(this.storageHandler) != "{}") {
            return true;
        }
        return false;
    }

    // load databases from persistent storage if no databases records are present
    loadDatabasesFromStorage() {
        if (!this.savingAndLoadingIsEnabled())
            throw new Error("Saving and loading has not been enabled");

        if (this.databases.size <= 0) {
            this.databases = this.storageHandler.loadDatabases();
            return true;
        }
        return false;
    }

    // load databases from persistent storage
    forceLoadDatabasesFromStorage() {
        if (!this.savingAndLoadingIsEnabled())
            throw new Error("Saving and loading has not been enabled");

        this.databases = this.storageHandler.loadDatabases();
    }

    // save databases to persistent storage
    saveDatabasesToStorage() {
        if (!this.savingAndLoadingIsEnabled())
            throw new Error("Saving and loading has not been enabled");

        if (this.databasesToBeDeleted.size != 0)
            this.storageHandler.deleteDatabases(this.databasesToBeDeleted);

        if (this.databases.size != 0)
            this.storageHandler.saveDatabases(this.databases);
    }


    deleteAllStoredData() {
        if (!this.savingAndLoadingIsEnabled())
            throw new Error("Saving and loading has not been enabled");

        this.storageHandler.deleteAllStorage();
    }

    clearInstance() {
        instance = undefined;
    }


}




