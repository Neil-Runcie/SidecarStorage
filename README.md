# SidecarStorage
***
JavaScript storage data structures with optional persistence

## What is SidecarStorage
---
SidecarStorage provides data structures that offer capabilities expected from database interactions without the need for a separate database or any extra user logic.
A Key-Value data structure is available for mimicking data storage by relational databases as well as noSQL depending on the usage
A Text Search data structure based on a trie is offered for quick text searches and text predictions.
Persistence is possible using a database management system like wrapper that allows local disk saving and loading of data structure data.


## Installation
---
sidecarstorage can be installed using 
`npm i sidecarstorage`

## Usage
---
All functionality of sidecarstorage can be used by importing DBMS from the package 
`import { DBMS } from "sidecarstorage";
// Initializes the database management system like wrapper as a singleton
const dbms = new DBMS();`