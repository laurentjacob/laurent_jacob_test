/**
 * Your goal for this question is to write a program that accepts two lines (x1,x2) and (x3,x4) 
 * on the x-axis and returns whether they overlap.
 *  
 * As an example, (1,5) and (2,6) overlaps but not (1,5) and (6,8).
 */

/**
 * @param {number} x1 First point of the first line
 * @param {number} x2 Second point of the first line
 * @param {number} x3 First point of the second line
 * @param {number} x4 Second point of the second line
 * 
 * @return {bool} if the line (x1, x2) overlaps the line (x3, x4)  
 */
let q1 = function(x1, x2, x3, x4) {

    // If the inputs are reversed, swap the values so that the x1,x2 and x3,x4 pairs are ordered
    // and logic after doesn't have to consider swapping cases
    if (x2 < x1) {
        let temp = x1
        x1 = x2
        x2 = temp
    }

    if (x4 < x3) {
        let temp = x3
        x3 = x4
        x4 = temp
    }

    // If any of the starting of ending point overlaps the other pair, they overlap
    if (x1 == x3 || x1 == x4 || x2 == x3 || x2 == x4) {
        return true
    }

    // If the starting point of the second line is further than the first one,
    // They will only overlap if the endpoint of the first line is after the start point of the second line
    if (x3 > x1 && x2 > x3) {
        return true
    }

    // Vice versa from if statement above
    if (x1 > x3 && x4 > x1) {
        return true
    }

    // If the above fails, then they do not overlap
    return false
}

// Test cases
console.log("q1(1,5,2,6)\t", q1(1,5,2,6))
console.log("q1(1,5,6,8)\t", q1(1,5,6,8))
console.log("q1(0,0,0,0)\t", q1(0,0,0,0))
console.log("q1(0,0,1,1)\t", q1(0,0,1,1))
console.log("q1(0,-1,2,1)\t", q1(0,-1,2,1))
console.log("q1(0,1,1,2)\t", q1(0,1,1,2))
console.log("q1(2,1,1,2)\t", q1(2,1,1,2))
console.log("q1(-4,-2,-3,-1)\t", q1(-4,-2,-3,-1))