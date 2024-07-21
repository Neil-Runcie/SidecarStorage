
var allowedPriorities = ["MRU", "LRU", "Shortest", "Longest", "Lexicographically"]

module.exports = {
    TextSearchStore: class TextSearchStore {

        constructor() {
            this.root = new TrieNode();

            this.readPriority = "MRU";
            this.maxReadLimit = Number.MAX_SAFE_INTEGER;

            this.stringDescriptors = [];
            this.deletionPriority = "LRU";
            this.deletionComparison = LRUComparison;

            this.numberOfStrings = 0;
            this.maxStrings = Number.MAX_SAFE_INTEGER;
            
            this.modifiedSinceLastSave = true;
            this.toBeSaved = true;
        }

        addString(stringToBeAdded) {
            if ((typeof stringToBeAdded) != "string")
                return;
            if (stringToBeAdded == "")
                return;

            EnsureStringOnlyContainsValidChars(stringToBeAdded);
            
            
            // If string already exists in this object
            if (this.root.potentialMatches.has(stringToBeAdded)) {
                UpdateStringAccessTime(stringToBeAdded, this.stringDescriptors);
                if (this.deletionPriority == "LRU" || this.deletionPriority == "MRU")
                    SortStringDescriptors(this.stringDescriptors, this.deletionComparison);
                        
                return;
            }


            // If string does not already exists in this object
            if (this.numberOfStrings >= this.maxStrings) {
                deleteStringsBasedOnPriority(1);
            }
            this.numberOfStrings++;


            // traverse tree and update potentialMatch string arrays
            let nodeTraverser = this.root;

            let currentIndex = 0;
            while (currentIndex < characters.length) {

                if (nodeTraverser.characters.has(characters[currentIndex])) {
                    nodeTraverser.potentialMatches.add(stringToBeAdded);
                    nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);
                }
                else {
                    nodeTraverser.potentialMatches.add(stringToBeAdded);
                    nodeTraverser.characters.set(characters[currentIndex], new TrieNode());
                    nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);
                }
                currentIndex++;

            }
            nodeTraverser.EndOfWord = true;


            let stringDescriptorToBeAdded = new StringDescriptor(stringToBeAdded);
            AddDescriptorByDeletionPriority(stringDescriptorToBeAdded, this.stringDescriptors, this.deletionComparison);
        }


        containsString(stringToLookFor) {
            if ((typeof stringToLookFor) != "string")
                return false;

            return this.root.potentialMatches.has(stringToLookFor);
        }


        deleteStringsBasedOnPriority(numberOfStringsToDelete) {
            if ((typeof numberOfStringsToDelete) != "number")
                return;

            if (numberOfStringsToDelete > this.stringDescriptors.length)
                numberOfStringsToDelete = this.stringDescriptors.length;

            for (let i = 0; i < numberOfStringsToDelete; i++) {
                const stringDescriptor = this.stringDescriptors.pop();
                this.deleteString(stringDescriptor.string);
            }
        }


        deleteString(stringToBeDeleted) {
            if (!this.root.potentialMatches.has(stringToBeDeleted))
                return;
            if (stringToBeDeleted == "")
                return;

            let nodeTraverser = this.root;
            let characters = stringToBeDeleted.split('');
            let currentIndex = 0;

            while (currentIndex < characters.length) {
                nodeTraverser.potentialMatches.delete(stringToBeDeleted);
                if (nodeTraverser.potentialMatches.size == 1) {
                    nodeTraverser.potentialMatches.delete(characters[currentIndex]);
                }

                nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);
                if (currentIndex == characters.length - 1)
                    nodeTraverser.EndOfWord = false;

                currentIndex++;
            }

            this.numberOfStrings--;

        }

        getPossibleMatches(prefixString) {
            if (prefixString == "")
                return [];

            let nodeTraverser = this.root;
            let characters = prefixString.split('');
            let currentIndex = 0;

            while (nodeTraverser != null && nodeTraverser != undefined && currentIndex < characters.length) {
                nodeTraverser = nodeTraverser.characters.get(characters[currentIndex++]);
            }

            if (nodeTraverser == null)
                return [];

            if (nodeTraverser.potentialMatches.length < this.maxReadLimit)
                return Array.from(nodeTraverser.potentialMatches);
            else
                return Array.from(nodeTraverser.potentialMatches).slice(0, this.maxReadLimit);
        }

        setMaxReadLimit(newLimit) {
            if ((typeof numberOfStringsToDelete) != "number")
                return;
            if (newLimit < 1 || newLimit > Number.MAX_SAFE_INTEGER)
                return;

            this.maxReadLimit = newLimit;
        }

        getAllStrings() {
            return Array.from(this.root.potentialMatches);
        }

        changeDeletionPriority(deletionPriority) {
            if (typeof deletionPriority != "string" || !this.AllowedDeletionPriorities.includes(deletionPriority)) {
                deletionPriority = "LRU";
            }

            if (this.deletionPriority != deletionPriority) {
                this.deletionPriority = deletionPriority;
                if (this.deletionPriority == "LRU") {
                    this.deletionComparison = LRUComparison;
                }
                if (this.deletionPriority == "MRU") {
                    this.deletionComparison = MRUComparison;
                }
                if (this.deletionPriority == "Shortest") {
                    this.deletionComparison = ShortestComparison;
                }
                if (this.deletionPriority == "Longest") {
                    this.deletionComparison = LongestComparison;
                }
                if (this.deletionPriority == "Lexicographically") {
                    this.deletionComparison = LexicalComparison;
                }
                SortStringDescriptors(this.stringDescriptors, this.deletionComparison);
            }
        }


        isToBeSaved() {
            return (this.toBeSaved && this.modifiedSinceLastSave);
        }
    }
}

