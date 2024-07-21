const dbs = require('./Database.js')
const dstore = require('./DataStorage.js')

let instance;

module.exports = {

    DatabaseManager: class DatabaseManager {

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

        // Sets storage object based on provided storageMethod string
        EnableSavingAndLoading(storageMethod) {
            this.saveAndLoadEnabled = true;
            this.storageHandler = new dstore.DataStorage(storageMethod);
        }

        // creates a database object and maps it to databases class variable
        createDatabase(name) {
            if ((typeof name) != "string" || name == "")
                return;
            if (this.databases.has(name))
                return;

            this.databases.set(name, new dbs.Database(name));
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
            if ((typeof name) != "string")
                return;

            return this.databases.get(name);
        }

        // deletes a database object given an existing database name
        deleteDatabase(name) {
            if ((typeof name) != "string")
                return;

            if (this.databases.has(name)) {
                this.databases.delete(name);
                this.databasesToBeDeleted.add(name);
            }
        }

        // load databases from persistent storage if no databases records are present
        loadDatabasesFromStorage() {
            if (JSON.stringify(this.saveAndLoadEnabled) == false)
                return;

            if (this.databases.size <= 0)
                this.databases = this.storageHandler.loadDatabases();
        }

        // load databases from persistent storage
        forceLoadDatabasesFromStorage() {
            if (JSON.stringify(this.saveAndLoadEnabled) == false)
                return;

            this.databases = this.storageHandler.loadDatabases();
        }

        // save databases to persistent storage
        saveDatabasesToStorage() {
            if (JSON.stringify(this.saveAndLoadEnabled) == false)
                return;

            if (this.databasesToBeDeleted.size != 0)
                this.storageHandler.deleteDatabases(this.databasesToBeDeleted);

            if (this.databases.size != 0)
                this.storageHandler.saveDatabases(this.databases);
        }


    }
}



