Object.defineProperty(exports, "__esModule", {
    value: true
});

const DBMS = require('./DatabaseManager.js');
const KVS = require('./KeyValueStore.js');
const TSS = require('./TextSearchStore.js');

exports.DBMS = DBMS;
exports.keyValueStore = KVS;
exports.textSearchStore = TSS;
