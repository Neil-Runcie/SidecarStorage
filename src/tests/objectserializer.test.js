import { Database } from '../Database.js';
import { ObjectToText, TextToObject } from '../ObjectSerializer.js';


test('Validate object to text serialization', () => {
    let testDB = new Database("Test");
    testDB.createKeyValueStore("testKVS", ["oneKey"]);
    testDB.createTextSearchStore("testTSS");
    let tss = testDB.getTextSearchStore("testTSS");
    tss.addString("testing");

    // The above data contains es6 maps and sets which cannot be mapped by JSON.stringify.
    // The serial library should have the extra data with text markers "Map" and "Set"
    expect(ObjectToText(testDB).length).toBeGreaterThan(JSON.stringify(testDB).length);
    expect(ObjectToText(testDB).includes("Map")).toBeTruthy();
    expect(ObjectToText(testDB).includes("Set")).toBeTruthy();
});

test('Validate text to object deserialization', () => {
    let testDB = new Database("Test");
    testDB.createKeyValueStore("testKVS", ["oneKey"]);
    testDB.createTextSearchStore("testTSS");
    let tss = testDB.getTextSearchStore("testTSS");
    tss.addString("testing");
    
    let afterDeserializationDB = Object.assign(new Database(""), TextToObject(ObjectToText(testDB)));

    expect(ObjectToText(testDB)).toEqual(ObjectToText(afterDeserializationDB));
    expect(afterDeserializationDB instanceof Database).toBeTruthy();
    
});