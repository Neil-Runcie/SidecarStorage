const dbs = require('./DatabaseManager.js');
const db = require('./Database.js');
let DBMS;

beforeEach(() => {
    DBMS = new dbs.DatabaseManager();
});

afterEach(() => {
    if (DBMS.savingAndLoadingIsEnabled())
        DBMS.clearAllStoredData();
    DBMS.clearInstance();
    DBMS = undefined;
});

test('Invalid Database Manager handling', () => {
    DBMS.createDatabase("Test");

    expect(() => DBMS.createDatabase("")).toThrow(new TypeError("The createDatabase function expects a non-empty string as the parameter"));
    expect(() => DBMS.createDatabase(false)).toThrow(new TypeError("The createDatabase function expects a non-empty string as the parameter"));
    expect(() => DBMS.createDatabase()).toThrow(new TypeError("The createDatabase function expects a non-empty string as the parameter"));
    expect(() => DBMS.createDatabase("Test")).toThrow(new Error("A database with this name has already been created in this database"));

    expect(() => DBMS.getDatabase("")).toThrow(new TypeError("The getDatabase function expects a non-empty string as the parameter"));
    expect(() => DBMS.getDatabase(false)).toThrow(new TypeError("The getDatabase function expects a non-empty string as the parameter"));
    expect(() => DBMS.getDatabase()).toThrow(new TypeError("The getDatabase function expects a non-empty string as the parameter"));

    expect(() => DBMS.deleteDatabase("")).toThrow(new TypeError("The deleteDatabase function expects a non-empty string as the parameter"));
    expect(() => DBMS.deleteDatabase(false)).toThrow(new TypeError("The deleteDatabase function expects a non-empty string as the parameter"));
    expect(() => DBMS.deleteDatabase()).toThrow(new TypeError("The deleteDatabase function expects a non-empty string as the parameter"));

    let comparison = new db.Database("Test");
    expect(JSON.stringify(DBMS.getDatabase("Test"))).toEqual(JSON.stringify(comparison));
});

test('Validate database creation', () => {
    DBMS.createDatabase("Test2");

    let allDBExpectation = ["Test2"];
    expect(JSON.stringify(DBMS.getAllDatabaseNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate database deletion', () => {
    DBMS.createDatabase("Test3");
    let db2 = DBMS.createDatabase("Test4");
    db2.createTextSearchStore("Test4");
    DBMS.createDatabase("Test5");
    DBMS.deleteDatabase("Test4");

    let allDBExpectation = ["Test3", "Test5"];
    expect(JSON.stringify(DBMS.getAllDatabaseNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate database retrieval', () => {
    DBMS.createDatabase("Test6");

    let comparison = new db.Database("Test6");
    expect(JSON.stringify(DBMS.getDatabase("Test6"))).toEqual(JSON.stringify(comparison));
});