/* global onmessage */

'use strict';

// TODO: Show solutions that use lots of cards but don't use all numbers
// For instance, second round

// TODO: prioritize certain cards

// Need a bunch of functions instead of straight eval to consider both sides of subtraction
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


function runLevel(cards, initInts) {
  let solutions = [];

  function explore (stack, ints) {
    // Base cases

    if (ints.length <= cards.length) {
      // We're done if all of the ints we have match (uniquely) cards
      let localCards = cards.slice(0);
      let done = ints.every(input => {
        let idx = localCards.indexOf(input);
        if (idx !== -1) {
          localCards.splice(idx, 1);
          return true;
        }
        return false;
      });

      if (done) {
        let sortedInts = ints.sort();
        let alreadyFound = solutions.some(s => {
          if (s.ints.length !== ints.length) { return false; }
          return s.ints.sort().every((int, idx) => {
            return int === sortedInts[idx];
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
    for (let i = 0; i < ints.length; i++) {
      let left = ints[i];
      let remaining = ints.slice(i+1);
      while (remaining.length) {
        let right = remaining.shift();
        for (let k = 0; k < operations.length; k++) {
          let r = operations[k](left, right);

          explore(stack.concat(r.str), remaining.concat(r.result));
        }
      }
    }
  }

  explore([], initInts);

  return solutions;
}

// onmessage = function(e) {
//   var result = runLevel(e.data.cards, e.data.nums);
//   console.log('worker result:', result);
//   postMessage(result);
// };