class TrieNode {

    constructor() {
        this.characters = new Map();
        this.potentialMatches = new Set();
        //this.accesses = [];
        this.EndOfWord = false;
    }
}

class StringDescriptor {

    constructor(newString) {
        this.string = newString;
        this.accesses = []; 
        this.accesses.push(Date.now());
    }

    // Add functions for manipulating data in this class?
}

function SortStringDescriptors(descriptors, comparator) {
    descriptors.sort(comparator);
}

function LRUComparison(a, b) {
    if (a.accesses[a.accesses.length - 1] > b.accesses[b.accesses.length - 1]) {
        return -1;
    }
    else if (a.accesses[a.accesses.length - 1] < b.accesses[b.accesses.length - 1]) {
        return 1;
    }
    return 0;
}

function MRUComparison(a,b) {
    if (a.accesses[a.accesses.length - 1] < b.accesses[b.accesses.length - 1]) {
        return -1;
    }
    else if (a.accesses[a.accesses.length - 1] > b.accesses[b.accesses.length - 1]) {
        return 1;
    }
    return 0;
}

function ShortestComparison(a, b) {
    return b.string.length - a.string.length;
}

function LongestComparison(a, b) {
    return a.string.length - b.string.length;
}

function LexicalComparison(a, b) {
    if (a.string < b.string) {
        return -1;
    }
    else if (a.string > b.string) {
        return 1;
    }
    return 0;
}

function FirstIsLessThanSecond(num) {
    if (num <= 0)
        return true;
    return false;
}

function AddDescriptorByDeletionPriority(newStringDescriptor, descriptors, comparator) {
    if (descriptors.length == 0) {
        descriptors.push(newStringDescriptor);
        return;
    }
    
    const lastDescriptor = descriptors[descriptors.length - 1];
    if (FirstIsLessThanSecond(comparator(lastDescriptor, newStringDescriptor))) {
        descriptors.push(newStringDescriptor);
        return;
    }

    for (let ind = 0; ind < descriptors.length; ind++) {
        if (FirstIsLessThanSecond(comparator(newStringDescriptor, descriptors[ind]))) {
            descriptors.splice(ind, 0, newStringDescriptor);
        }
    }
}


////////// TextSearchStore class private functions

function EnsureStringOnlyContainsValidChars(stringToValidate) {
    let characters = stringToValidate.split('');
    for (let ch of characters) {
        if (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 126) {
            throw new Error("Only ASCII characters with values between 32 and 126 are allowed");
        }
    }
}

function UpdateStringAccessTime(stringToFind, descriptors) {
    for (let stringDescriptor of descriptors) {
        if (stringToFind == stringDescriptor.string) {
            stringDescriptor.accesses.push(Date.now());
            break;
        }
    }
}