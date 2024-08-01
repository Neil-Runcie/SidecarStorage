const fs = require('fs');
const serial = require('./ObjectSerializer.js');


module.exports = {

    DatabaseFileHandler: class DatabaseFileHandler {

        constructor(storageLocation) {
            // folder location that contains the all stored data
            this.storageLocation = __dirname + storageLocation;
            // file location that contains metadata reference of where all data is stored
            this.metaDataLocation = __dirname + storageLocation + "\\meta.pyr";
            // folder location that contains all saved store data for each folder
            this.databaseLocation = __dirname + storageLocation + "\\db_";

            // metadata member variable stored as JSON in this.metaDataLocation
            this.configMetaData = new Map();

            if (fs.existsSync(this.metaDataLocation)) {
                this.loadConfiguration();
            }
            else {
                this.saveConfiguration();
            }
        }

        storageExists() {
            if (fs.existsSync(this.storageLocation))
                return true;
            return false;
        }

        /////// Functions for saving

        saveConfiguration() {
            if (!fs.existsSync(this.storageLocation))
                fs.mkdirSync(this.storageLocation);

            let metaDataString = serial.ObjectToText(this.configMetaData);
            fs.writeFileSync(this.metaDataLocation, metaDataString, function (err) {
                if (err)
                    throw new Error("Unable to save database changes to disk");
            });
        }

        saveDatabase(databaseName) {
            if (!fs.existsSync(this.databaseLocation + databaseName))
                fs.mkdirSync(this.databaseLocation + databaseName);

            if (!this.configMetaData.has(databaseName)) {
                this.configMetaData.set(databaseName, new Set());
                this.saveConfiguration();
            }
        }

        saveStore(databaseName, storeName, extension, store) {
            let storePath = this.databaseLocation + databaseName + "\\" + storeName + extension;
            fs.writeFileSync(storePath, serial.ObjectToText(store), { flag: 'w' }, (err) => {
                if (err)
                    throw new Error(`Unable to save store ${storeName} changes to disk`);
            });

            if (this.configMetaData.has(databaseName) && !this.configMetaData.get(databaseName).has(storeName + extension)) {
                this.configMetaData.get(databaseName).add(storeName + extension);
                this.saveConfiguration();
            }
        }

        /////// Functions for loading

        loadConfiguration() {
            if (fs.existsSync(this.metaDataLocation)) {
                let loadedConfigMetaData = serial.TextToObject(fs.readFileSync(this.metaDataLocation, "utf-8"));
                this.configMetaData.clear();
                for (let pair of loadedConfigMetaData) {
                    this.configMetaData.set(pair[0], pair[1]);
                }
            }
        }

        loadDatabaseNames() {

            let dbNames = [];
            for (let database of this.configMetaData) {
                if (fs.existsSync(this.databaseLocation + database[0])) {
                    dbNames.push(database[0]);
                }
            }

            return dbNames;
        }

        loadStores(folderName, extension) {

            let mappedStores = this.configMetaData.get(folderName);
            let databasePath = this.databaseLocation + folderName;
            let stores = [];
            for (let file of mappedStores.values()) {
                if (file.endsWith(extension)) {
                    if (fs.existsSync(databasePath + "\\" + file)) {
                        // creat an object with a name key populated by the file name being read and a filedata key populated by the parsed file content
                        let storeInfo = { name: file.slice(0, file.lastIndexOf(".")), fileData: serial.TextToObject(fs.readFileSync(databasePath + "\\" + file, "utf-8")) };
                        stores.push(storeInfo);
                    }
                }
            }

            return stores;
        }


        

        
        /////// Functions for deleting
        

        deleteDatabase(databaseName) {
            if (!fs.existsSync(this.databaseLocation + databaseName))
                fs.rmSync(this.databaseLocation + databaseName, { recursive: true, force: true });

            if (this.configMetaData.has(databaseName)) {
                this.configMetaData.delete(databaseName);
                this.saveConfiguration();
            }
        }

        deleteStore(databaseName, storeName, extension) {
            let storePath = this.databaseLocation + databaseName + "\\" + storeName + extension;
            if (!fs.existsSync(storePath)) {
                fs.unlink(storePath, (err) => {
                    if (err)
                        throw new Error(`Unable to delete store ${storeName} from the disk`);
                });
            }

            if (this.configMetaData.has(databaseName)) {
                this.configMetaData.get(databaseName).delete(storeName + extension);
                this.saveConfiguration();
            }
        }
        
        deleteAllStorage() {
            fs.rmSync(this.storageLocation, { recursive: true, force: true });
        }

    }
}

