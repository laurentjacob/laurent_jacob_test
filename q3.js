/**
 *
 * At Ormuco, we want to optimize every bits of software we write. 
 * Your goal is to write a new library that can be integrated to the Ormuco stack. 
 * Dealing with network issues everyday, latency is our biggest problem. 
 * Thus, your challenge is to write a new Geo Distributed LRU (Least Recently Used) cache with time expiration. 
 * This library will be used extensively by many of our services so it needs to meet the following criteria:
 * 
 * 1 - Simplicity. Integration needs to be dead simple.
 * 2 - Resilient to network failures or crashes.
 * 3 - Near real time replication of data across Geolocation. Writes need to be in real time.
 * 4 - Data consistency across regions
 * 5 - Locality of reference, data should almost always be available from the closest region
 * 6 - Flexible Schema
 * 7 - Cache can expire
 * 
 */

 // First step is to write an LRU cache
 // We will utilize two data structures. 
 // 1. Doubly linked list to keep track of which ones were used last
 // 2. Hashmap to access elements

/**
 * Definition of the doubly linked list. Stores key, val and reference to neighboring nodes
 */
class Node {
  constructor(key, val, prev = null, next = null, timeout = null) {
    this.key = key
    this.val = val
    this.prev = prev
    this.next = next
    this.timeout = timeout
  }

  clone() {
    // recursively clone
    return new Node(this.key, this.val, this.prev ? prev.clone() : null, this.next ? next.clone() : null, this.timeout)
  }
}


/**
 * This is the definition of the LRU cache
 * Implements an regulat LRU cache with automatic timeout removal a certain time
 * Keys are strings
 * Values can be anything (flexible schema)
 */
class LRU {

    /*
     * @param limit {number} is the number of elements the LRU can take in
     * @param timeLimit {number} is the time limit of any node if it is not used (automatically removed) 
     */
    constructor(limit = 10, timeLimit = 60000) {
        this.length = 0
        this.limit = limit
        this.timeLimit = timeLimit
        this.head = null
        this.tail = null
        this.cache = {}
    }

    remove(key){
        let node = this.cache[key]

        // Don't do anything if that node doesn't exist
        if (!node) {
            return
        }

        // Clear the timeout to avoid calling for no reason later
        clearTimeout(node.timeout)

        // Doubly linked list node removal (bind next to prev if prev exists, otherwise it's the head)
        if (node.prev !== null) {
            node.prev.next = node.next
        } else {
            this.head = node.next
        }

        // Doubly linked list node removal (bind prev to next if next exists, otherwise it's the tail)
        if (node.next !== null) {
            node.next.prev = node.prev
        } else {
            this.tail = node.prev
        }

        // Delete the element from the cache hashmap
        delete this.cache[key]
        this.length--
    }

    isAtLimit() {
        return this.length === this.limit
    }

    read(key) {
        let node = this.cache[key]

        if (node) {
            // Store the val, because we will remove it first
            let val = node.val

            // Remove and put it at the beginning of the cache
            this.remove(key)
            this.write(key, val)
        }
    }

    // Can pass a specific timeLimit to certain value that overrides the LRU level timeLimit
    write(key, val, timeLimit = null) {

        // If the key already exist, remove it and add the new value
        if (this.cache[key]) {
            this.remove(key)
        }

        // If we are at the max capacity, we need to remove the tail
        if (this.isAtLimit()) {
            this.remove(this.tail.key)
        }

        // Remove key after time limit
        let timeoutTime = timeLimit || this.timeLimit
        let timeout = setTimeout(() => {
            this.remove(key)
        }, timeoutTime)

        // If there are no elements yet 
        if (this.length === 0) {
            let node = new Node(key, val, null, null, timeout)
            this.head = node
            this.tail = node
        } else {
            let node = new Node(key, val, null, this.head, timeout)

            this.head.prev = node
            this.head = node
        }

        this.cache[key] = this.head

        this.length++
    }

    printAll() {
        if (this.length === 0) {
            console.log("Cache is empty")
        }

        let currentNode = this.head
        while (currentNode) {
            console.log(currentNode.key, currentNode.val)

            currentNode = currentNode.next
        }

        console.log("\n")
    }

}

