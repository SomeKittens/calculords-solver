/* global onmessage, postMessage */
'use strict';

// TODO: Show solutions that use lots of cards but don't use all numbers
// For instance, second round

// TODO: prioritize certain cards

// Need a bunch of functions instead of straight eval to consider both sides of subtraction
// This way we can track what operations happened over time
let operations = [(a, b) => {
  return {
    str: `${a} + ${b}`,
    result: a + b
  };
}, (a, b) => {
  return {
    str: `${a} - ${b}`,
    result: a - b
  };
}, (a, b) => {
  return {
    str: `${b} - ${a}`,
    result: b - a
  };
}, (a, b) => {
  return {
    str: `${a} * ${b}`,
    result: a * b
  };
}];

/**
 * Run the things!
 * @param  {int[]} cards    The numbers of the target cards
 * @param  {int[]} initInts The initial integer cards we're given
 * @return {Solution[]}     The set of possible solutions to the given inputs
 */
function runLevel(cards, initInts) {
  let solutions = [];
  let paths = {};

  // Used for checking how many times each section was called
  // Don't want console.count, we only care about the final number
  let called = 0;
  let doneCheck = 0;
  let doneDone = 0;
  let search = 0;

  // How many times will we run through the original for loop?
  let totalWork = (initInts.length * (initInts.length - 1) / 2);
  let doneWork = 0;

  cards = cards.sort();
  initInts = initInts.sort();

  /**
   * Recursive function for searching the solution space
   * @param  {string[]} stack Operations that have been done so far
   * @param  {int[]} ints  Current integer cards
   * @param  {Boolean} init  Is this the first run?  (used for postMessage progress bar)
   */
  function explore (stack, ints, init) {
    called++;
    ints = ints.sort();

    // If we've already gone down this path, no need to redo work
    let key = ints.join();
    if (paths[key]) {
      return;
    } else {
      paths[key] = true;
    }


    // Base cases
    if (ints.length <= cards.length) {
      doneCheck++;
      // We're done if all of the ints we have match (uniquely) cards
      let j = 0;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i] === ints[j]) {
          // Match, increment both
          j++;
        }
      }

      // If all of the integer cards have matches, we've got a solution!
      if (j === ints.length) {
        doneDone++;

        // This check may be redundant with the dynamic programming stuff above
        let alreadyFound = solutions.some(function alreadyFound(s) {
          if (s.ints.length !== ints.length) { return false; }
          return s.ints.every(function intEvery(int, idx) {
            return int === ints[idx];
          });
        });
        if (!alreadyFound) {
          solutions.push({
            stack: stack,
            ints: ints
          });
        }
        return;
      }
    }

    // We're done if we only have one number left (and it doesn't match a card)
    if (ints.length === 1) { return; }

    // Search!
    search++;

    // We pull two numbers out of our set of integers & apply all of the operations
    // There's a lot of array shifting here but it's needed since we need to create a 'new' set of #'s
    for (let i = 0; i < ints.length; i++) {
      let left = ints[i];
      let localInts = ints.slice();
      localInts.splice(i, 1);

      for (let j = i; j < localInts.length; j++) {
        let right = localInts.splice(j, 1)[0];

        for (let k = 0; k < operations.length; k++) {
          let r = operations[k](left, right);

          explore(stack.concat(r.str), localInts.concat(r.result));
        }
        if (init) {
          postMessage(++doneWork / totalWork);
          console.log(left, right);
        }
        localInts.unshift(right);
      }
      localInts.unshift(left);
    }
  }

  explore([], initInts, true);

  // Some statistics, because everyone loves stats!
  console.log('`explore` was called', called.toLocaleString(), 'times');
  console.log('`explore` (raw)', called);
  console.log('`done check` was called', doneCheck.toLocaleString(), 'times');
  console.log('`done check` (raw)', doneCheck);
  console.log('`doneDone check` was called', doneDone.toLocaleString(), 'times');
  console.log('`doneDone check` (raw)', doneDone);
  console.log('`search check` was called', search.toLocaleString(), 'times');
  console.log('`search check` (raw)', search);

  return solutions;
}

onmessage = function(e) {
  console.time('calc');
  var result = runLevel(e.data.cards, e.data.nums);
  console.timeEnd('calc');
  postMessage(result);
};