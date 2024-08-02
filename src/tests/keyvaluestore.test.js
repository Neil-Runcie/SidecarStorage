import { KeyValueStore } from '../KeyValueStore.js';


test('Invalid KeyValueStore initialization key value data insertions', () => {
    expect(() => new KeyValueStore({ key: "key1" })).toThrow(new Error("Invalid keys were provided. Expected array of non-empty strings"));
    expect(() => new KeyValueStore("theKey")).toThrow(new Error("Invalid keys were provided. Expected array of non-empty strings"));
    expect(() => new KeyValueStore([ "key1", "", "key2" ])).toThrow(new Error("Invalid keys were provided. Expected array of non-empty strings"));
});

test('Validate key value data insertions', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject = { key1: "check", key2: "check2" };
    let keyObject2 = { key1: "check", key2: "check3" };

    kvs.add(keyObject, 3);
    expect(kvs.read(keyObject)).toEqual(3);

    kvs.add(keyObject, 5);
    expect(kvs.read(keyObject)).toEqual(3);

    kvs.addOrUpdate(keyObject2, "testing");
    expect(kvs.read(keyObject2)).toEqual("testing");

    let valueExpectation = [3, "testing"];
    expect(JSON.stringify(kvs.readAll())).toEqual(JSON.stringify(valueExpectation));
    expect(kvs.getNumberOfEntries()).toEqual(2);
});

test('Invalid key value data insertions', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject = { key1: "check", key2: "check2" };
    let keyObjectArr = ["check", "check2"];
    let keyObjectEmpty = { key1: "check", key2: "" };

    expect(() => kvs.add()).toThrow(new TypeError("The add function does not accept undefined data"));
    expect(() => kvs.add(keyObject)).toThrow(new TypeError("The add function does not accept undefined data"));
    expect(() => kvs.add(keyObjectArr, 3)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));
    expect(() => kvs.read(keyObjectArr)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));

    expect(() => kvs.add(keyObjectEmpty, 3)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));
    expect(() => kvs.read(keyObjectEmpty)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));

});


test('Validate key value data updates', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject = { key1: "check", key2: "check2" };

    kvs.update(keyObject, 3);
    expect(kvs.read(keyObject)).toEqual(undefined);

    kvs.add(keyObject, 3);
    expect(kvs.read(keyObject)).toEqual(3);

    kvs.addOrUpdate(keyObject, "testing");
    expect(kvs.read(keyObject)).toEqual("testing");

    let valueExpectation = [ "testing" ];
    expect(JSON.stringify(kvs.readAll())).toEqual(JSON.stringify(valueExpectation));
    expect(kvs.getNumberOfEntries()).toEqual(1);
});

test('Invalid key value data updates', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject = { key1: "check", key2: "check2" };
    let keyObjectArr = ["check", "check2"];
    let keyObjectEmpty = { key1: "check", key2: "" };

    expect(() => kvs.update()).toThrow(new TypeError("The update function does not accept undefined data"));
    expect(() => kvs.update(keyObject)).toThrow(new TypeError("The update function does not accept undefined data"));
    expect(() => kvs.update(keyObjectArr, 3)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));
    expect(() => kvs.read(keyObjectArr)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));

    kvs.add(keyObject, 3);

    
    expect(() => kvs.addOrUpdate()).toThrow(new TypeError("The addOrUpdate function does not accept undefined data"));
    expect(() => kvs.addOrUpdate(keyObject)).toThrow(new TypeError("The addOrUpdate function does not accept undefined data"));
    expect(() => kvs.addOrUpdate(keyObjectEmpty, 5)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));
    expect(() => kvs.read(keyObjectEmpty)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));


    let valueExpectation = [ 3 ];
    expect(JSON.stringify(kvs.readAll())).toEqual(JSON.stringify(valueExpectation));
    expect(kvs.getNumberOfEntries()).toEqual(1);

});


test('Validate key value data deletions', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject = { key1: "check", key2: "check2" };
    let keyObject2 = { key1: "check", key2: "check3" };

    kvs.add(keyObject, 3);
    kvs.addOrUpdate(keyObject2, "testing");
    kvs.delete(keyObject);
    kvs.delete(keyObject2);

    let emptyValueExpectation = [];
    expect(JSON.stringify(kvs.readAll())).toEqual(JSON.stringify(emptyValueExpectation));
    expect(kvs.getNumberOfEntries()).toEqual(0);
});

test('Invalid key value data deletions', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject = { key1: "check", key2: "check2" };
    let keyObject2 = { key1: "check", key2: "check3" };
    let keyObjectArr = ["check", "check2"];
    let keyObjectEmpty = { key1: "check", key2: "" };

    kvs.add(keyObject, 3);
    kvs.addOrUpdate(keyObject2, "testing");

    expect(() => kvs.delete()).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));
    expect(() => kvs.delete(keyObjectArr)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));
    expect(() => kvs.delete(keyObjectEmpty)).toThrow(new Error("The provided keys are not valid for this KeyValueStore object"));


    let valueExpectation = [3, "testing"];
    expect(JSON.stringify(kvs.readAll())).toEqual(JSON.stringify(valueExpectation));
    expect(kvs.getNumberOfEntries()).toEqual(2);

});

test('Conditional key value data read', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject1 = { key1: "check", key2: "check2" };
    let dataObject1 = { test: 'x' };
    let keyObject2 = { key1: "check2", key2: "check3" };
    let dataObject2 = { test: 'y' };

    kvs.add(keyObject1, dataObject1);
    kvs.add(keyObject2, dataObject2);
    var searchFunction = function (data) {
        if (data.test == 'x') {
            return true;
        }
    }

    let expectation = [dataObject1];
    expect(JSON.stringify(kvs.conditionalRead(searchFunction))).toEqual(JSON.stringify(expectation));
    expect(kvs.getNumberOfEntries()).toEqual(2);
});

test('Conditional key value data deletion', () => {
    let kvs = new KeyValueStore(["key1", "key2"]);
    let keyObject1 = { key1: "check", key2: "check2" };
    let dataObject1 = { test: 'x' };
    let keyObject2 = { key1: "check2", key2: "check3" };
    let dataObject2 = { test: 'y' };

    kvs.add(keyObject1, dataObject1);
    kvs.add(keyObject2, dataObject2);
    var searchFunction = function (data) {
        if (data.test == 'x') {
            return true;
        }
    }

    const expectation = [dataObject1];
    const emptyExpectation = [];
    expect(JSON.stringify(kvs.conditionalRead(searchFunction))).toEqual(JSON.stringify(expectation));
    kvs.conditionalDelete(searchFunction);
    expect(JSON.stringify(kvs.conditionalRead(searchFunction))).toEqual(JSON.stringify(emptyExpectation));
    expect(kvs.getNumberOfEntries()).toEqual(1);

});

afterAll(() => {
    global.gc && global.gc()
})