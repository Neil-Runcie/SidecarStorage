const DBM = require('./DatabaseManager.js');
const fs = require('fs');
var DBMS;

beforeEach(() => {
    DBMS = new DBM.DatabaseManager();
});

afterEach(() => {
    if (DBMS.savingAndLoadingIsEnabled())
        DBMS.deleteAllStoredData();
    DBMS.clearInstance();
    DBMS = undefined;
});

test('Validate inability to affect storage when saving and loading is not enabled', () => {
    DBMS.createDatabase("test");
    let db = DBMS.getDatabase("test");
    db.createKeyValueStore("logged", ["id"]);
    let store = db.getKeyValueStore("logged");
    store.add({ id: "test" }, "data");

    expect(() => DBMS.saveDatabasesToStorage()).toThrow(new Error("Saving and loading has not been enabled"));

    let storageLocation = __dirname + "\\StorageSpace";
    expect(fs.existsSync(storageLocation)).toBeFalsy();
});
 

test('Validate reads after save and restore', () => {
    DBMS.createDatabase("test");
    let db = DBMS.getDatabase("test");
    db.createKeyValueStore("logged", ["id"]);
    db.createTextSearchStore("textlog");
    let store = db.getKeyValueStore("logged");
    store.add({ id: "test" }, "data");
    let TSStore = db.getTextSearchStore("textlog");
    TSStore.addString("testingdata");

    let DBNameExpectation = ["test"];
    expect(JSON.stringify(DBMS.getAllDatabaseNames())).toEqual(JSON.stringify(DBNameExpectation));
    let storeNameExpectation = ["logged", "textlog"];
    expect(JSON.stringify(db.getAllStoreNames())).toEqual(JSON.stringify(storeNameExpectation));
    let valueExpectation = ["data"];
    expect(JSON.stringify(store.readAll())).toEqual(JSON.stringify(valueExpectation));
    let valueTSExpectation = ["testingdata"];
    expect(JSON.stringify(TSStore.getAllStrings())).toEqual(JSON.stringify(valueTSExpectation));

    DBMS.enableSavingAndLoading();
    DBMS.saveDatabasesToStorage();
    let storageLocation = __dirname + "\\StorageSpace";
    expect(fs.existsSync(storageLocation)).toBeTruthy();

    expect(DBMS.loadDatabasesFromStorage()).toBeFalsy();
    DBMS.forceLoadDatabasesFromStorage();

    let dbAfterReload = DBMS.getDatabase("test");
    let storeAfterReload = db.getKeyValueStore("logged");
    let TSStoreAfterReload = db.getTextSearchStore("textlog");
    expect(JSON.stringify(DBMS.getAllDatabaseNames())).toEqual(JSON.stringify(DBNameExpectation));
    expect(JSON.stringify(dbAfterReload.getAllStoreNames())).toEqual(JSON.stringify(storeNameExpectation));
    expect(JSON.stringify(storeAfterReload.readAll())).toEqual(JSON.stringify(valueExpectation));
    expect(JSON.stringify(TSStoreAfterReload.getAllStrings())).toEqual(JSON.stringify(valueTSExpectation));
});