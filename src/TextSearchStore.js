
var allowedPriorities = ["MRU", "LRU", "Shortest", "Longest", "Lexicographically"];
// var allowedMethods = ["AMOUNT", "PERCENTAGE"];

export class TextSearchStore {

    constructor() {
        this.root = new TrieNode();

        // The comparison function used to sort descriptorsForReading in the TrieNode object
        this.readComparison = MRUComparison;
        this.maxReadLimit = Number.MAX_SAFE_INTEGER;
        this.readMethod = "AMOUNT";

        // The comparison function used to sort descriptorsForDeletion array member variable
        this.descriptorsForDeletion = [];
        this.deletionComparison = LRUComparison;
        this.maxDeletionLimit = 100;
        this.deletionMethod = "AMOUNT";

        this.maxStrings = Number.MAX_SAFE_INTEGER;
            
    }

    // Adds a string to the trie like data structure if it is a nonempty string
    // If the string can be added then it will return true otherwise it returns false
    addString(stringToBeAdded) {
        if ((typeof stringToBeAdded) != "string")
            throw new TypeError("The addString function can only accept strings as parameters");
        if (stringToBeAdded == "")
            return false;
        // Instead of returning could set end of word to true for root and add to read descriptors

        EnsureStringOnlyContainsValidChars(stringToBeAdded);
            
            
        // If string already exists in this object, update and sort descriptors for quick deletions
        // return true to show succesful update
        if (this.containsString(stringToBeAdded)) {
            UpdateStringAccessTime(stringToBeAdded, this.descriptorsForDeletion);
            if (this.deletionMethod == LRUComparison || this.deletionMethod == MRUComparison)
                SortStringDescriptors(this.descriptorsForDeletion, this.deletionComparison);
        }
        else { // If string does not already exists in this object
                
            if (this.descriptorsForDeletion.length >= this.maxStrings) {
                this.deleteStringsBasedOnPriority();
            }

            let stringDescriptorToBeAdded = new StringDescriptor(stringToBeAdded);
            let characters = stringToBeAdded.split('');

            // traverse trie and update descriptorsForReading arrays for quick reads in each node in the path of the newly added string
            let nodeTraverser = this.root;
            let currentIndex = 0;

            while (currentIndex < characters.length) {

                if (nodeTraverser.characters.has(characters[currentIndex])) {
                    AddDescriptorByPriority(stringDescriptorToBeAdded, nodeTraverser.descriptorsForReading, this.readComparison);
                    nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);
                }
                else {
                    AddDescriptorByPriority(stringDescriptorToBeAdded, nodeTraverser.descriptorsForReading, this.readComparison);
                    nodeTraverser.characters.set(characters[currentIndex], new TrieNode());
                    nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);
                }
                currentIndex++;

            }
            nodeTraverser.EndOfWord = true;