// GlobalLRU is the central point of authority for the LRU caches.
// It updates other LRUs based on what they do. GlobalLRU is never modified directly
// It updates based on what other LRUs are doing and updates the other LRUs after that
// This design lacks single point of failure protection. Would need to have some sort of globalLRU redundancy
class GlobalLRU extends LRU {
    constructor(limit = 10, timeLimit = 60000) {
        super(limit, timeLimit)
        this.lrus = {}
    }

    addLRU(lruKey, lru) {
        this.lrus[lruKey] = lru
    }

    removeLRU(lruKey) {
        delete this.lrus[lruKey]
    }

    read(key, lruKey) {
        super.read(key)

        let lruKeys = Object.keys(this.lrus)

        for (let i = 0; i < lruKeys.length; i++) {
            if (lruKeys[i] !== lruKey) {
                this.lrus[lruKeys[i]].updateRead(key)
            }
        }
    }

    write(key, val, timeLimit, lruKey) {
        super.write(key, val, timeLimit)

        let lruKeys = Object.keys(this.lrus)

        for (let i = 0; i < lruKeys.length; i++) {
            if (lruKeys[i] !== lruKey) {

                let lru = this.lrus[lruKeys[i]]

                this.lrus[lruKeys[i]].updateWrite(key, val, timeLimit)
            }
        }
    }
}

class CanadaLRU extends LRU {
    constructor(globalLRU, limit = 10, timeLimit = 60000) {
        super(limit, timeLimit)
        this.lruKey = 'canada'
        this.globalLRU = globalLRU

        // If globalLRU is not empty, you need to copy the content into this LRU
        if (this.globalLRU.length > 0) {
            this.head = this.globalLRU.head.clone()
            this.tail = this.globalLRU.tail.clone()
            this.length = this.globalLRU.length
            this.cache = {...this.globalLRU.cache}
        }
    }

    read(key) {
        super.read(key)
        this.globalLRU.read(key, this.lruKey)
    }

    // Called from globalLRU
    updateRead(key) {
        super.read(key)
    }

    write(key, val, timeLimit) {
        super.write(key, val, timeLimit)
        this.globalLRU.write(key, val, timeLimit, this.lruKey)
    }

    // Called from globalLRU
    updateWrite(key, val, timeLimit) {
        super.write(key, val, timeLimit)
    }
}

class USALRU extends LRU {
    constructor(globalLRU, limit = 10, timeLimit = 60000) {
        super(limit, timeLimit)
        this.lruKey = 'usa'
        this.globalLRU = globalLRU
    }

    read(key, val, time) {
        super.read(key)
        this.globalLRU.read(key, this.lruKey)
    }

    // Called from globalLRU
    updateRead(key) {
        super.read(key)
    }

    write(key, val, timeLimit) {
        super.write(key, val, timeLimit)
        this.globalLRU.write(key, val, timeLimit, this.lruKey)
    }

    updateWrite(key, val, timeLimit) {
        super.write(key, val, timeLimit)
    }
}





function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
    let lru = new LRU()

    lru.write('key1', 111)
    lru.write('key2', 222)
    lru.write('key3', 333)
    lru.printAll()

    lru.read('key1')
    lru.printAll()

    lru.write('key4', 444)
    lru.printAll()

    // Store for one second
    lru.write('key5', 555, 1000)
    lru.printAll()

    await sleep(1500)
    // Value timed out and was removed automatically
    lru.printAll()
}

async function geoLRUDemo() {
    let globalLRU = new GlobalLRU()
    let canadaLRU = new CanadaLRU(globalLRU)
    let usaLRU = new USALRU(globalLRU)

    globalLRU.addLRU(canadaLRU.lruKey, canadaLRU)
    globalLRU.addLRU(usaLRU.lruKey, usaLRU)


    canadaLRU.write('a', 111)
    canadaLRU.printAll()

    // We wrote to canada, therefore usa should have been updated through global
    usaLRU.printAll()
}

async function fullDemo() {
    console.log("SIMPLE LRU")
    await demo()

    console.log("GEO LRU")
    await geoLRUDemo()
}

fullDemo()





