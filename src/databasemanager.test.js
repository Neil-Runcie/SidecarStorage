const dbs = require('./DatabaseManager.js');
const db = require('./Database.js');
const dbms = new dbs.DatabaseManager();

test('Validate database creation', () => {
    dbms.createDatabase("Test");

    let allDBExpectation = ["Test"];
    expect(JSON.stringify(dbms.getAllDatabaseNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate database deletion', () => {
    dbms.createDatabase("Test");
    dbms.deleteDatabase("Test");

    let allDBExpectation = [];
    expect(JSON.stringify(dbms.getAllDatabaseNames())).toEqual(JSON.stringify(allDBExpectation));
});

test('Validate database retrieval', () => {
    dbms.createDatabase("Test");

    let comparison = new db.Database("Test");
    expect(JSON.stringify(dbms.getDatabase("Test"))).toEqual(JSON.stringify(comparison));
});