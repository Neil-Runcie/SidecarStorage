const dbc = require('../TextSearchStore');

beforeEach(() => {
    global.gc && global.gc()
})

afterEach(() => {
    global.gc && global.gc()
})


test('Validate trie string insertions', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    let expectation = ["test", "second", "test2"];
    expect(JSON.stringify(trie.getAllStrings())).toEqual(JSON.stringify(expectation));
    expect(trie.getNumberOfStrings()).toBe(3);
});

test('Validate trie contains string', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");
    trie.addString("");

    expect(trie.containsString("test")).toBeTruthy();
    expect(trie.containsString("")).toBeFalsy();

});


test('Validate trie string deletions', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("testing1");
    trie.addString("test2");
    trie.addString("second");
    trie.deleteString("test");


    trie.setMaxDeletionLimit(2, "AMOUNT");
    trie.setMaxNumberOfStrings(5);
    

    trie.addString("test3");
    trie.addString("test4");
    trie.addString("tested2345");

    let expectationAfterDeletion = ["testing1", "test2", "second", "tested2345"];
    expect(JSON.stringify(trie.getAllStrings())).toEqual(JSON.stringify(expectationAfterDeletion)); 
    expect(trie.getNumberOfStrings()).toBe(4);

    trie.changeReadPriority("Shortest");
    trie.setMaxReadLimit(2);
    let readExpectation = ["test2", "testing1"];
    expect(JSON.stringify(trie.getPossibleMatches("t"))).toEqual(JSON.stringify(readExpectation));

    trie.changeDeletionPriority("Longest");
    trie.setMaxNumberOfStrings(3);

    trie.setMaxDeletionLimit(50, "PERCENTAGE");

    trie.addString("test1");

    let expectationAfterDeletion2 = ["test2", "test1"];
    expect(JSON.stringify(trie.getAllStrings())).toEqual(JSON.stringify(expectationAfterDeletion2));
    expect(trie.getNumberOfStrings()).toBe(2);
});


test('Validate trie search suggestions', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    let expectation = ["test2", "test"];
    expect(JSON.stringify(trie.getPossibleMatches("tes"))).toEqual(JSON.stringify(expectation));
    let expectation2 = ["second"];
    expect(JSON.stringify(trie.getPossibleMatches("s"))).toEqual(JSON.stringify(expectation2));

    expect(trie.getNumberOfStrings()).toBe(3);

    trie.deleteString("test");
    let deletionExpectation = ["test2"];
    expect(JSON.stringify(trie.getPossibleMatches("tes"))).toEqual(JSON.stringify(deletionExpectation));

    expect(trie.getNumberOfStrings()).toBe(2);
});


test('Validate empty trie return', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");


    let emptyExpectation = [];
    expect(JSON.stringify(trie.getPossibleMatches("testing"))).toEqual(JSON.stringify(emptyExpectation));
    expect(JSON.stringify(trie.getPossibleMatches(""))).toEqual(JSON.stringify(emptyExpectation));

    expect(trie.getNumberOfStrings()).toBe(3);

});

// Currently acting same as MRU since string addition timestamps are not sensitive enough to decide recency
test('Validate "LRU" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    //trie.descriptorsForDeletion[0].accesses[0] -= 2;
    trie.addString("second");
    //trie.descriptorsForDeletion[1].accesses[0] -= 1;
    trie.addString("test2");
    trie.descriptorsForDeletion[1].accesses[0] += 1;
    trie.descriptorsForDeletion[2].accesses[0] += 2;

    trie.changeDeletionPriority("MRU");

    trie.changeDeletionPriority("LRU");

    expect(trie.containsString("test")).toBeTruthy();
    trie.deleteString("test");
    trie.deleteString("tester");

    expect(trie.containsString("test")).toBeFalsy();
    expect(trie.getNumberOfStrings()).toBe(2);

});

test('Validate "MRU" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");
    trie.descriptorsForDeletion[1].accesses[0] += 1;
    trie.descriptorsForDeletion[2].accesses[0] += 2;

    trie.changeDeletionPriority("MRU");

    expect(trie.containsString("test2")).toBeTruthy();

    trie.setMaxDeletionLimit(1, "AMOUNT");
    trie.deleteStringsBasedOnPriority();

    expect(trie.containsString("test2")).toBeFalsy();
    expect(trie.getNumberOfStrings()).toBe(2);

});

test('Validate "Longest" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeDeletionPriority("Longest");

    expect(trie.containsString("second")).toBeTruthy();

    trie.setMaxDeletionLimit(1, "AMOUNT");
    trie.deleteStringsBasedOnPriority();

    expect(trie.containsString("second")).toBeFalsy();
    expect(trie.getNumberOfStrings()).toBe(2);

});

test('Validate "Shortest" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeDeletionPriority("Shortest");

    expect(trie.containsString("test")).toBeTruthy();

    trie.setMaxDeletionLimit(1, "AMOUNT");
    trie.deleteStringsBasedOnPriority();

    expect(trie.containsString("test")).toBeFalsy();
    expect(trie.getNumberOfStrings()).toBe(2);

});

test('Validate "Lexicographical" deletion', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeDeletionPriority("Lexicographically");

    expect(trie.containsString("test2")).toBeTruthy();

    trie.setMaxDeletionLimit(1, "AMOUNT");
    trie.deleteStringsBasedOnPriority();

    expect(trie.containsString("test2")).toBeFalsy();
    expect(trie.getNumberOfStrings()).toBe(2);

});


test('Validate "LRU" read', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("testing");
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeReadPriority("LRU");

    trie.setMaxReadLimit(2);

    let readExpectation = ["test2", "test"];
    expect(JSON.stringify(trie.getPossibleMatches("tes"))).toEqual(JSON.stringify(readExpectation));

});

// Currently acting same as LRU since string addition timestamps are not sensitive enough to decide recency
test('Validate "MRU" read', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("testing");
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeReadPriority("Shortest");
    trie.changeReadPriority("MRU");
    trie.setMaxReadLimit(2);

    let readExpectation = ["test", "test2"];
    expect(JSON.stringify(trie.getPossibleMatches("tes"))).toEqual(JSON.stringify(readExpectation));

});

test('Validate "Shortest" read', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("testing");
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeReadPriority("Shortest");
    trie.setMaxReadLimit(2);

    let readExpectation = ["test", "test2"];
    expect(JSON.stringify(trie.getPossibleMatches("tes"))).toEqual(JSON.stringify(readExpectation));

});

test('Validate "Longest" read', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("testing");
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeReadPriority("Longest");
    trie.setMaxReadLimit(2);

    let readExpectation = ["testing", "test2"];
    expect(JSON.stringify(trie.getPossibleMatches("test"))).toEqual(JSON.stringify(readExpectation));

});

test('Validate "Lexicographical" read', () => {
    let trie = new dbc.TextSearchStore();
    trie.addString("testing");
    trie.addString("test");
    trie.addString("second");
    trie.addString("test2");

    trie.changeReadPriority("Lexicographically");
    trie.setMaxReadLimit(2);

    let readExpectation = ["testing", "test2"];
    expect(JSON.stringify(trie.getPossibleMatches("test"))).toEqual(JSON.stringify(readExpectation));

});
