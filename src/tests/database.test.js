import { Database } from '../Database.js';

test('Validate KeyValueStore creation', () => {
    let testDB = new Database("Test");
    testDB.createKeyValueStore("testKVS", ["test"]);
    testDB.createKeyValueStore("testKVS2", ["test","test2", "three"]);

    let allDBExpectation = ["testKVS", "testKVS2"];
    expect(JSON.stringify(testDB.getKeyValueStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Invalid KeyValueStore handling', () => {
    let testDB = new Database("Test");
    testDB.createKeyValueStore("testKVS", ["test"]);

    expect(() => testDB.createKeyValueStore("testKVS", ["test", "test2", "three"])).toThrow(new Error("A Key Value Store with this name has already been created in this database"));
    expect(() => testDB.createKeyValueStore()).toThrow(new TypeError("The createKeyValueStore function expects a non-empty string as the first parameter"));
    expect(() => testDB.createKeyValueStore("testKVS2")).toThrow();
    expect(() => testDB.createKeyValueStore("testKVS3", "test")).toThrow();

    expect(() => testDB.getKeyValueStore("")).toThrow(new TypeError("The getKeyValueStore function expects a non-empty string as the parameter"));
    expect(() => testDB.getKeyValueStore(false)).toThrow(new TypeError("The getKeyValueStore function expects a non-empty string as the parameter"));

    expect(() => testDB.deleteKeyValueStore("")).toThrow(new TypeError("The deleteKeyValueStore function expects a non-empty string as the parameter"));
    expect(() => testDB.deleteKeyValueStore(false)).toThrow(new TypeError("The deleteKeyValueStore function expects a non-empty string as the parameter"));

    let allDBExpectation = ["testKVS"];
    expect(JSON.stringify(testDB.getKeyValueStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate TextSearchStore creation', () => {
    let testDB = new Database("Test");
    testDB.createTextSearchStore("testTSS");
    testDB.createTextSearchStore("testTSS2");

    let allDBExpectation = ["testTSS", "testTSS2"];
    expect(JSON.stringify(testDB.getTextSearchStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Invalid TextSearchStore handling', () => {
    let testDB = new Database("Test");
    testDB.createTextSearchStore("testTSS");

    expect(() => testDB.createTextSearchStore("testTSS")).toThrow(new Error("A Text Search Store with this name has already been created in this database"));
    expect(() => testDB.createTextSearchStore()).toThrow(new TypeError("The createTextSearchStore function expects a non-empty string as the parameter"));

    expect(() => testDB.getTextSearchStore("")).toThrow(new TypeError("The getTextSearchStore function expects a non-empty string as the parameter"));
    expect(() => testDB.getTextSearchStore(false)).toThrow(new TypeError("The getTextSearchStore function expects a non-empty string as the parameter"));

    expect(() => testDB.deleteTextSearchStore("")).toThrow(new TypeError("The deleteTextSearchStore function expects a non-empty string as the parameter"));
    expect(() => testDB.deleteTextSearchStore(false)).toThrow(new TypeError("The deleteTextSearchStore function expects a non-empty string as the parameter"));

    let allDBExpectation = ["testTSS"];
    expect(JSON.stringify(testDB.getTextSearchStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate store name retrieval', () => {
    let testDB = new Database("Test");
    testDB.createKeyValueStore("testKVS", ["test"]);
    testDB.createTextSearchStore("testTSS");

    let allDBExpectation = ["testKVS", "testTSS"];
    expect(JSON.stringify(testDB.getAllStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate save logic', () => {
    let testDB = new Database("Test");
    testDB.createKeyValueStore("testKVS", ["test"]);
    testDB.createTextSearchStore("testTSS");

    expect(testDB.needsToBeSaved()).toBeTruthy();
    testDB.setSaveStatus(false);
    expect(testDB.needsToBeSaved()).toBeFalsy();

    expect(() => testDB.setSaveStatus("false")).toThrow(new TypeError("The setSaveStatus function expects a boolean value as the parameter"));
    expect(() => testDB.setSaveStatus()).toThrow(new TypeError("The setSaveStatus function expects a boolean value as the parameter"));

    let allDBExpectation = ["testKVS", "testTSS"];
    expect(JSON.stringify(testDB.getAllStoreNames())).toEqual(JSON.stringify(allDBExpectation));
});