            // Add descriptor to descriptorsForDeletion array for quick deletion
            AddDescriptorByPriority(stringDescriptorToBeAdded, this.descriptorsForDeletion, this.deletionComparison);
        }

        return true;

    }

    // Adds a string to the trie like data structure if it is a nonempty string
    // If the non-empty string can found then it will return true otherwise it returns false
    containsString(stringToLookFor) {
        if ((typeof stringToLookFor) != "string")
            throw new TypeError("The containsString function can only accept strings as parameters");
        if (stringToLookFor == "")
            return false;

        // Traverse the trie and see if the string characters are present
        let nodeTraverser = this.root;
        let characters = stringToLookFor.split('');
        let currentIndex = 0;
        while (currentIndex < characters.length) {
            if (nodeTraverser.characters.has(characters[currentIndex])) {
                nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);
            }
            else { // if one of the expected characters is not present immediately return false
                return false;
            }
            currentIndex++;
        }

        if (nodeTraverser.EndOfWord == true)
            return true;

        return false;
    }

    // deleteStringsBasedOnPriority calculates the number of strings to be deleted based on priority and deletes each one
    deleteStringsBasedOnPriority() {
        while (this.descriptorsForDeletion.length > this.maxStrings) {
            const stringDescriptor = this.descriptorsForDeletion[this.descriptorsForDeletion.length-1];
            this.deleteString(stringDescriptor.string);
        }

        let numberOfStringsToDelete = getNumberOfStringsToDelete(this.descriptorsForDeletion, this.maxDeletionLimit, this.deletionMethod);

        for (let i = 0; i < numberOfStringsToDelete; i++) {
            const stringDescriptor = this.descriptorsForDeletion[this.descriptorsForDeletion.length - 1];
            this.deleteString(stringDescriptor.string);
        }
    }

        
    // deleteString takes a nonempty string and deletes it if it is present in the trie structure
    // If the non-empty string is deleted then it will return true otherwise it returns false
    deleteString(stringToBeDeleted) {
        if ((typeof stringToBeDeleted) != "string")
            throw new TypeError("The deleteString function can only accept strings as parameters");
        if (!this.containsString(stringToBeDeleted))
            return false;
        if (stringToBeDeleted == "")
            return false;

        for (let i = this.descriptorsForDeletion.length - 1; i < this.descriptorsForDeletion.length; i--) {
            if (this.descriptorsForDeletion[i].string == stringToBeDeleted) {
                this.descriptorsForDeletion.splice(i, 1);
                break;
            }
        }
        // Traverse through the trie and remove the string from every descriptorsForReading array in nodes in the path of the provided stringToBeDeleted
        let nodeTraverser = this.root;
        let characters = stringToBeDeleted.split('');
        let currentIndex = 0;
        while (currentIndex < characters.length) {

            // If there is only one string remaining then delete the reference from the node thereby trimming the trie entirely from that point
            if (nodeTraverser.descriptorsForReading.length == 1) {
                let nodeToDelete = nodeTraverser;
                nodeTraverser.descriptorsForReading.splice(0, 1);
                nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);
                nodeToDelete.characters.clear();
                currentIndex++;
                continue;
            }

            // Find the entry of the specific string in the descriptorsForReading array and remove it
            for (let i = 0; i < nodeTraverser.descriptorsForReading.length; i++) {
                if (nodeTraverser.descriptorsForReading[i].string == stringToBeDeleted) {
                    nodeTraverser.descriptorsForReading.splice(i, 1);
                    break;
                }
            }
            nodeTraverser = nodeTraverser.characters.get(characters[currentIndex]);

            currentIndex++;
        }
        nodeTraverser.EndOfWord = false;

        return true;

    }

    // getPossibleMatches takes a non-empty string as a prefix and returns all strings with that prefix
    // Currently implemented in such a way that the strings are alreay sorted so retrieval is quick
    getPossibleMatches(prefixString) {
        if ((typeof prefixString) != "string")
            throw new TypeError("The getPossibleMatches function can only accept strings as parameters");
        if (prefixString == "")
            return [];


        // Traverse through the trie to get to the specific node that corresponds to the end of the prefix tree
        let nodeTraverser = this.root;
        let characters = prefixString.split('');
        let currentIndex = 0;

        while (nodeTraverser != null && nodeTraverser != undefined && currentIndex < characters.length) {
            nodeTraverser = nodeTraverser.characters.get(characters[currentIndex++]);
        }
        if (nodeTraverser == null)
            return [];

        // Get the maximum number of strings to read and also grab the list of strings to read
        let numberOfStringsToRead = getNumberOfStringsToRead(nodeTraverser.descriptorsForReading, this.maxReadLimit, this.readMethod);
        let listOfStrings = nodeTraverser.descriptorsForReading.map((descriptor) => { return descriptor.string });

        // Return the specified amount of strings in reverse from the end of the list due to reversed sorting
        return listOfStrings.slice(nodeTraverser.descriptorsForReading.length - numberOfStringsToRead, nodeTraverser.descriptorsForReading.length).reverse();
    }

    // setMaxReadLimit takes a newLimit number and limitMethod should either be "AMOUNT" or "PERCENTAGE
    // the values are set if the input is valid
    setMaxReadLimit(newLimit, limitMethod = "AMOUNT") {
        if ((typeof newLimit) != "number" || (typeof limitMethod) != "string")
            return;

        if (limitMethod == "AMOUNT") {
            this.readMethod = "AMOUNT";
            // 1 to Number.MAX_SAFE_INTEGER is the acceptable range for a processing safe number
            if (newLimit < 1 || newLimit > Number.MAX_SAFE_INTEGER)
                throw new Error(`Read limit percentage must be between 1 and ${Number.MAX_SAFE_INTEGER}`);
        }
        else if (limitMethod == "PERCENTAGE") {
            // 1 to 100 is the acceptable range for a percentage
            if (newLimit < 1 || newLimit > 100)
                throw new Error("Read limit percentage must be between 1 and 100");
            this.readMethod = "PERCENTAGE";
        }
        else
            throw new Error("Read limit method not valid");

        this.maxReadLimit = newLimit;
    }

    // setMaxDeletionLimit takes a newLimit number and limitMethod should either be "AMOUNT" or "PERCENTAGE"
    // the values are set if the input is valid
    setMaxDeletionLimit(newLimit, limitMethod="AMOUNT") {
        if ((typeof newLimit) != "number" || (typeof limitMethod) != "string")
            throw new TypeError("The setMaxDeletion function Limit first parameter must be a number and the second should be either \"AMOUNT\" or \"PERCENTAGE\"");

        if (limitMethod == "AMOUNT") {
            this.deletionMethod = "AMOUNT";
            // 1 to Number.MAX_SAFE_INTEGER is the acceptable range for a processing safe number
            if (newLimit < 1 || newLimit > Number.MAX_SAFE_INTEGER)
                throw new Error(`Deletion limit percentage must be between 1 and ${Number.MAX_SAFE_INTEGER}`);
        }
        else if (limitMethod == "PERCENTAGE") {
            // 1 to 100 is the acceptable range for a percentage
            if (newLimit < 1 || newLimit > 100)
                throw new Error("Deletion limit percentage must be between 0 and 100");
            this.deletionMethod = "PERCENTAGE";
        }
        else
            throw new Error("Deletion limit method not valid");

        this.maxDeletionLimit = newLimit;
    }

    setMaxNumberOfStrings(newLimit) {
        if ((typeof newLimit) != "number")
            throw new TypeError(`The setMaxNumberOfStrings function only takes a number between 1 and ${Number.MAX_SAFE_INTEGER} as a parameter`);
        if ((newLimit < 1 || newLimit > Number.MAX_SAFE_INTEGER))
            throw new TypeError(`The setMaxNumberOfStrings function only takes a number between 1 and ${Number.MAX_SAFE_INTEGER} as a parameter`);

        this.maxStrings = newLimit;
    }

    getAllStrings() {
        return this.root.descriptorsForReading.map((descriptor) => { return descriptor.string });
    }

    getNumberOfStrings() {
        return this.root.descriptorsForReading.length;
    }

    // changeDeletionPriority takes a string matching to the "allowedPriorities" array 
    changeDeletionPriority(deletionPriority) {
        if ((typeof deletionPriority) != "string") {
            throw new TypeError(`The changeDeletionPriority function only takes a string as a parameter`);
        }
        if (!allowedPriorities.includes(deletionPriority)) {
            throw new TypeError(`The changeDeletionPriority function only takes \"MRU\", \"LRU\", \"Shortest\", \"Longest\", or \"Lexicographically\" as parameters`);
        }

        // If the deletion priority has changed, update the sorting method and sort the descriptorsForDeletion array for quick deletions
        if (this.deletionPriority != deletionPriority) {
            this.deletionPriority = deletionPriority;
            this.deletionComparison = getPriority(deletionPriority);
            SortStringDescriptors(this.descriptorsForDeletion, this.deletionComparison);
        }
    }

        
    // changeReadPriority takes a string matching to the "allowedPriorities" array
    changeReadPriority(readPriority) {
        if ((typeof readPriority) != "string") {
            throw new TypeError(`The changeReadPriority function only takes a string as a parameter`);
        }
        if (!allowedPriorities.includes(readPriority)) {
            throw new TypeError(`The changeReadPriority function only takes \"MRU\", \"LRU\", \"Shortest\", \"Longest\", or \"Lexicographically\" as parameters`);
        }

        if (this.readPriority != readPriority) {
            this.readPriority = readPriority;
            this.readComparison = getPriority(readPriority);

            // Traverse through the entire tree using a breadth first traversal and sort descriptorsForReading on each node for quick reads
            let bfsQueue = [];
            bfsQueue.push(this.root);

            while (bfsQueue.length > 0) {

                SortStringDescriptors(bfsQueue[0].descriptorsForReading, this.readComparison);
                for (let node of bfsQueue[0].characters.values()) {
                    bfsQueue.push(node);
                }
                bfsQueue.shift();// delete the first element of the array
            }

        }
    }

}






