const dbc = require('./KeyValueStore.js');

test('Validate key value data insertions', () => {
    let kvs = new dbc.KeyValueStore(["key1", "key2"]);
    let keyObject = { key1: "check", key2: "check2" };

    kvs.add(keyObject, 3);

    expect(kvs.read(keyObject)).toEqual(3);
});

test('Conditional key value data read', () => {
    let kvs = new dbc.KeyValueStore(["key1", "key2"]);
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
});

test('Conditional key value data deletion', () => {
    let kvs = new dbc.KeyValueStore(["key1", "key2"]);
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

});