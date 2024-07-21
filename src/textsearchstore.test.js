const dbc = require('./TextSearchStore');

test('Validate trie string insertions', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    let expectation = ["test", "second", "test2"];
    expect(JSON.stringify(trie.getAllStrings())).toEqual(JSON.stringify(expectation));
    expect(trie.numberOfStrings).toBe(3);
    expect(trie.stringDescriptors.length).toBe(3);
});

test('Validate trie string deletions', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");
    trie.deleteString("test");

    let expectation = ["second", "test2"];
    expect(JSON.stringify(trie.getAllStrings())).toEqual(JSON.stringify(expectation));
    expect(trie.numberOfStrings).toBe(2);
});

test('Validate trie search suggestions', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    let expectation = ["test", "test2"];
    expect(JSON.stringify(trie.getPossibleMatches("tes"))).toEqual(JSON.stringify(expectation));
    let expectation2 = ["second"];
    expect(JSON.stringify(trie.getPossibleMatches("s"))).toEqual(JSON.stringify(expectation2));

    expect(trie.numberOfStrings).toBe(3);

    trie.deleteString("test");
    let deletionExpectation = ["test2"];
    expect(JSON.stringify(trie.getPossibleMatches("tes"))).toEqual(JSON.stringify(deletionExpectation));

    expect(trie.numberOfStrings).toBe(2);
});


test('Validate empty trie return', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");


    let emptyExpectation = [];
    expect(JSON.stringify(trie.getPossibleMatches("testing"))).toEqual(JSON.stringify(emptyExpectation));
    expect(JSON.stringify(trie.getPossibleMatches(""))).toEqual(JSON.stringify(emptyExpectation));

    expect(trie.numberOfStrings).toBe(3);

});

// Currently acting same as MRU since string addition timestamps are not sensitive enough to decide recency
test('Validate "LRU" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");
    trie.stringDescriptors[1].accesses[0] += 1;
    trie.stringDescriptors[2].accesses[0] += 2;

    trie.changeDeletionPriority("MRU");

    trie.changeDeletionPriority("LRU");

    expect(trie.containsString("test")).toBeTruthy();
    trie.deleteStringsBasedOnPriority(1);


    expect(trie.containsString("test")).toBeFalsy();
    expect(trie.numberOfStrings).toBe(2);

});

test('Validate "MRU" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");
    trie.stringDescriptors[1].accesses[0] += 1;
    trie.stringDescriptors[2].accesses[0] += 2;

    trie.changeDeletionPriority("MRU");

    expect(trie.containsString("test2")).toBeTruthy();

    trie.deleteStringsBasedOnPriority(1);

    expect(trie.containsString("test2")).toBeFalsy();
    expect(trie.numberOfStrings).toBe(2);

});

test('Validate "Longest" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeDeletionPriority("Longest");

    expect(trie.containsString("second")).toBeTruthy();

    trie.deleteStringsBasedOnPriority(1);

    expect(trie.containsString("second")).toBeFalsy();
    expect(trie.numberOfStrings).toBe(2);

});

test('Validate "Shortest" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeDeletionPriority("Shortest");

    expect(trie.containsString("test")).toBeTruthy();

    trie.deleteStringsBasedOnPriority(1);

    expect(trie.containsString("test")).toBeFalsy();
    expect(trie.numberOfStrings).toBe(2);

});

test('Validate "Lexicographical" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeDeletionPriority("Lexicographically");

    expect(trie.containsString("test2")).toBeTruthy();

    trie.deleteStringsBasedOnPriority(1);

    expect(trie.containsString("test2")).toBeFalsy();
    expect(trie.numberOfStrings).toBe(2);

});