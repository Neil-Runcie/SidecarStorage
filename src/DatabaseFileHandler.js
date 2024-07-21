const fs = require('fs');
const serial = require('./ObjectSerializer.js');


module.exports = {

    DatabaseFileHandler: class DatabaseFileHandler {

        constructor(storageLocation) {
            this.metaDataLocation = __dirname + storageLocation + "\\meta.pyr";
            this.databaseLocation = __dirname + storageLocation + "\\db_";

            this.configMetaData = new Map();

            if (fs.existsSync(this.metaDataLocation)) {
                this.loadConfiguration();
            }
            else {
                this.saveConfiguration();
            }
        }

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
                        stores.push(serial.TextToObject(fs.readFileSync(databasePath + "\\" + file, "utf-8")));
                    }
                }
            }

            return stores;
        }


        deleteDatabase(databaseName) {
            if (!fs.existsSync(this.databaseLocation + databaseName))
                fs.rmSync(this.databaseLocation + databaseName, { recursive: true, force: true });

            if (this.configMetaData.has(databaseName)) {
                this.configMetaData.delete(databaseName);
                this.saveConfiguration();
            }
        }

        saveDatabase(databaseName) {
            if (!fs.existsSync(this.databaseLocation + databaseName))
                fs.mkdirSync(this.databaseLocation + databaseName);

            if (!this.configMetaData.has(databaseName)) {
                this.configMetaData.set(databaseName, new Set());
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

        saveConfiguration() {
            let metaDataString = serial.ObjectToText(this.configMetaData);
            fs.writeFileSync(this.metaDataLocation, metaDataString, { flag: 'w' }, function (err) {
                if (err)
                    throw new Error("Unable to save database changes to disk");
            });
        }

        


    }
}

