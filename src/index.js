const express = require('express');
const KVS = require('./KeyValueStore.js');
const TSS = require('./TextSearchStore.js');
const DBM = require('./DatabaseManager.js');
const DBMS = new DBM.DatabaseManager();
const app = express();

app.get('/', (req, res) => {
    /*DBMS.createDatabase("test");
    DBMS.createDatabase("test2");
    let db = DBMS.getDatabase("test");
    db.createKeyValueStore("logged", ["id"]);
    let store = db.getKeyValueStore("logged");
    store.add({ id: "test" }, "data");
    console.log(DBMS.getAllDatabaseNames());
    console.log(db.getAllStoreNames());
    console.log(store.read({ id: "test" }));
    console.log(store.read({ id: "tests" }));

    console.log("\n");
    console.log("Saving");
    console.log("\n");

    DBMS.saveDatabasesToStorage();*/
    DBMS.loadDatabasesFromStorage();
    let db2 = DBMS.getDatabase("test");
    //let store2 = db2.getKeyValueStore("logged");
    console.log(DBMS.getAllDatabaseNames());
    console.log(db2.getAllStoreNames());
    //console.log(store2.read({ id: "test" }));
    //console.log(store2.read({ id: "tests" }));

    /*console.log("\n");
    console.log("ForceLoading");
    console.log("\n");

    DBMS.forceLoadDatabasesFromStorage();
    let db3 = DBMS.getDatabase("test");
    let store3 = db3.getKeyValueStore("logged");
    console.log(DBMS.getAllDatabaseNames());
    console.log(db3.getAllStoreNames());
    console.log(store3.read({ id: "test" }));
    console.log(store3.read({ id: "tests" }));*/


    res.send("success");
})

app.listen(4200);


