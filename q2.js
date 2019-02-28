/**
 * The goal of this question is to write a software library that accepts 2 version string as input 
 * and returns whether one is greater than, equal, or less than the other. 
 * As an example: “1.2” is greater than “1.1”. 
 * Please provide all test cases you could think of.
 */

/**
 * This is the error to encapsulate input errors
 */
class InvalidInputError extends Error {
    constructor(message, data) {
        super(message)
        this.data = data
    }
}

/**
 * 
 * @param {string} v1 is a version input as a string
 * @param {string} v2 is a version input as a string
 *
 * @return {number} (1, 0, -1). 
 *            1 if v1 > v2, 
 *            0 if v1 = v2,
 *            -1 if v1 < v2,
 */
let q2 = function(v1, v2) {
    let v1Arr = []
    let v2Arr = []
    try {
        v1Arr = validate(v1)
        v2Arr = validate(v2)
    } catch (e) {
        if (e instanceof InvalidInputError) {
            console.log(e.message, e.data)
        }

        return
    }

    let minLen = Math.min(v1Arr.length, v2Arr.length)

    // Loop through the arrays and compare the numbers
    for (let i = 0; i < minLen; i++) {
        if (v1Arr[i] > v2Arr[i]) {
            return 1
        }

        if (v2Arr[i] > v1Arr[i]) {
            return -1
        }
    }

    // If they are equal, check whether one has more numbers than the other
    if (v1Arr.length > v2Arr.length) {
        // Check whether the extra numbers are all zeroes
        for (let i = v2Arr.length; i < v1Arr.length; i++) {
            // If they aren't, return that v1 > v2
            if (v1Arr[i] !== 0) {
                return 1
            }
        }

        // Otherwise they are equal
        return 0
    }

    // Same logic as above if statement but reversing the roles
    if (v2Arr.length > v1Arr.length) {
        for (let i = v1Arr.length; i < v2Arr.length; i++) {
            if (v2Arr[i] !== 0) {
                return -1
            }
        }

        return 0
    }

    // If all of the above doesn't return, the versions are equal
    return 0
}

/**
 * @param {string} v is a version input as a string
 * 
 * @return {array{number}} of version split by dots
 * @throws {InvalidInputError} if v1 or v2 is invalid
 */
let validate = function(v) {
    // 1. Validate the input is a string and is not empty
    // 2. Validate that the string contains valid characters
    //       Valid characters are numbers from 0 to 9 and .
    // 3. Validate that there aren't 2 dots in a row
    // 4. Validate that the string cannot start or end with a dot

    if (typeof v !== 'string') {
        throw new InvalidInputError(`INVALID: Input should be a string`, {versionString: v})
    }

    if (v.length === 0) {
        throw new InvalidInputError(`INVALID: Input string is empty`, {versionString: v})
    }

    // Version stored as an array of numbers
    let vArr = []

    // Keep track of the dots
    let foundDot = false

    // Current number building as we search for dots
    let currentNumber = 0
    for (let i = 0; i < v.length; i++) {
        let charCode = v.charCodeAt(i)

        if (charCode == 46) {
            // If already found a dot, can't have two in a row
            if (foundDot) {
                throw new InvalidInputError(`INVALID: Two dots in a row at position ${i}`, {versionString: v})
            }

            // Can't start of end with a dot
            else if (i === 0 || i === v.length - 1) {
                throw new InvalidInputError(`INVALID: Version cannot start or end with a dot`, {versionString: v})
            }

            foundDot = true
            // Since we found a dot, insert the number
            vArr.push(currentNumber)
            // Reset the number
            currentNumber = 0
        }

        else if (charCode >= 48 && charCode <= 57) {
            foundDot = false

            currentNumber = (currentNumber * 10) + parseInt(v.charAt(i))
        }

        // If we didn't find a valid character, throw an InvalidInputError
        else {
            throw new InvalidInputError(`INVALID: Character at position ${i} is invalid`, {versionString: v})
        }
    }

    // Push the last number in
    vArr.push(currentNumber)

    return vArr
}

/**
 * @param {string} v1 the version as a string
 * @param {string} v2 the version as a string
 * @param {number} result is the return value of q2
 *
 * @param {string} the string showing what the result means
 */
let display = function(v1, v2, result) {

    if (!v1 || !v2) {
        return
    }

    if (result === 1) {
        return `${v1} is greater than ${v2}`
    }
    else if (result === 0) {
        return `${v1} is equal to ${v2}`
    }
    else {
        return `${v1} is smaller than ${v2}`
    }
}

/**
 * Runs and prints test results
 *
 * @param {object} testcase containing v1 and v2
 */
let runTest = function(testCase) {
    console.log(`q2("${testCase.v1}", "${testCase.v2}")\t`)

    let result = q2(testCase.v1, testCase.v2)
    if (typeof result !== 'undefined') {
        console.log(display(testCase.v1, testCase.v2, result))
    }

    console.log('\n')
}

let test1 = {
    v1: "1.1",
    v2: "1.2"
}

let test2 = {
    v1: "1.2",
    v2: "1.2"
}

let test3 = {
    v1: "1.2",
    v2: "1.1"
}

let test4 = {
    v1: "1.1.1",
    v2: "1.1"
}

let test5 = {
    v1: "1.1.0",
    v2: "1.1"
}

let test6 = {
    v1: "1.1.0",
    v2: "1.1.0.0.0"
}

runTest(test1)
runTest(test2)
runTest(test3)
runTest(test4)
runTest(test5)
runTest(test6)


let test7 = {
    v1: "a",
    v2: "1.2"
}

let test8 = {
    v1: "1.a",
    v2: "1.2"
}

let test9 = {
    v1: "1..2",
    v2: "1.2"
}

let test10 = {
    v1: ".1.2",
    v2: "1.2"
}

let test11 = {
    v1: "1.2.",
    v2: "1.2"
}

let test12 = {
    v1: {v1: "1.2"},
    v2: "1.2"
}

let test13 = {
    v1: "1.2",
    v2: ""
}

runTest(test7)
runTest(test8)
runTest(test9)
runTest(test10)
runTest(test11)
runTest(test12)
runTest(test13)

