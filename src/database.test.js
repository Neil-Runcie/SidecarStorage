const db = require('./Database.js');

test('Validate KeyValueStore creation', () => {
    let testDB = new db.Database("Test");
    testDB.createKeyValueStore("testKVS");

    let allDBExpectation = ["testKVS"];
    expect(JSON.stringify(testDB.getKeyValueStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate TextSearchStore creation', () => {
    let testDB = new db.Database("Test");
    testDB.createTextSearchStore("testTSS");

    let allDBExpectation = ["testTSS"];
    expect(JSON.stringify(testDB.getTextSearchStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate store name retrieval', () => {
    let testDB = new db.Database("Test");
    testDB.createKeyValueStore("testKVS");
    testDB.createTextSearchStore("testTSS");

    let allDBExpectation = ["testKVS", "testTSS"];
    expect(JSON.stringify(testDB.getAllStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});