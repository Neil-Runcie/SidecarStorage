const db = require('../Database.js');
const serial = require('../ObjectSerializer.js');


test('Validate object to text serialization', () => {
    let testDB = new db.Database("Test");
    testDB.createKeyValueStore("testKVS", ["oneKey"]);
    testDB.createTextSearchStore("testTSS");
    let tss = testDB.getTextSearchStore("testTSS");
    tss.addString("testing");

    // The above data contains es6 maps and sets which cannot be mapped by JSON.stringify.
    // The serial library should have the extra data with text markers "Map" and "Set"
    expect(serial.ObjectToText(testDB).length).toBeGreaterThan(JSON.stringify(testDB).length);
    expect(serial.ObjectToText(testDB).includes("Map")).toBeTruthy();
    expect(serial.ObjectToText(testDB).includes("Set")).toBeTruthy();
});

test('Validate text to object deserialization', () => {
    let testDB = new db.Database("Test");
    testDB.createKeyValueStore("testKVS", ["oneKey"]);
    testDB.createTextSearchStore("testTSS");
    let tss = testDB.getTextSearchStore("testTSS");
    tss.addString("testing");
    
    let afterDeserializationDB = Object.assign(new db.Database(""), serial.TextToObject(serial.ObjectToText(testDB)));

    expect(serial.ObjectToText(testDB)).toEqual(serial.ObjectToText(afterDeserializationDB));
    expect(afterDeserializationDB instanceof db.Database).toBeTruthy();
    
});