////////// TextSearchStore class private functions

function SortStringDescriptors(descriptors, comparator) {
    descriptors.sort(comparator);
}

function getPriority(priority) {

    if (priority == "LRU") {
        return LRUComparison;
    }
    if (priority == "MRU") {
        return MRUComparison;
    }
    if (priority == "Shortest") {
        return ShortestComparison;
    }
    if (priority == "Longest") {
        return LongestComparison;
    }
    if (priority == "Lexicographically") {
        return LexicalComparison;
    }

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

// For determining truth value from comparator which returns -1, 0, or 1
function FirstIsLessThanSecond(num) {
    if (num <= 0)
        return true;
    return false;
}

// AddDescriptorByPriority places a newStringDescriptor into the descriptor array in priority order based on a specified comparator
function AddDescriptorByPriority(newStringDescriptor, descriptors, comparator) {
    if (descriptors.length == 0) {
        descriptors.push(newStringDescriptor);
        return;
    }

    // If the new descriptor belongs at the end place it there before looping
    // this optimization is most beneficial for Least recently used and most recently used sorting.
    const lastDescriptor = descriptors[descriptors.length - 1];
    if (FirstIsLessThanSecond(comparator(lastDescriptor, newStringDescriptor))) {
        descriptors.push(newStringDescriptor);
        return;
    }

    // loop through the array and enter the newStringDescriptor in the correct priority order
    for (let ind = 0; ind < descriptors.length; ind++) {
        if (FirstIsLessThanSecond(comparator(newStringDescriptor, descriptors[ind]))) {
            descriptors.splice(ind, 0, newStringDescriptor);
        }
    }
}




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

// getNumberOfStringsToDelete calculates the correct number of strings to delete based on deletion method and the number of descriptorsForDeletion present
function getNumberOfStringsToDelete(descriptorsForDeletion, maxDeletionLimit, deletionMethod) {
    let numberOfStringsToDelete = 0;

    if (deletionMethod == "AMOUNT") {
        numberOfStringsToDelete = maxDeletionLimit;
        if (numberOfStringsToDelete > descriptorsForDeletion.length)
            numberOfStringsToDelete = descriptorsForDeletion.length;
    }
    else if (deletionMethod == "PERCENTAGE") {
        numberOfStringsToDelete = Math.ceil((maxDeletionLimit * .01) * descriptorsForDeletion.length);
        if (numberOfStringsToDelete > descriptorsForDeletion.length)
            numberOfStringsToDelete = descriptorsForDeletion.length;
    }
    
    return numberOfStringsToDelete;
}

// getNumberOfStringsToDelete calculates the correct number of strings to read based on read method and the number of descriptorsForReading present
function getNumberOfStringsToRead(descriptorsForReading, maxReadLimit, readMethod) {
    let numberOfStringsToRead = 0;

    if (readMethod == "AMOUNT") {
        numberOfStringsToRead = maxReadLimit;
        if (numberOfStringsToRead > descriptorsForReading.length)
            numberOfStringsToRead = descriptorsForReading.length;
    }
    else if (readMethod == "PERCENTAGE") {
        numberOfStringsToRead = Math.ceil((maxReadLimit * .01) * descriptorsForReading.length);
        if (numberOfStringsToRead > descriptorsForReading.length)
            numberOfStringsToRead = descriptorsForReading.length;
    }

    return numberOfStringsToRead;
}

//// Helper Classes used by TextSearchStoreClass

// The TrieNode class is the building block for the TextSearchStore trie data structure
class TrieNode {

    constructor() {
        this.characters = new Map();
        this.descriptorsForReading = [];
        this.EndOfWord = false;
    }
}

// The StringDescriptor class allows for the sorting of string data for reading and deleting from the TextSearchStore trie data structure
class StringDescriptor {

    constructor(newString) {
        this.string = newString;
        this.accesses = [];
        this.accesses.push(Date.now());
    }

}